const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    schemeCode: {
      type: String,
      required: true,
      trim: true,
    },
    schemeCodeName: {
      type: String,
      trim: true,
    },
    schemeSubType: {
      type: String,
      trim: true,
    },
    schemeCategory: {
      type: String,
      trim: true,
    },
    displayWealthBalance: {
      type: mongoose.Schema.Types.Mixed,
    },
    schemeType: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    externalId: {
      type: String,
      trim: true,
    },
    externalUrl: {
      type: String,
      trim: true,
    },

    // Store the complete original JSON so admin users can edit full nested data.
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Scheme", schemeSchema);
