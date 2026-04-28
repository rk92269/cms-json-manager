const axios = require("axios");
const CmsDocument = require("../models/CmsDocument");

const buildAxiosConfig = ({
  sourceUrl,
  requestMethod = "GET",
  requestHeaders = {},
  requestBody,
}) => {
  const config = {
    method: requestMethod,
    url: sourceUrl,
    headers: requestHeaders,
  };

  // Only send a body for methods that normally support it.
  if (requestBody && ["POST", "PUT", "PATCH"].includes(requestMethod.toUpperCase())) {
    config.data = requestBody;
  }

  return config;
};

const buildUpstreamError = (defaultMessage, error) => {
  if (error.response) {
    return {
      message: defaultMessage,
      upstreamStatus: error.response.status,
      upstreamStatusText: error.response.statusText,
      upstreamData: error.response.data,
    };
  }

  if (error.request) {
    return {
      message: defaultMessage,
      error: "No response received from upstream API.",
    };
  }

  return {
    message: defaultMessage,
    error: error.message,
  };
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await CmsDocument.find().sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch documents.", error: error.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await CmsDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch document.", error: error.message });
  }
};

const createDocument = async (req, res) => {
  try {
    const newDocument = await CmsDocument.create(req.body);
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(400).json({ message: "Failed to create document.", error: error.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const updatedDocument = await CmsDocument.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.status(200).json(updatedDocument);
  } catch (error) {
    res.status(400).json({ message: "Failed to update document.", error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const deletedDocument = await CmsDocument.findByIdAndDelete(req.params.id);

    if (!deletedDocument) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.status(200).json({ message: "Document deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete document.", error: error.message });
  }
};

const previewCmsApiData = async (req, res) => {
  try {
    const {
      title,
      sourceUrl,
      requestMethod = "GET",
      requestHeaders = {},
      requestBody = null,
      contentType = "application/json",
      status = "draft",
    } = req.body;

    if (!title || !sourceUrl) {
      return res.status(400).json({
        message: "Both title and sourceUrl are required.",
      });
    }

    const response = await axios(
      buildAxiosConfig({
        sourceUrl,
        requestMethod,
        requestHeaders,
        requestBody,
      })
    );

    res.status(200).json({
      title,
      sourceUrl,
      requestMethod,
      requestHeaders,
      requestBody,
      contentType,
      status,
      jsonData: response.data,
    });
  } catch (error) {
    const errorPayload = buildUpstreamError(
      "Failed to preview data from CMS API.",
      error
    );

    res.status(error.response?.status || 500).json(errorPayload);
  }
};

const importFromCmsApi = async (req, res) => {
  try {
    const {
      title,
      sourceUrl,
      requestMethod = "GET",
      requestHeaders = {},
      requestBody = null,
      contentType = "application/json",
      status = "draft",
      jsonData,
    } = req.body;

    if (!title || !sourceUrl) {
      return res.status(400).json({
        message: "Both title and sourceUrl are required.",
      });
    }

    let finalJsonData = jsonData;

    // If the UI has not already previewed the data, fetch it here before saving.
    if (!finalJsonData) {
      const response = await axios(
        buildAxiosConfig({
          sourceUrl,
          requestMethod,
          requestHeaders,
          requestBody,
        })
      );

      finalJsonData = response.data;
    }

    const document = await CmsDocument.create({
      title,
      sourceUrl,
      requestMethod,
      requestHeaders,
      requestBody,
      contentType,
      status,
      jsonData: finalJsonData,
    });

    res.status(201).json(document);
  } catch (error) {
    const errorPayload = buildUpstreamError(
      "Failed to import data from CMS API.",
      error
    );

    res.status(error.response?.status || 500).json(errorPayload);
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  previewCmsApiData,
  importFromCmsApi,
};
