const mongoose = require("mongoose");

const cmsDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sourceUrl: {
      type: String,
      required: true,
      trim: true,
    },
    requestMethod: {
      type: String,
      default: "GET",
      trim: true,
      uppercase: true,
    },
    requestHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    contentType: {
      type: String,
      default: "application/json",
      trim: true,
    },
    status: {
      type: String,
      default: "draft",
      enum: ["draft", "published"],
    },

    // Stores the full JSON payload from any external CMS API.
    // Keeps the model flexible for nested objects, arrays, and arbitrary structures.
    jsonData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CmsDocument", cmsDocumentSchema);
