import jwt from "jsonwebtoken";
import Relationship from "../relationship/relationship.model.js";
import GameSession from "./game.model.js";
import Message from "../chat/message.model.js";
import {
  initTicTacToe, applyTicTacToeMove,
  getTruthOrDarePrompt, getThisOrThat,
  getDailyQuestion, COMPATIBILITY_QUESTIONS, calcCompatibility,
  getFuturePrediction,
} from "./game.logic.js";

const verifyToken = (t) => { try { return jwt.verify(t, process.env.JWT_SECRET); } catch { return null; } };
const ROOM = (id) => `game_${id}`;

const getActiveRel = async (relationshipId, userId) => {
  const rel = await Relationship.findById(relationshipId);
  if (!rel || rel.status !== "active") return null;
  return rel.user1Id.toString() === userId || rel.user2Id.toString() === userId ? rel : null;
};

const systemMsg = async (relationshipId, senderId, content) => {
  await Message.create({ relationshipId, senderId, type: "system", content, status: "sent" }).catch(() => {});
};

const GAME_LABELS = {
  tic_tac_toe: "Tic Tac Toe 🎮", truth_or_dare: "Truth or Dare 🎲",
  this_or_that: "This or That 🤔", quiz_about_partner: "Partner Quiz 💕",
  emoji_story_game: "Emoji Story 😊", draw_and_guess: "Draw & Guess 🎨",
  daily_question_game: "Daily Question 💬", compatibility_quiz: "Compatibility Quiz 💑",
  future_prediction_game: "Future Predictions 🔮", custom_prompt_game: "Custom Game ✨",
};

const initGameState = (gameType, creatorId) => {
  switch (gameType) {
    case "tic_tac_toe":          return { ...initTicTacToe(), symbols: { [creatorId]: "X" } };
    case "truth_or_dare":        return { phase: "choose", prompt: null, choice: null, round: 1 };
    case "this_or_that":         return { options: getThisOrThat(), answers: {}, round: 1 };
    case "daily_question_game":  return { question: getDailyQuestion(), answers: {} };
    case "compatibility_quiz":   return { questions: COMPATIBILITY_QUESTIONS, answers: {}, score: null, currentQ: 0 };
    case "future_prediction_game": return { question: getFuturePrediction(), answers: {} };
    case "emoji_story_game":     return { story: [], turn: creatorId };
    case "draw_and_guess":       return { strokes: [], word: null, guess: null, phase: "draw" };
    case "custom_prompt_game":   return { prompt: "", answers: {} };
    default:                     return {};
  }
};

