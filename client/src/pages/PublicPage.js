import React, { useEffect, useState } from "react";
import { getAllDocuments } from "../api/documentApi";

function PublicPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const data = await getAllDocuments();

        // Show only published items on the public page.
        const publishedDocuments = data.filter(
          (document) => document.status === "published"
        );

        setDocuments(publishedDocuments);
      } catch (error) {
        setMessage("Failed to load published documents.");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  return (
    <div className="page">
      <h2>Public View</h2>
      <p>This page shows published CMS JSON content saved in MongoDB.</p>

      {message && <div className="status-message">{message}</div>}

      {loading ? (
        <p>Loading published documents...</p>
      ) : documents.length === 0 ? (
        <p>No published documents available yet.</p>
      ) : (
        <div className="document-list">
          {documents.map((document) => (
            <div className="document-card" key={document._id}>
              <h3>{document.title}</h3>
              <p>
                <strong>Content Type:</strong> {document.contentType}
              </p>
              <p>
                <strong>Source URL:</strong> {document.sourceUrl}
              </p>

              <div className="json-preview">
                <pre>{JSON.stringify(document.jsonData, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicPage;
