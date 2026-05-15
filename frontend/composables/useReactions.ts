import type { Mood } from '~/stores/settings'

/** Game events that can trigger an emotional reaction. */
export type GameEvent =
  | 'game_start'
  | 'flag_placed'   // any flag placement (neutral — doesn't reveal correctness)
  | 'flag_correct'  // post-game: at end, used as positive reinforcement
  | 'flag_wrong'    // post-game: at end, used for the wrong flags
  | 'near_loss'
  | 'near_loss_4'
  | 'near_loss_5'
  | 'near_loss_6'
  | 'streak'
  | 'win'
  | 'win_fast'
  | 'lose'
  | 'lose_fast'
  | 'ai_hint_used'

export interface Reaction {
  text: string
  /** Emoji shown big in the Chaos popup. Optional (focus/chill don't use it). */
  emoji?: string
}

type ReactionMap = Partial<Record<GameEvent, Reaction[]>>

/**
 * Phrase pools per { mood × event }. A random phrase is picked each time
 * so it never gets stale. Tone: Edgy — savage but no profanity.
 * All phrases/emoji are original or free (no copyrighted meme content).
 *
 * Chaos entries carry an `emoji` — shown HUGE in the popup like a meme sticker.
 * If you drop a real image at /public/memes/<event>.png it overrides the emoji.
 */
