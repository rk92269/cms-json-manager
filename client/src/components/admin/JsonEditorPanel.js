import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import ReactJson from "react-json-view";

const formatJson = (value) => JSON.stringify(value, null, 2);

const detectType = (value) => {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
};

const buildSchema = (value) => {
  const valueType = detectType(value);

  if (valueType === "array") {
    const firstItem = value.length > 0 ? buildSchema(value[0]) : { type: "unknown" };

    return {
      type: "array",
      itemCount: value.length,
      items: firstItem,
    };
  }

  if (valueType === "object") {
    const properties = Object.keys(value).reduce((accumulator, key) => {
      accumulator[key] = buildSchema(value[key]);
      return accumulator;
    }, {});

    return {
      type: "object",
      properties,
    };
  }

  return {
    type: valueType,
    example: value,
  };
};

function JsonEditorPanel({ document, onSave, onClose }) {
  const [jsonData, setJsonData] = useState({});
  const [rawJson, setRawJson] = useState("{}");
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pretty");
  const [activeMetaTab, setActiveMetaTab] = useState("response");
  const [editorMode, setEditorMode] = useState("monaco");
  const [editorReady, setEditorReady] = useState(false);
  const safeDocument = document || {};
  const isSavedDocument = Boolean(document?._id);
  const schemaPreview = buildSchema(jsonData);
  const requestHeadersPreview = formatJson(safeDocument.requestHeaders || {});
  const requestBodyPreview = formatJson(safeDocument.requestBody || {});

  useEffect(() => {
    if (document) {
      const nextJson = document.jsonData || {};
      setJsonData(nextJson);
      setRawJson(formatJson(nextJson));
      setStatus(document.status || "draft");
      setError("");
      setActiveTab("pretty");
      setActiveMetaTab("response");
      setEditorMode("monaco");
    }
  }, [document]);

  const handleJsonChange = (edit) => {
    const nextJson = edit.updated_src;
    setJsonData(nextJson);
    setRawJson(formatJson(nextJson));
    setError("");
  };

  const handleEditorChange = (value = "") => {
    setRawJson(value);

    try {
      const parsedJson = JSON.parse(value);
      setJsonData(parsedJson);
      setError("");
    } catch (parseError) {
      setError(`Invalid JSON: ${parseError.message}`);
    }
  };

  const handleBeautify = () => {
    try {
      const parsedJson = JSON.parse(rawJson);
      const formattedJson = formatJson(parsedJson);
      setJsonData(parsedJson);
      setRawJson(formattedJson);
      setError("");
    } catch (parseError) {
      setError(`Beautify failed: ${parseError.message}`);
    }
  };

  const handleApplyRaw = () => {
    try {
      const parsedJson = JSON.parse(rawJson);
      setJsonData(parsedJson);
      setRawJson(formatJson(parsedJson));
      setError("");
    } catch (parseError) {
      setError(`Invalid JSON: ${parseError.message}`);
    }
  };

  const handleSave = () => {
    if (!document) {
      setError("No document selected.");
      return;
    }

    try {
      const parsedJson = JSON.parse(rawJson);
      setJsonData(parsedJson);
      setError("");

      onSave({
        ...document,
        status,
        jsonData: parsedJson,
      });
    } catch (parseError) {
      setError(`Cannot save invalid JSON: ${parseError.message}`);
    }
  };

  const prettyJson = formatJson(jsonData);
  const jsonSummary = {
    rootType: detectType(jsonData),
    topLevelKeys:
      jsonData && typeof jsonData === "object" && !Array.isArray(jsonData)
        ? Object.keys(jsonData).length
        : 0,
    hasRequestBody: Boolean(safeDocument.requestBody),
  };

  if (!document) {
    return null;
  }

  return (
    <section className="panel-section">
      <div className="editor-header">
        <div>
          <h3>{isSavedDocument ? "Edit Saved JSON" : "Preview Imported JSON"}</h3>
          <p>{document.title}</p>
        </div>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {error && <div className="status-message">{error}</div>}

      <label className="status-field">
        Publishing Status
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      <div className="json-meta-shell">
        <div className="json-meta-summary">
          <div>
            <span className="json-schema-label">Method</span>
            <strong>{document.requestMethod || "GET"}</strong>
          </div>
          <div>
            <span className="json-schema-label">Content Type</span>
            <strong>{document.contentType || "application/json"}</strong>
          </div>
          <div>
            <span className="json-schema-label">Root Type</span>
            <strong>{jsonSummary.rootType}</strong>
          </div>
          <div>
            <span className="json-schema-label">Top-Level Keys</span>
            <strong>{jsonSummary.topLevelKeys}</strong>
          </div>
        </div>

        <div className="json-meta-tabs" role="tablist" aria-label="Request response details">
          <button
            type="button"
            className={activeMetaTab === "response" ? "is-active" : ""}
            onClick={() => setActiveMetaTab("response")}
          >
            Response
          </button>
          <button
            type="button"
            className={activeMetaTab === "headers" ? "is-active" : ""}
            onClick={() => setActiveMetaTab("headers")}
          >
            Headers
          </button>
          <button
            type="button"
            className={activeMetaTab === "body" ? "is-active" : ""}
            onClick={() => setActiveMetaTab("body")}
          >
            Body
          </button>
        </div>

        <div className="json-meta-panel">
          {activeMetaTab === "response" && (
            <div className="json-meta-card-grid">
              <div className="json-meta-card">
                <span className="json-schema-label">Source URL</span>
                <code>{document.sourceUrl}</code>
              </div>
              <div className="json-meta-card">
                <span className="json-schema-label">Document Mode</span>
                <strong>{isSavedDocument ? "Saved Content Item" : "Preview Session"}</strong>
              </div>
            </div>
          )}

          {activeMetaTab === "headers" && (
            <pre className="json-meta-code">{requestHeadersPreview}</pre>
          )}

          {activeMetaTab === "body" && (
            <pre className="json-meta-code">
              {jsonSummary.hasRequestBody ? requestBodyPreview : "{\n  \n}"}
            </pre>
          )}
        </div>
      </div>

      <div className="json-workbench">
        <div className="json-workbench-toolbar">
          <div className="json-toolbar-left">
            <div className="json-tab-strip" role="tablist" aria-label="JSON editor views">
              <button
                type="button"
                className={activeTab === "pretty" ? "is-active" : ""}
                onClick={() => setActiveTab("pretty")}
              >
                Pretty
              </button>
              <button
                type="button"
                className={activeTab === "raw" ? "is-active" : ""}
                onClick={() => setActiveTab("raw")}
              >
                Raw
              </button>
              <button
                type="button"
                className={activeTab === "schema" ? "is-active" : ""}
                onClick={() => setActiveTab("schema")}
              >
                Schema
              </button>
            </div>

            <div className="json-renderer-switch" role="tablist" aria-label="Editor renderer">
              <button
                type="button"
                className={editorMode === "monaco" ? "is-active" : ""}
                onClick={() => setEditorMode("monaco")}
              >
                Monaco
              </button>
              <button
                type="button"
                className={editorMode === "tree" ? "is-active" : ""}
                onClick={() => setEditorMode("tree")}
              >
                Tree
              </button>
            </div>
          </div>

          <div className="json-toolbar-actions">
            <button type="button" onClick={handleBeautify}>
              Beautify
            </button>
            <button type="button" onClick={handleApplyRaw}>
              Apply Edits
            </button>
          </div>
        </div>

        <div className="json-editor-wrapper">
          {editorMode === "tree" && activeTab !== "schema" && (
            <ReactJson
              src={jsonData}
              name={false}
              theme="rjv-default"
              collapsed={activeTab === "raw" ? false : 1}
              displayDataTypes={false}
              displayObjectSize={true}
              enableClipboard={true}
              onEdit={handleJsonChange}
              onAdd={handleJsonChange}
              onDelete={handleJsonChange}
            />
          )}

          {editorMode === "monaco" && (activeTab === "pretty" || activeTab === "raw") && (
            <div className="json-raw-panel">
              <Editor
                height="480px"
                defaultLanguage="json"
                language="json"
                value={rawJson}
                onChange={handleEditorChange}
                onMount={() => setEditorReady(true)}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: activeTab === "pretty" ? "on" : "off",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                }}
              />
            </div>
          )}

          {activeTab === "schema" && (
            <div className="json-schema-panel">
              <div className="json-schema-summary">
                <div>
                  <span className="json-schema-label">Root Type</span>
                  <strong>{detectType(jsonData)}</strong>
                </div>
                <div>
                  <span className="json-schema-label">Validation</span>
                  <strong>Basic JSON structure</strong>
                </div>
              </div>

              <pre className="json-schema-output">{formatJson(schemaPreview)}</pre>
            </div>
          )}
        </div>

        <div className="json-validation-bar">
          <span className="json-validation-state">
            {error ? "Validation needs attention" : "JSON is ready to save"}
          </span>
          <div className="json-validation-metrics">
            <code className="json-validation-snippet">{prettyJson.length} chars</code>
            <code className="json-validation-snippet">{activeTab}</code>
            <code className="json-validation-snippet">
              {editorMode === "tree" ? "tree-mode" : editorReady ? "monaco-ready" : "loading-editor"}
            </code>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button type="button" className="primary-button" onClick={handleSave}>
          {isSavedDocument ? "Save Changes" : "Save to DB"}
        </button>
      </div>
    </section>
  );
}

export default JsonEditorPanel;
