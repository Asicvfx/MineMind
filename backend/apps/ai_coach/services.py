"""AI Coach — hybrid: local CSP solver first, OpenAI LLM as fallback.

For deterministic situations (number == flagged neighbours → safe; or
number - flagged == unrevealed → all unrevealed are mines) we don't need the
LLM at all — the Python solver returns the correct answer immediately.
The LLM is only used when no deterministic move exists, to give a
probabilistic suggestion. The LLM's response is always validated against the
list of actually-unrevealed cells so it can't suggest an already-open cell.
"""

import json
import logging
from typing import Any, Iterator

from django.conf import settings

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """Ты — AI-коуч для Сапёра. Тебя зовут когда у игрока НЕТ 100% детерминированного хода
(детерминированные ходы уже посчитаны в Python-решателе до тебя). Твоя задача — выбрать клетку
с наименьшей вероятностью мины и кратко объяснить почему.

ВХОД:
- Доска в виде сетки символов, где:
  ?  — неоткрытая клетка
  F  — флаг (предполагаемая мина)
  .  — открытая клетка с 0 минами рядом
  1-8 — открытая клетка с числом мин среди 8 соседей
- Список НЕОТКРЫТЫХ клеток с координатами [row, col]

КРИТИЧНО:
- Флаги игрока не гарантированно верные. Если опираешься на них, явно скажи это в explanation.
- Не считай любой флаг автоматическим доказательством мины без перепроверки числами вокруг.
- Поле "cell" в ответе ОБЯЗАТЕЛЬНО должно быть из списка неоткрытых клеток.
- НЕ предлагай клетки с числом, точкой или флагом.
- verdict почти всегда "uncertain" (детерминированные случаи отсечены до тебя).
  Если ты твёрдо уверен — можно "safe" или "mine".

ОТВЕТ — строго JSON:
{"verdict": "safe"|"mine"|"uncertain", "cell": [row, col], "explanation": "2-3 предложения на русском"}

В explanation объясни логику: какие клетки/числа ты учёл, почему именно эта клетка лучший выбор."""


def _neighbours(r: int, c: int, rows: int, cols: int) -> Iterator[tuple[int, int]]:
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                yield nr, nc


def board_to_string_grid(board: list[list[dict]]) -> list[list[str]]:
    """Frontend board state → single-char grid the solver/LLM consume."""
    grid = []
    for row in board:
        row_out = []
        for cell in row:
            if cell.get("isFlagged"):
                row_out.append("F")
            elif not cell.get("isRevealed"):
                row_out.append("?")
            else:
                n = cell.get("neighborMines", 0)
                row_out.append(str(n) if n > 0 else ".")
        grid.append(row_out)
    return grid


def local_solver(grid: list[list[str]], rows: int, cols: int) -> dict[str, Any] | None:
    """Find a guaranteed-safe or guaranteed-mine cell via simple CSP rules.

    For every numbered cell N at (r, c):
      Let F = flagged neighbours, U = unrevealed (?) neighbours.
      - If F == N and U > 0 → every cell in U is safe.
      - If F + len(U) == N → every cell in U is a mine.
    Returns the first such cell, or None if nothing is deterministic.
    """
    for r in range(rows):
        for c in range(cols):
            ch = grid[r][c]
            if ch not in "12345678":
                continue
            n = int(ch)
            flagged: list[tuple[int, int]] = []
            unrevealed: list[tuple[int, int]] = []
            for nr, nc in _neighbours(r, c, rows, cols):
                nch = grid[nr][nc]
                if nch == "F":
                    flagged.append((nr, nc))
                elif nch == "?":
                    unrevealed.append((nr, nc))

            if not unrevealed:
                continue

            # All unrevealed neighbours are mines.
            if len(flagged) + len(unrevealed) == n:
                tr, tc = unrevealed[0]
                # This deduction stands regardless of flag correctness — the
                # arithmetic is "everything not-yet-touched here is a mine".
                return {
                    "verdict": "mine",
                    "cell": [tr, tc],
                    "explanation": (
                        f"Клетка [{r},{c}] показывает {n}. Вокруг неё {len(flagged)} "
                        f"флаг(а/ов) + {len(unrevealed)} неоткрыт(ая/ые) = {n}. "
                        f"Значит все неоткрытые соседи — мины. Ставь флаг."
                    ),
                }

            # All unrevealed neighbours are safe — BUT this conclusion only
            # holds if the player's flags are actually on mines.
            if len(flagged) == n and n > 0:
                tr, tc = unrevealed[0]
                return {
                    "verdict": "safe",
                    "cell": [tr, tc],
                    "explanation": (
                        f"Клетка [{r},{c}] показывает {n}, и рядом уже {n} флаг(ов). "
                        f"ЕСЛИ эти флаги стоят верно — остальные неоткрытые соседи безопасны. "
                        f"Сначала перепроверь флаги."
                    ),
                }
            # Edge case: number=0 already handled by flood fill, but if it's
            # exposed somehow and there are unrevealed cells, they're safe.
            if n == 0 and len(flagged) == 0:
                tr, tc = unrevealed[0]
                return {
                    "verdict": "safe",
                    "cell": [tr, tc],
                    "explanation": (
                        f"Клетка [{r},{c}] показывает 0 — все соседи безопасны."
                    ),
                }
    return None


