const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },

    description: { type: String, trim: true },

    date: { type: Date, default: Date.now, required: true },

    type: { type: String, enum: ["income", "expense"], required: true },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    note: { type: String, trim: true },
  },
  { timestamps: true }
);
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
