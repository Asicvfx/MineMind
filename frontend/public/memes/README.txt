MineMind — meme images for MoodMode
====================================

Drop PNG/JPG files here. The game picks them up automatically (just refresh).

FOLDER STRUCTURE
----------------
  memes/chill/<event>.png   — lighter memes (soft chuckle)
  memes/chaos/<event>.png   — max-energy memes (loud, savage)

EVENT FILE NAMES
----------------
  game_start.png
  flag_correct.png
  flag_wrong.png
  near_loss.png
  near_loss_4.png
  near_loss_5.png
  near_loss_6.png
  streak.png
  win.png
  win_fast.png
  lose.png
  lose_fast.png
  ai_hint_used.png

WHAT EACH MEME SHOULD BE
------------------------
See MEMES_TZ.md in the project root — full brief: meaning of each photo,
the caption text, the vibe, per chill/chaos.

If a file is missing:
  - chaos → falls back to a big emoji (already works)
  - chill → falls back to just the text toast
  - near_loss_4/5/6 → fall back to near_loss

Minimal set (covers 90% of gameplay): win, lose, lose_fast, win_fast, near_loss
× 2 folders = 10 images.

Size: 400-800px, < 400 KB each, square-ish.
