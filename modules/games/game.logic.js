// ── Tic Tac Toe ────────────────────────────────────────────────────────────
export const initTicTacToe = () => ({
  board: Array(9).fill(null),
  winner: null,
  draw: false,
});

const TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

export const applyTicTacToeMove = (state, index, symbol) => {
  if (state.board[index] || state.winner) return null; // invalid
  const board = [...state.board];
  board[index] = symbol;

  let winner = null;
  for (const [a,b,c] of TTT_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = board[a]; break;
    }
  }
  const draw = !winner && board.every(Boolean);
  return { board, winner, draw };
};

// ── Truth or Dare ──────────────────────────────────────────────────────────
const TRUTHS = [
  "What's your most embarrassing memory?",
  "What's something you've never told me?",
  "What's your biggest fear?",
  "What's the most romantic thing you've ever done?",
  "What's one thing you wish I knew about you?",
  "What's your guilty pleasure?",
  "What's the best compliment you've ever received?",
  "What's something that always makes you smile?",
  "What's your dream date?",
  "What's one thing you want to do together this year?",
];

const DARES = [
  "Send me a voice message saying something sweet.",
  "Tell me 3 things you love about me right now.",
  "Send me your current selfie.",
  "Write me a 2-line poem.",
  "Tell me your favorite memory of us.",
  "Send me a song that reminds you of me.",
  "Describe our relationship in 3 emojis.",
  "Tell me something you've been wanting to say.",
  "Send me a photo of where you are right now.",
  "Write me a mini love letter in 3 sentences.",
];

export const getTruthOrDarePrompt = (choice) => {
  const list = choice === "truth" ? TRUTHS : DARES;
  return list[Math.floor(Math.random() * list.length)];
};

// ── This or That ───────────────────────────────────────────────────────────
const THIS_OR_THAT = [
  ["Beach 🏖️", "Mountains 🏔️"],
  ["Morning person ☀️", "Night owl 🌙"],
  ["Coffee ☕", "Tea 🍵"],
  ["Movie night 🎬", "Game night 🎮"],
  ["Cook at home 🍳", "Eat out 🍽️"],
  ["Road trip 🚗", "Flight ✈️"],
  ["Dogs 🐕", "Cats 🐈"],
  ["Summer ☀️", "Winter ❄️"],
  ["Text 💬", "Call 📞"],
  ["Spontaneous 🎲", "Planned 📅"],
  ["City life 🏙️", "Countryside 🌿"],
  ["Books 📚", "Movies 🎬"],
];

export const getThisOrThat = () =>
  THIS_OR_THAT[Math.floor(Math.random() * THIS_OR_THAT.length)];

// ── Daily Question ─────────────────────────────────────────────────────────
const DAILY_QUESTIONS = [
  "What made you smile today?",
  "What's one thing you're grateful for right now?",
  "What's been on your mind lately?",
  "What's something you're looking forward to?",
  "What's the best part of your day so far?",
  "What's one thing you wish you could change today?",
  "What's a small win you had today?",
  "What song is stuck in your head?",
  "What's something you want to do together soon?",
  "What's one word that describes how you feel right now?",
  "What's something that made you think of me today?",
  "What's your dream for us this year?",
  "What's something new you learned recently?",
  "What's a memory that made you happy today?",
];

export const getDailyQuestion = () => {
  const dayIndex = Math.floor(Date.now() / 86400000) % DAILY_QUESTIONS.length;
  return DAILY_QUESTIONS[dayIndex];
};

// ── Compatibility Quiz ─────────────────────────────────────────────────────
export const COMPATIBILITY_QUESTIONS = [
  { id: 1, question: "Ideal weekend?",         options: ["Stay home 🏠","Go out 🌆","Adventure 🏕️","Mix of both 🎭"] },
  { id: 2, question: "Love language?",          options: ["Words 💬","Touch 🤗","Gifts 🎁","Acts of service 🛠️"] },
  { id: 3, question: "Conflict style?",         options: ["Talk it out 💬","Need space 🚶","Hug it out 🤗","Write it down ✍️"] },
  { id: 4, question: "Dream vacation?",         options: ["Beach 🏖️","City 🏙️","Mountains 🏔️","Countryside 🌿"] },
  { id: 5, question: "Morning routine?",        options: ["Slow & cozy ☕","Quick & efficient ⚡","Workout 💪","No routine 🎲"] },
  { id: 6, question: "Future home?",            options: ["Big city 🏙️","Suburbs 🏡","Small town 🌳","Anywhere with you 💕"] },
];

export const calcCompatibility = (answers1, answers2) => {
  let matches = 0;
  for (const q of COMPATIBILITY_QUESTIONS) {
    if (answers1[q.id] === answers2[q.id]) matches++;
  }
  return Math.round((matches / COMPATIBILITY_QUESTIONS.length) * 100);
};

// ── Future Prediction ──────────────────────────────────────────────────────
export const FUTURE_QUESTIONS = [
  "Where will we be in 1 year?",
  "What's one trip we'll take together?",
  "What's something we'll laugh about in 5 years?",
  "What habit will we build together?",
  "What's one thing we'll achieve as a team?",
];

export const getFuturePrediction = () =>
  FUTURE_QUESTIONS[Math.floor(Math.random() * FUTURE_QUESTIONS.length)];
