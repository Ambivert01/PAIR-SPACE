// Rule-based emotion classifier — runs locally, zero external calls

const EMOTION_PATTERNS = {
  happy:        [/\b(happy|glad|great|awesome|wonderful|yay|woohoo|😊|😄|🎉|😁|joy|joyful)\b/i],
  excited:      [/\b(excited|can't wait|omg|amazing|incredible|thrilled|🎊|🔥|⚡|wow)\b/i],
  romantic:     [/\b(love|miss you|darling|sweetheart|❤️|💕|💗|💖|kiss|hug|babe|baby)\b/i],
  sad:          [/\b(sad|unhappy|cry|crying|tears|miss|lonely|😢|😭|heartbroken|upset)\b/i],
  angry:        [/\b(angry|mad|furious|annoyed|frustrated|hate|😠|😡|ugh|seriously)\b/i],
  frustrated:   [/\b(frustrated|ugh|whatever|fine|forget it|never mind|sigh|😤)\b/i],
  anxious:      [/\b(anxious|worried|nervous|scared|afraid|stress|stressed|😰|😟|😧)\b/i],
  grateful:     [/\b(thank|thanks|grateful|appreciate|thankful|blessed|🙏|means a lot)\b/i],
  supportive:   [/\b(here for you|got you|support|proud|believe in you|you can|💪|🤗)\b/i],
  playful:      [/\b(haha|lol|lmao|funny|joke|😂|🤣|😜|😝|teasing|silly)\b/i],
  affectionate: [/\b(cuddle|warm|cozy|snuggle|gentle|tender|soft|💝|🥰|adore)\b/i],
  apologetic:   [/\b(sorry|apologize|my bad|forgive|forgiveness|didn't mean|😔|🙇)\b/i],
  motivational: [/\b(you got this|keep going|don't give up|believe|strong|inspire|💫|🌟)\b/i],
  celebratory:  [/\b(congrats|congratulations|celebrate|achievement|proud|🎉|🥳|🏆|won|win)\b/i],
  lonely:       [/\b(alone|lonely|miss you so much|wish you were|far away|distance|😞)\b/i],
  serious:      [/\b(important|need to talk|serious|we need|listen|please understand)\b/i],
};

export const detectEmotion = (text) => {
  if (!text || text.length < 2) return { emotion: "neutral", confidence: 0.5 };

  const scores = {};
  for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      const matches = text.match(new RegExp(pattern.source, "gi")) || [];
      score += matches.length;
    }
    if (score > 0) scores[emotion] = score;
  }

  if (Object.keys(scores).length === 0) return { emotion: "neutral", confidence: 0.6 };

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = Math.min(0.95, 0.5 + (top[1] / total) * 0.5);

  return { emotion: top[0], confidence: parseFloat(confidence.toFixed(2)) };
};

// Detect stress signals from message patterns
export const detectStress = (messages) => {
  if (!messages.length) return false;
  const recent = messages.slice(-10);
  const stressCount = recent.filter((m) => {
    const { emotion } = detectEmotion(m.content || "");
    return ["anxious", "frustrated", "angry", "sad", "lonely"].includes(emotion);
  }).length;
  return stressCount >= 3;
};

// Detect conversation tone shift
export const detectToneShift = (messages) => {
  if (messages.length < 6) return null;
  const half = Math.floor(messages.length / 2);
  const older = messages.slice(0, half);
  const newer = messages.slice(half);

  const avgLen = (msgs) => msgs.reduce((a, m) => a + (m.content?.length || 0), 0) / msgs.length;
  const olderAvg = avgLen(older);
  const newerAvg = avgLen(newer);

  if (newerAvg < olderAvg * 0.4) return "shortening"; // messages getting much shorter
  if (newerAvg > olderAvg * 2)   return "intensifying";
  return null;
};
