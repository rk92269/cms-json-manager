import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";

function JsonEditorPanel({ document, onSave, onClose }) {
  const [jsonData, setJsonData] = useState({});
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState("");
  const isSavedDocument = Boolean(document?._id);

  useEffect(() => {
    if (document) {
      setJsonData(document.jsonData || {});
      setStatus(document.status || "draft");
      setError("");
    }
  }, [document]);

  const handleJsonChange = (edit) => {
    setJsonData(edit.updated_src);
    setError("");
  };

  const handleSave = () => {
    if (!document) {
      setError("No document selected.");
      return;
    }

    onSave({
      ...document,
      status,
      jsonData,
    });
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

      <div className="json-editor-wrapper">
        <ReactJson
          src={jsonData}
          name={false}
          theme="rjv-default"
          collapsed={1}
          displayDataTypes={false}
          displayObjectSize={true}
          enableClipboard={true}
          onEdit={handleJsonChange}
          onAdd={handleJsonChange}
          onDelete={handleJsonChange}
        />
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
