import axios from "axios";

const apiBaseUrl =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/documents";

const api = axios.create({
  baseURL: apiBaseUrl,
});

export const getAllDocuments = async () => {
  const response = await api.get("/");
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createDocument = async (documentData) => {
  const response = await api.post("/", documentData);
  return response.data;
};

export const updateDocument = async (id, documentData) => {
  const response = await api.put(`/${id}`, documentData);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

export const previewDocumentFromApi = async (previewData) => {
  const response = await api.post("/preview", previewData);
  return response.data;
};

export const importDocumentFromApi = async (importData) => {
  const response = await api.post("/import", importData);
  return response.data;
};