def _first_unrevealed(grid: list[list[str]], rows: int, cols: int) -> tuple[int, int] | None:
    """Pick a corner-ish unrevealed cell as a sane fallback."""
    # Prefer corners — statistically a slightly better opener than edges.
    candidates = [(0, 0), (0, cols - 1), (rows - 1, 0), (rows - 1, cols - 1)]
    for r, c in candidates:
        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == "?":
            return (r, c)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "?":
                return (r, c)
    return None


def _format_grid(grid: list[list[str]], rows: int, cols: int) -> str:
    """Human-readable labelled grid (R/C indices) for the LLM."""
    col_header = "     " + " ".join(f"C{c:02d}" for c in range(cols))
    lines = [col_header]
    for r in range(rows):
        cells = "   ".join(grid[r])
        lines.append(f"R{r:02d}: {cells}")
    return "\n".join(lines)


def get_hint(game_state: dict[str, Any], *, is_pro: bool = False) -> dict[str, Any]:
    board = game_state.get("board", [])
    grid = board_to_string_grid(board)
    rows = game_state.get("rows", len(grid))
    cols = game_state.get("cols", len(grid[0]) if grid else 0)
    mines = game_state.get("mines", 0)

    # Collect every "?" cell once — used by validator + LLM prompt.
    unrevealed = [(r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "?"]

    if not unrevealed:
        return {
            "verdict": "uncertain",
            "cell": [0, 0],
            "explanation": "Все клетки уже открыты — играть нечего.",
            "tokens_used": 0,
            "model_used": "none",
        }

    # 1. Try the local CSP solver. Almost-instant, 100% correct when it answers.
    local = local_solver(grid, rows, cols)
    if local:
        return {**local, "tokens_used": 0, "model_used": "local-csp"}

    # 2. Fallback: ask the LLM for a probabilistic suggestion.
    if not settings.OPENAI_API_KEY:
        fallback = _first_unrevealed(grid, rows, cols) or (0, 0)
        return {
            "verdict": "uncertain",
            "cell": list(fallback),
            "explanation": "AI Coach не настроен (нет OPENAI_API_KEY). Попробуй угол.",
            "tokens_used": 0,
            "model_used": "stub",
        }

    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    model = settings.OPENAI_MODEL_PRO if is_pro else settings.OPENAI_MODEL

    unrevealed_text = ", ".join(f"[{r},{c}]" for r, c in unrevealed[:200])
    user_msg = (
        f"Доска {rows}×{cols}, всего мин: {mines}.\n\n"
        f"Состояние:\n{_format_grid(grid, rows, cols)}\n\n"
        f"Неоткрытые клетки (выбирай ТОЛЬКО из этого списка):\n{unrevealed_text}\n\n"
        f"Детерминированных ходов нет — посчитай вероятности и предложи лучший ход."
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=350,
        )
        content = response.choices[0].message.content or "{}"
        parsed = json.loads(content)
    except Exception as exc:
        logger.exception("AI Coach LLM call failed")
        fallback = _first_unrevealed(grid, rows, cols) or (0, 0)
        return {
            "verdict": "uncertain",
            "cell": list(fallback),
            "explanation": f"AI временно недоступен. Попробуй угол.",
            "tokens_used": 0,
            "model_used": model,
        }

    raw_cell = parsed.get("cell", [0, 0]) or [0, 0]
    try:
        r = int(raw_cell[0])
        c = int(raw_cell[1])
    except (TypeError, ValueError, IndexError):
        r, c = -1, -1

    # Validate — the cell must be currently unrevealed.
    unrevealed_set = set(unrevealed)
    if (r, c) not in unrevealed_set:
        fallback = _first_unrevealed(grid, rows, cols) or (0, 0)
        return {
            "verdict": "uncertain",
            "cell": list(fallback),
            "explanation": (
                "AI предложил клетку, которая уже открыта. Беру самую безопасную "
                "по углу — открывай аккуратно."
            ),
            "tokens_used": response.usage.total_tokens if response.usage else 0,
            "model_used": model,
        }

    verdict = parsed.get("verdict", "uncertain")
    if verdict not in ("safe", "mine", "uncertain"):
        verdict = "uncertain"

    return {
        "verdict": verdict,
        "cell": [r, c],
        "explanation": parsed.get("explanation", "")[:400] or "AI не дал объяснения.",
        "tokens_used": response.usage.total_tokens if response.usage else 0,
        "model_used": model,
    }
