const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Transaction = require("../models/transaction");
const { getLevelFromPoints } = require("../utils/levels");
const { GoogleGenAI } = require("@google/genai");
const User = require("../models/user")
const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//reads points from req.user calculates level
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log(user)
  const { level, name } = getLevelFromPoints(user.points); //computes level gives lvl name
  let mentorMessage = " Keep going - you are getting closer to your goal! ";
  let recentTransactions;
  try {
    recentTransactions = await Transaction.find({ userId: user._id })
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .limit(5);

    // AI Studio / preview client
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are a friendly financial mentor speaking directly to the user.

Say: "Here is your quick overview of your recent transactions."

User level: ${name}
Points: ${user.points}

Recent activity:
${recentTransactions
  .map(
    (t) =>
      `- ${t.type} $${t.amount} (${t.categoryId?.name || "Uncategorized"})`,
  )
  .join("\n")}

Then:
- Give short motivational message
- Be encouraging
- Mention the category if relevant
- Give practical financial advice
- Keep it under 3 sentences total
`;

    const response = await genAI.models.generateContent({
      // PREVIEW MODEL (required for AI Studio keys)
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // console.log("AI RESPONSE:", aiResponse?.candidates[0].content.parts[0]);

    mentorMessage =
      response?.candidates[0]?.content?.parts[0]?.text ?? mentorMessage;

    console.log("MESSAGE", response);
  } catch (err) {
    console.error("MENTOR ERROR:", err);
  }
  res.json({
    level,
    levelName: name,
    points: user.points,
    mentorMessage,
    recentTransactions,
  });
});

module.exports = router;
