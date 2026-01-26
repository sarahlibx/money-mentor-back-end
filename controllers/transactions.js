const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Transaction = require("../models/transaction.js");
const router = express.Router();
const levels = require("../utils/levels.js");
const User = require("../models/user");

// GET /transactions - list only current user's transactions
router.get("/", verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
    .populate('categoryId')
    .sort({
      date: -1,
      createdAt: -1,
    }).populate("categoryId");

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET /recent - get list of recent transactions for dashboard.jsx
router.get("/recent", verifyToken, async (req, res) => {
  try {
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .populate("categoryId")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json(recentTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /transactions/summary - Get all for the current month
router.get("/monthly-summary", verifyToken, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: startOfMonth },
    })
      .sort({ date: -1, createdAt: -1 })
      .populate("categoryId");

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET /transactions/:id - show one (owner-only)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    .populate('categoryId');

    if (!transaction) {
      return res.status(404).json({ err: "Transaction not found" });
    }

    if (!transaction.userId.equals(req.user._id)) {
      return res.status(403).json({ err: "You're not allowed to do that!" });
    }

    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// POST /transactions - create
router.post("/", verifyToken, async (req, res) => {
  try {
    req.body.userId = req.user._id;
    //Saves the transaction (income or expense) to MongoDB
    const transaction = await Transaction.create(req.body);
    //update user points grab the user model and update the points field on the user model

    // counter for calculating points
    let pointsToAdd = 0;
// transaction amount x 10 points
    if (transaction.type === "Income") {
      pointsToAdd = transaction.amount * 2;
    }

    // update user points. $inc add this number to existing
    if (pointsToAdd > 0) {
      const user = await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: pointsToAdd },
       
        
      },
       {new: true}
    );
      await user.save();
    }
    const populatedTransaction = await transaction.populate('categoryId');

    res.status(201).json(populatedTransaction);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// PUT /transactions/:id
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ err: "Transaction not found" });
    }

    if (!transaction.userId.equals(req.user._id)) {
      return res.status(403).json({ err: "You're not allowed to do that!" });
    }

    delete req.body.userId;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.status(200).json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// DELETE /transactions/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ err: "Transaction not found" });
    }

    if (!transaction.userId.equals(req.user._id)) {
      return res.status(403).json({ err: "You're not allowed to do that!" });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(
      req.params.id,
    );
    res.status(200).json(deletedTransaction);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
