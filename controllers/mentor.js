const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Transaction = require("../models/transaction");
const { getLevelFromPoints } = require("../utils/levels");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/ai-test", verifyToken, async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-preview",
      contents: "Explain how AI works in a few words",
    });

    res.json({
      result: response.text,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//reads points from req.user calculates level
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    const recentTransactions = await Transaction.find({ userId: user._id })
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .limit(5);

    const { level, name } = getLevelFromPoints(user.points); //computes level gives lvl name

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
    const aiResponse = response;
    console.log("AI RESPONSE:", aiResponse?.candidates[0].content.parts[0]);
    const mentorMessage =
      response?.response?.candidates?.[0]?.content?.parts[0]?.text ||
      "Keep going — small steps add up.";
      // response.response.candidates[0].content.parts[0].text
      // . .part-an array. text-object .-you look at an object 


    // const mentorMessage =
    //   response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
    //   "Keep going — small steps add up."; dot notation

    res.json({
      level,
      levelName: name,
      points: user.points,
      mentorMessage,
      recentTransactions,
    });
  } catch (err) {
    console.error("MENTOR ERROR:", err);
    res.status(500).json({
      err: "Failed to load mentor insight",
      details: err.message,
    });
  }
});

module.exports = router;
