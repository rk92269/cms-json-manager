import React, { useEffect, useState } from "react";
import {
  deleteDocument,
  getAllDocuments,
  importDocumentFromApi,
  previewDocumentFromApi,
  updateDocument,
} from "../api/documentApi";
import JsonEditorPanel from "../components/admin/JsonEditorPanel";

function AdminPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeRequestTab, setActiveRequestTab] = useState("headers");
  const [importForm, setImportForm] = useState({
    title: "",
    sourceUrl: "",
    requestMethod: "GET",
    requestHeaders: '{\n  "Accept-Language": "en",\n  "Content-Type": "application/json"\n}',
    requestBody: "{\n\n}",
    contentType: "application/json",
    status: "draft",
  });

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await getAllDocuments();
      setDocuments(data);
    } catch (error) {
      setMessage("Failed to load saved documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setImportForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePreviewImport = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorDetails(null);

    try {
      const parsedHeaders = importForm.requestHeaders
        ? JSON.parse(importForm.requestHeaders)
        : {};
      const parsedBody = importForm.requestBody.trim()
        ? JSON.parse(importForm.requestBody)
        : null;

      const previewDocument = await previewDocumentFromApi({
        title: importForm.title,
        sourceUrl: importForm.sourceUrl,
        requestMethod: importForm.requestMethod,
        requestHeaders: parsedHeaders,
        requestBody: parsedBody,
        contentType: importForm.contentType,
        status: importForm.status,
      });

      setSelectedDocument(previewDocument);
      setMessage("Preview loaded. Review the JSON, make changes, then save it to the database.");
    } catch (error) {
      const responseData = error.response?.data;

      setMessage("Preview failed. Review the upstream response details below.");
      setErrorDetails(responseData || { error: error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      setMessage("Document deleted successfully.");
      setErrorDetails(null);
      if (selectedDocument && selectedDocument._id === id) {
        setSelectedDocument(null);
      }
      loadDocuments();
    } catch (error) {
      setMessage("Failed to delete document.");
    }
  };

  const handleSaveDocument = async (updatedDocument) => {
    try {
      if (updatedDocument._id) {
        await updateDocument(updatedDocument._id, {
          title: updatedDocument.title,
          sourceUrl: updatedDocument.sourceUrl,
          requestMethod: updatedDocument.requestMethod,
          requestHeaders: updatedDocument.requestHeaders,
          requestBody: updatedDocument.requestBody,
          contentType: updatedDocument.contentType,
          status: updatedDocument.status,
          jsonData: updatedDocument.jsonData,
        });

        setMessage("Document updated successfully.");
        setErrorDetails(null);
        setSelectedDocument(updatedDocument);
      } else {
        const savedDocument = await importDocumentFromApi({
          title: updatedDocument.title,
          sourceUrl: updatedDocument.sourceUrl,
          requestMethod: updatedDocument.requestMethod,
          requestHeaders: updatedDocument.requestHeaders,
          requestBody: updatedDocument.requestBody,
          contentType: updatedDocument.contentType,
          status: updatedDocument.status,
          jsonData: updatedDocument.jsonData,
        });

        setMessage("Preview saved to MongoDB successfully.");
        setErrorDetails(null);
        setSelectedDocument(savedDocument);
      }

      loadDocuments();
    } catch (error) {
      setMessage("Failed to save JSON changes.");
    }
  };

  return (
    <div className="page">
      <div className="cm-editor-layout">
        <aside className="cm-content-tree panel-section">
          <div className="cm-section-heading">
            <div>
              <span className="cm-mini-label">Content Explorer</span>
              <h3>Saved Documents</h3>
            </div>
            <span className="cm-count-badge">{documents.length}</span>
          </div>

          <p className="cm-muted-text">
            Browse saved JSON content items and reopen them in the editor workspace.
          </p>

          {loading ? (
            <p>Loading documents...</p>
          ) : documents.length === 0 ? (
            <p>No saved documents yet.</p>
          ) : (
            <div className="cm-tree-list">
              {documents.map((document) => {
                const isActive = selectedDocument?._id === document._id;

                return (
                  <button
                    key={document._id}
                    type="button"
                    className={`cm-tree-item ${isActive ? "is-active" : ""}`}
                    onClick={() => setSelectedDocument(document)}
                  >
                    <span className="cm-tree-item-title">{document.title}</span>
                    <span className="cm-tree-item-meta">{document.status}</span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="cm-authoring-space">
          <section className="panel-section">
            <div className="cm-section-heading">
              <div>
                <span className="cm-mini-label">Source Connector</span>
                <h3>Import CMS API JSON</h3>
              </div>
            </div>

            <p className="cm-muted-text">
              Connect to an external CMS endpoint, preview the JSON, then edit it before saving to MongoDB.
            </p>

            {message && <div className="status-message">{message}</div>}

            {errorDetails && (
              <div className="error-panel">
                <h3>Upstream Error Details</h3>
                <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
              </div>
            )}

            <form className="form-grid" onSubmit={handlePreviewImport}>
              <div className="full-width request-composer">
                <div className="request-composer-topbar">
                  <label className="request-method-field">
                    <span className="cm-mini-label">Method</span>
                    <select
                      name="requestMethod"
                      value={importForm.requestMethod}
                      onChange={handleChange}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </label>

                  <label className="request-url-field">
                    <span className="cm-mini-label">API URL</span>
                    <input
                      type="text"
                      name="sourceUrl"
                      value={importForm.sourceUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/api/data"
                      required
                    />
                  </label>

                  <button type="submit" className="primary-button">
                    Preview Import
                  </button>
                </div>

                <div className="request-meta-grid">
                  <label>
                    Title
                    <input
                      type="text"
                      name="title"
                      value={importForm.title}
                      onChange={handleChange}
                      placeholder="Example: Banking Schemes API"
                      required
                    />
                  </label>

                  <label>
                    Content Type
                    <input
                      type="text"
                      name="contentType"
                      value={importForm.contentType}
                      onChange={handleChange}
                      placeholder="application/json"
                    />
                  </label>

                  <label>
                    Status
                    <select name="status" value={importForm.status} onChange={handleChange}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </label>
                </div>

                <div className="request-tab-strip" role="tablist" aria-label="Request builder tabs">
                  <button
                    type="button"
                    className={activeRequestTab === "headers" ? "is-active" : ""}
                    onClick={() => setActiveRequestTab("headers")}
                  >
                    Headers
                  </button>
                  <button
                    type="button"
                    className={activeRequestTab === "body" ? "is-active" : ""}
                    onClick={() => setActiveRequestTab("body")}
                  >
                    Body
                  </button>
                  <button
                    type="button"
                    className={activeRequestTab === "settings" ? "is-active" : ""}
                    onClick={() => setActiveRequestTab("settings")}
                  >
                    Settings
                  </button>
                </div>

                <div className="request-tab-panel">
                  {activeRequestTab === "headers" && (
                    <label className="full-width">
                      Request Headers (JSON)
                      <textarea
                        name="requestHeaders"
                        value={importForm.requestHeaders}
                        onChange={handleChange}
                        rows="10"
                      />
                    </label>
                  )}

                  {activeRequestTab === "body" && (
                    <label className="full-width">
                      Request Body (JSON)
                      <textarea
                        name="requestBody"
                        value={importForm.requestBody}
                        onChange={handleChange}
                        rows="10"
                        placeholder='{\n  "key": "value"\n}'
                      />
                    </label>
                  )}

                  {activeRequestTab === "settings" && (
                    <div className="request-settings-grid">
                      <div className="request-settings-card">
                        <span className="cm-mini-label">Request Profile</span>
                        <strong>{importForm.requestMethod} JSON Request</strong>
                        <p className="cm-muted-text">
                          Use this mode for external CMS APIs that return structured JSON responses.
                        </p>
                      </div>
                      <div className="request-settings-card">
                        <span className="cm-mini-label">Default Behavior</span>
                        <strong>Preview before save</strong>
                        <p className="cm-muted-text">
                          Imported data opens in the editor first, then you decide when to store it in MongoDB.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </section>

          <section className="panel-section">
            <div className="cm-section-heading">
              <div>
                <span className="cm-mini-label">Actions</span>
                <h3>Document Operations</h3>
              </div>
            </div>

            <p className="cm-muted-text">
              Open a saved item from the explorer to edit it, or remove content you no longer need.
            </p>

            {selectedDocument?._id ? (
              <div className="card-actions">
                <button
                  type="button"
                  onClick={() => setSelectedDocument(selectedDocument)}
                >
                  Open in Editor
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedDocument._id)}
                >
                  Delete Selected
                </button>
              </div>
            ) : (
              <p>Select a saved document from the explorer or preview a new import.</p>
            )}
          </section>

          <JsonEditorPanel
            document={selectedDocument}
            onSave={handleSaveDocument}
            onClose={() => setSelectedDocument(null)}
          />
        </section>
      </div>
    </div>
  );
}

export default AdminPage;