const initGameSocket = (io) => {
  const game = io.of("/game");

  game.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Invalid token"));
    socket.userId = decoded.userId;
    next();
  });

  game.on("connection", (socket) => {
    // ── join relationship game room ────────────────────────────────
    socket.on("game_join_room", async ({ relationshipId }) => {
      const rel = await getActiveRel(relationshipId, socket.userId);
      if (!rel) return;
      socket.join(ROOM(relationshipId));
      socket.relationshipId = relationshipId;
    });

    // ── create game ────────────────────────────────────────────────
    socket.on("game_create", async ({ relationshipId, gameType }) => {
      try {
        const rel = await getActiveRel(relationshipId, socket.userId);
        if (!rel) { socket.emit("game_error", { message: "Access denied" }); return; }

        // abandon any existing active game
        await GameSession.updateMany(
          { relationshipId, status: { $in: ["waiting","active"] } },
          { status: "abandoned" }
        );

        const state = initGameState(gameType, socket.userId);
        const session = await GameSession.create({
          relationshipId, gameType,
          createdBy: socket.userId,
          players: [socket.userId],
          currentTurn: socket.userId,
          state,
        });

        socket.gameId = session._id.toString();

        // notify partner
        game.to(ROOM(relationshipId)).emit("game_invite", {
          gameId:   session._id,
          gameType,
          createdBy: socket.userId,
          label:    GAME_LABELS[gameType] || gameType,
        });

        socket.emit("game_created", { session });
        await systemMsg(relationshipId, socket.userId, `🎮 Started ${GAME_LABELS[gameType] || gameType}`);
      } catch { socket.emit("game_error", { message: "Failed to create game" }); }
    });

    // ── join game ──────────────────────────────────────────────────
    socket.on("game_join", async ({ gameId, relationshipId }) => {
      try {
        const session = await GameSession.findById(gameId);
        if (!session || session.status === "completed" || session.status === "abandoned") {
          socket.emit("game_error", { message: "Game not available" }); return;
        }

        if (!session.players.includes(socket.userId)) {
          session.players.push(socket.userId);
        }

        // assign symbol for tic-tac-toe
        if (session.gameType === "tic_tac_toe") {
          session.state.symbols = session.state.symbols || {};
          if (!session.state.symbols[socket.userId]) {
            session.state.symbols[socket.userId] = "O";
          }
        }

        session.status = "active";
        await session.save();

        socket.gameId = gameId;
        game.to(ROOM(relationshipId)).emit("game_started", { session });
      } catch { socket.emit("game_error", { message: "Failed to join game" }); }
    });

    // ── game move ──────────────────────────────────────────────────
    socket.on("game_move", async ({ gameId, relationshipId, move }) => {
      try {
        const session = await GameSession.findById(gameId);
        if (!session || session.status !== "active") return;

        let newState = { ...session.state };
        let result = null;
        let completed = false;
        let nextTurn = session.currentTurn;

        switch (session.gameType) {
          case "tic_tac_toe": {
            const symbol = session.state.symbols?.[socket.userId];
            if (!symbol) break;
            if (session.currentTurn !== socket.userId) {
              socket.emit("game_error", { message: "Not your turn" }); return;
            }
            const updated = applyTicTacToeMove(session.state, move.index, symbol);
            if (!updated) { socket.emit("game_error", { message: "Invalid move" }); return; }
            newState = { ...newState, ...updated };
            if (updated.winner || updated.draw) {
              completed = true;
              result = updated.winner ? { winner: socket.userId, symbol: updated.winner } : { draw: true };
            } else {
              // switch turn
              nextTurn = session.players.find((p) => p.toString() !== socket.userId) || socket.userId;
            }
            break;
          }

          case "truth_or_dare": {
            if (move.choice) {
              newState.choice = move.choice;
              newState.prompt = getTruthOrDarePrompt(move.choice);
              newState.phase = "respond";
            } else if (move.next) {
              newState = { phase: "choose", prompt: null, choice: null, round: (newState.round || 1) + 1 };
              nextTurn = session.players.find((p) => p.toString() !== socket.userId) || socket.userId;
            }
            break;
          }

          case "this_or_that": {
            newState.answers = { ...newState.answers, [socket.userId]: move.answer };
            if (Object.keys(newState.answers).length >= 2) {
              completed = true;
              result = { answers: newState.answers };
            }
            break;
          }

          case "daily_question_game":
          case "future_prediction_game": {
            newState.answers = { ...newState.answers, [socket.userId]: move.answer };
            if (Object.keys(newState.answers).length >= 2) {
              completed = true;
              result = { answers: newState.answers };
            }
            break;
          }

          case "compatibility_quiz": {
            const qId = COMPATIBILITY_QUESTIONS[newState.currentQ]?.id;
            if (qId) {
              if (!newState.answers[qId]) newState.answers[qId] = {};
              newState.answers[qId][socket.userId] = move.answer;
              // advance question when both answered
              const bothAnswered = Object.keys(newState.answers[qId]).length >= 2;
              if (bothAnswered) {
                newState.currentQ = (newState.currentQ || 0) + 1;
                if (newState.currentQ >= COMPATIBILITY_QUESTIONS.length) {
                  // flatten answers for calcCompatibility
                  const a1 = {}, a2 = {};
                  const [p1, p2] = session.players.map((p) => p.toString());
                  for (const [qid, ans] of Object.entries(newState.answers)) {
                    a1[qid] = ans[p1]; a2[qid] = ans[p2];
                  }
                  newState.score = calcCompatibility(a1, a2);
                  completed = true;
                  result = { score: newState.score, answers: newState.answers };
                }
              }
            }
            break;
          }

          case "emoji_story_game": {
            if (session.currentTurn !== socket.userId) {
              socket.emit("game_error", { message: "Not your turn" }); return;
            }
            newState.story = [...(newState.story || []), { userId: socket.userId, emoji: move.emoji }];
            nextTurn = session.players.find((p) => p.toString() !== socket.userId) || socket.userId;
            if (newState.story.length >= 20) { completed = true; result = { story: newState.story }; }
            break;
          }

          case "draw_and_guess": {
            if (move.strokes !== undefined) newState.strokes = move.strokes;
            if (move.guess) {
              newState.guess = move.guess;
              completed = true;
              result = { guess: move.guess, word: newState.word };
            }
            if (move.word) newState.word = move.word;
            break;
          }

          case "custom_prompt_game": {
            if (move.prompt) newState.prompt = move.prompt;
            if (move.answer) {
              newState.answers = { ...newState.answers, [socket.userId]: move.answer };
              if (Object.keys(newState.answers).length >= 2) {
                completed = true; result = { answers: newState.answers };
              }
            }
            break;
          }
        }

        session.state = newState;
        session.currentTurn = nextTurn;
        if (completed) { session.status = "completed"; session.result = result; }
        await session.save();

        game.to(ROOM(relationshipId)).emit("game_state_update", {
          gameId, state: newState, currentTurn: nextTurn, completed, result,
        });

        if (completed) {
          const label = GAME_LABELS[session.gameType] || "Game";
          const resultText = result?.winner ? "🏆 Someone won!" : result?.draw ? "🤝 It's a draw!" : result?.score ? `💑 ${result.score}% compatible!` : "✅ Completed!";
          await systemMsg(relationshipId, socket.userId, `${label} ended — ${resultText}`);
        }
      } catch { socket.emit("game_error", { message: "Failed to process move" }); }
    });

    // ── restart ────────────────────────────────────────────────────
    socket.on("game_restart", async ({ gameId, relationshipId }) => {
      try {
        const session = await GameSession.findById(gameId);
        if (!session) return;
        const state = initGameState(session.gameType, socket.userId);
        session.state = state;
        session.status = "active";
        session.result = null;
        session.currentTurn = socket.userId;
        await session.save();
        game.to(ROOM(relationshipId)).emit("game_restarted", { session });
      } catch { /* non-critical */ }
    });

    // ── end game ───────────────────────────────────────────────────
    socket.on("game_end", async ({ gameId, relationshipId }) => {
      try {
        await GameSession.findByIdAndUpdate(gameId, { status: "abandoned" });
        game.to(ROOM(relationshipId)).emit("game_ended", { gameId });
      } catch { /* non-critical */ }
    });

    socket.on("disconnect", async () => {
      try {
        const gameId = socket.gameId;
        if (gameId) {
          const session = await GameSession.findById(gameId);
          if (session && session.status === "active") {
            await GameSession.findByIdAndUpdate(gameId, {
              status: "abandoned",
              endedAt: new Date(),
            });
            socket.to(ROOM(gameId)).emit("game_partner_disconnected", {
              gameId,
              message: "Your partner disconnected. Game ended.",
            });
          }
        }
      } catch { /* non-critical */ }
    });
  });
};

export default initGameSocket;
