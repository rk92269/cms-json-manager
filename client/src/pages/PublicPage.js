import React, { useEffect, useMemo, useState } from "react";
import { getPublicDocuments } from "../api/documentApi";

const getValuePreview = (value) => {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (typeof value === "object") {
    return `Object(${Object.keys(value).length})`;
  }

  if (typeof value === "string") {
    return value.length > 80 ? `${value.slice(0, 80)}...` : value;
  }

  return String(value);
};

const isExpandableValue = (value) => value !== null && typeof value === "object";

const collectExpandablePaths = (value, path, paths = new Set()) => {
  if (!isExpandableValue(value)) {
    return paths;
  }

  paths.add(path);

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value);

  entries.forEach(([childKey, childValue]) => {
    if (isExpandableValue(childValue)) {
      collectExpandablePaths(childValue, `${path}.${childKey}`, paths);
    }
  });

  return paths;
};

const JsonNode = ({ label, value, path, expandedPaths, onToggle, depth = 0 }) => {
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const hasChildren = isObject && Object.keys(value).length > 0;
  const isExpanded = expandedPaths.has(path);

  const nodeLabel = useMemo(() => {
    if (label === null || label === undefined || label === "") {
      return isArray ? "Array" : "Root";
    }

    return label;
  }, [label, isArray]);

  if (!hasChildren && !isArray) {
    return (
      <div className="public-node public-node-leaf" style={{ marginLeft: depth * 16 }}>
        <span className="public-node-key">{nodeLabel}</span>
        <span className="public-node-value">{getValuePreview(value)}</span>
      </div>
    );
  }

  const entries = isArray
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value);

  return (
    <div className="public-node-group" style={{ marginLeft: depth * 16 }}>
      <button
        type="button"
        className="public-node-toggle"
        onClick={() => onToggle(path)}
      >
        <span className="public-node-key">{nodeLabel}</span>
        <span className="public-node-value">
          {isArray ? `Array(${value.length})` : `Object(${entries.length})`}
        </span>
        <span className="public-node-chevron">{isExpanded ? "-" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="public-node-children">
          {entries.length === 0 ? (
            <div className="public-node public-node-empty">
              Empty {isArray ? "array" : "object"}
            </div>
          ) : (
            entries.map(([childKey, childValue]) => (
              <JsonNode
                key={`${path}-${childKey}`}
                label={childKey}
                value={childValue}
                path={`${path}.${childKey}`}
                expandedPaths={expandedPaths}
                onToggle={onToggle}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

function PublicPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [expandedPaths, setExpandedPaths] = useState(new Set(["jsonData"]));

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const response = await getPublicDocuments();
        const items = response.items || [];

        setDocuments(items);
        setActiveDocumentId(items[0]?.id || null);
        setExpandedPaths(new Set(["jsonData"]));
        setMessage(
          response.meta?.generatedAt
            ? `Last updated ${new Date(response.meta.generatedAt).toLocaleString()}`
            : "",
        );
      } catch (error) {
        setMessage("Failed to load published documents.");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const activeDocument = documents.find((document) => document.id === activeDocumentId);

  const activeTreePaths = useMemo(() => {
    if (!activeDocument) {
      return new Set(["jsonData"]);
    }

    return collectExpandablePaths(activeDocument.jsonData, "jsonData", new Set(["jsonData"]));
  }, [activeDocument]);

  const handleTogglePath = (path) => {
    setExpandedPaths((current) => {
      const next = new Set(current);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedPaths(new Set(activeTreePaths));
  };

  const handleCollapseAll = () => {
    setExpandedPaths(new Set(["jsonData"]));
  };

  return (
    <div className="page">
      <section className="public-view-shell">
        <header className="public-view-header">
          <div>
            <span className="cm-mini-label">Public Experience</span>
            <h2>Published Content</h2>
            <p className="cm-muted-text">
              Browse published JSON content through a tree-style viewer with expand and collapse controls.
            </p>
          </div>
          <div className="public-view-meta">
            <span className="public-view-count">{documents.length} items</span>
          </div>
        </header>

        {message && <div className="status-message">{message}</div>}

        {loading ? (
          <p>Loading published documents...</p>
        ) : documents.length === 0 ? (
          <p>No published documents available yet.</p>
        ) : (
          <div className="public-view-layout">
            <aside className="public-document-list">
              {documents.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  className={`public-document-item ${
                    activeDocumentId === document.id ? "is-active" : ""
                  }`}
                  onClick={() => setActiveDocumentId(document.id)}
                >
                  <span className="public-document-title">{document.title}</span>
                  <span className="public-document-subtitle">{document.contentType}</span>
                </button>
              ))}
            </aside>

            {activeDocument && (
              <section className="public-document-panel">
                <div className="public-document-header">
                  <div>
                    <h3>{activeDocument.title}</h3>
                    <p className="cm-muted-text">{activeDocument.sourceUrl}</p>
                  </div>
                  <div className="public-document-actions">
                    <span className="public-document-badge">{activeDocument.contentType}</span>
                    <span className="public-document-badge">{activeDocument.status}</span>
                    <button type="button" onClick={handleExpandAll}>
                      Expand all
                    </button>
                    <button type="button" onClick={handleCollapseAll}>
                      Collapse all
                    </button>
                  </div>
                </div>

                <div className="public-tree-shell">
                  <JsonNode
                    label="jsonData"
                    value={activeDocument.jsonData}
                    path="jsonData"
                    expandedPaths={expandedPaths}
                    onToggle={handleTogglePath}
                  />
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default PublicPage;