const REACTIONS: Record<Mood, ReactionMap> = {
  // Focus — almost silent, dry, no banter. Just the essentials.
  focus: {
    win: [{ text: 'Решено.' }, { text: 'Точно.' }, { text: 'Чисто.' }],
    lose: [{ text: 'Не сошлось.' }, { text: 'Мимо.' }],
  },

  // Chill — warm, friendly, light humor. Small toast, no big images.
  chill: {
    game_start: [
      { text: 'Погнали 🙂' },
      { text: 'Удачи. Дыши ровно.' },
      { text: 'Спокойно, всё получится.' },
    ],
    flag_placed: [
      { text: 'Флаг поставлен 🚩' },
      { text: 'Уверенный ход 🙂' },
      { text: 'Запомним 🚩' },
    ],
    flag_correct: [
      { text: 'Чисто. Хороший read 👍' },
      { text: 'Точно подмечено.' },
      { text: 'Ты это видел заранее — красиво.' },
    ],
    flag_wrong: [
      { text: 'Почти. В следующий раз получится.' },
      { text: 'Этот флаг чуть промахнулся 🙂' },
    ],
    near_loss: [
      { text: 'Пронесло 😮‍💨' },
      { text: 'Близко! Но ты справился.' },
      { text: 'На волоске — но чисто.' },
    ],
    near_loss_4: [
      { text: 'Пронесло 😮‍💨' },
      { text: 'Близко! Но ты справился.' },
      { text: 'На волоске — но чисто.' },
    ],
    near_loss_5: [
      { text: 'Уже жарко. Сбавь темп.' },
      { text: 'Плотная клетка. Тут лучше не спешить.' },
      { text: 'Пять рядом — тут нужна холодная голова.' },
    ],
    near_loss_6: [
      { text: 'Шесть рядом. Это уже почти катастрофа.' },
      { text: 'Очень опасно. Тут один мисклик и конец.' },
      { text: 'Красная зона. Проверяй всё дважды.' },
    ],
    streak: [
      { text: 'Хорошая серия ✨' },
      { text: 'Идёшь ровно, красиво.' },
      { text: 'Поток поймал 🌊' },
    ],
    win: [
      { text: 'Изящно. Ты решал, а не угадывал.' },
      { text: 'Победа! Чистая работа 🎉' },
      { text: 'Вот это контроль 👏' },
    ],
    win_fast: [
      { text: 'Скорость + точность. Уважение.' },
      { text: 'Быстро и аккуратно — топ 🔥' },
      { text: 'Это было стильно.' },
    ],
    lose: [
      { text: 'Минус вайб, плюс опыт. Го ещё раз.' },
      { text: 'Не вышло — не страшно. Попробуй снова.' },
      { text: 'Бывает. Перезагрузка 🔄' },
    ],
    lose_fast: [
      { text: 'Ой, рановато 😅 Бывает.' },
      { text: 'Случается. Снова — и аккуратнее.' },
    ],
    ai_hint_used: [
      { text: 'AI помог — это тоже навык 🙂' },
      { text: 'Хороший выбор — спросить.' },
    ],
  },

  // Chaos — savage, loud, in-your-face. Big emoji popup. Edgy but clean.
  chaos: {
    game_start: [
      { text: 'Поехали. Не обделайся.', emoji: '👀' },
      { text: 'Ну давай, удиви меня.', emoji: '😏' },
      { text: 'Доска готова. А ты?', emoji: '🎮' },
    ],
    flag_placed: [
      { text: 'Поставил? Бойко.', emoji: '🚩' },
      { text: 'Смело. Без сомнений.', emoji: '😤' },
      { text: 'Так-так. Кто-то рискует.', emoji: '🧐' },
      { text: 'Флаг на месте. А мозги?', emoji: '🤔' },
      { text: 'Уверенность есть. Точность — посмотрим.', emoji: '🎯' },
    ],
    flag_correct: [
      { text: 'ОТКУДА ЗНАЛ?? Ты подсматриваешь', emoji: '🤨' },
      { text: 'Слишком точно. Подозрительно.', emoji: '🧐' },
      { text: 'Окей, умно. Только не зазнавайся.', emoji: '🤓' },
      { text: 'Это был чистый read. Кто тебя учил?', emoji: '🎯' },
    ],
    flag_wrong: [
      { text: 'Этот флаг был чистой фантазией', emoji: '🤡' },
      { text: 'Уверенность была. Точности — нет.', emoji: '🃏' },
      { text: 'Флаг наугад, и мы оба это знаем.', emoji: '🤥' },
    ],
    near_loss: [
      { text: 'ОДИН клик от смерти', emoji: '💀' },
      { text: 'Сердечко ещё бьётся?', emoji: '😰' },
      { text: 'Ты был на волоске. Не делай так.', emoji: '🫠' },
      { text: 'Чуть не взлетел на воздух, гений.', emoji: '🧨' },
    ],
    near_loss_4: [
      { text: 'ОДИН клик от смерти', emoji: '💀' },
      { text: 'Сердечко ещё бьётся?', emoji: '😰' },
      { text: 'Ты был на волоске. Не делай так.', emoji: '🫠' },
      { text: 'Чуть не взлетел на воздух, гений.', emoji: '🧨' },
    ],
    near_loss_5: [
      { text: 'ПЯТЬ МИН РЯДОМ. ТЫ ВООБЩЕ НОРМАЛЬНО?', emoji: '😵' },
      { text: 'Это уже не риск. Это флирт со взрывом.', emoji: '💣' },
      { text: 'Тут воздух пахнет ошибкой.', emoji: '⚠️' },
      { text: 'Вот здесь уже реально страшно.', emoji: '😬' },
    ],
    near_loss_6: [
      { text: 'ШЕСТЬ. ЭТО КРАСНАЯ ЗОНА, КОМАНДИР.', emoji: '🚨' },
      { text: 'Тут доска орёт тебе "не ошибись".', emoji: '☠️' },
      { text: 'Это не клетка. Это ловушка с подсветкой.', emoji: '🔥' },
      { text: 'Если тут мискликнешь — я даже шутить не буду.', emoji: '🧯' },
    ],
    streak: [
      { text: 'Big brain detected', emoji: '🧠' },
      { text: 'Так, тут кто-то проснулся.', emoji: '⚡' },
      { text: 'Серия идёт. Только не сглазь.', emoji: '🔥' },
      { text: 'Окей, ты умеешь. Поняли.', emoji: '😤' },
    ],
    win: [
      { text: 'Ну окей, красава. Засчитано', emoji: '😎' },
      { text: 'Ты решал, а не угадывал. Уважение.', emoji: '🏆' },
      { text: 'Чисто. Даже придраться не к чему. Бесит.', emoji: '👑' },
    ],
    win_fast: [
      { text: 'Хмм... подозрительно быстро', emoji: '🤨' },
      { text: 'Ты не играл, ты ЧИТИЛ. Поздравляю?', emoji: '🏃' },
      { text: 'Speedrun. Кто тебя вообще учил?', emoji: '⚡' },
      { text: 'Так быстро, что я не успел пошутить.', emoji: '😳' },
    ],
    lose: [
      { text: 'Скилл ишью. Игра не виновата.', emoji: '🤡' },
      { text: 'Это было больно смотреть.', emoji: '😬' },
      { text: 'Минус. Доска 1 — ты 0.', emoji: '💀' },
      { text: 'Ну ты и навёл шороху... в плохом смысле.', emoji: '🙃' },
    ],
    lose_fast: [
      { text: 'Брат. Даже двухлетка так не сливает', emoji: '💀' },
      { text: 'Speedrun to explosion. Поздравляю?', emoji: '💥' },
      { text: '10 секунд. Это антирекорд, серьёзно.', emoji: '⚰️' },
      { text: 'Ты вообще на доску смотрел?', emoji: '🤦' },
    ],
    ai_hint_used: [
      { text: 'Подсказку взял? Ну ладно, не все гении.', emoji: '🤖' },
      { text: 'AI подумал, ты нажал. Командная работа', emoji: '🤝' },
      { text: 'Костыль засчитан. Но мы запомнили.', emoji: '🩼' },
    ],
  },
}

export const useReactions = () => {
  /** Returns a random reaction for the given mood+event, or null if there's nothing. */
  function pick(mood: Mood, event: GameEvent): Reaction | null {
    const pool = REACTIONS[mood]?.[event]
    if (!pool || pool.length === 0) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  return { pick }
}
