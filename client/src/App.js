import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import PublicPage from "./pages/PublicPage";

function App() {
  return (
    <BrowserRouter>
      <div className="cm-shell">
        <aside className="cm-sidebar">
          <div className="cm-brand">
            <span className="cm-brand-kicker">Content Management</span>
            <h1>CMS JSON Manager</h1>
            <p>Sitecore CM-style workspace for importing, editing, validating, and publishing JSON content.</p>
          </div>

          <nav className="cm-nav">
            <Link to="/">Content Editor</Link>
            <Link to="/public">Experience Preview</Link>
          </nav>

          <div className="cm-sidebar-footer">
            <h2>Workspace</h2>
            <p>Manage external CMS payloads, review schema structure, and save curated JSON into MongoDB.</p>
          </div>
        </aside>

        <div className="cm-main">
          <header className="cm-topbar">
            <div>
              <span className="cm-topbar-label">Authoring Console</span>
              <h2>JSON Content Management</h2>
            </div>
            <div className="cm-topbar-status">
              <span>Headless CMS Mode</span>
            </div>
          </header>

          <main className="cm-workspace">
            <Routes>
              <Route path="/" element={<AdminPage />} />
              <Route path="/public" element={<PublicPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
