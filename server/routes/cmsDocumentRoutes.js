const express = require("express");
const {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  previewCmsApiData,
  importFromCmsApi,
} = require("../controllers/cmsDocumentController");

const router = express.Router();

// Preview JSON from any external CMS API without saving it yet.
router.post("/preview", previewCmsApiData);

// Import JSON from any external CMS API and save it to MongoDB.
router.post("/import", importFromCmsApi);

// CRUD routes for saved CMS documents.
router.get("/", getAllDocuments);
router.get("/:id", getDocumentById);
router.post("/", createDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
