const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      // capitalized enum for consistency & to prevent bugs
      enum: ['Income', 'Expense'],
      required: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
