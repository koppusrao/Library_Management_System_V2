import React, { useState } from "react";
import Dashboard from "./Dashboard";
import PlainUI from "./PlainUI";

function App() {
  const [mode, setMode] = useState("plain"); 
  // Options: "plain" or "dashboard"

  return (
    <div>
      {/* Toggle Buttons */}
      <div style={{ padding: "10px", background: "#eee" }}>
        <button
          onClick={() => setMode("plain")}
          style={{ marginRight: "10px" }}
        >
          Use Plain UI
        </button>

        <button onClick={() => setMode("dashboard")}>
          Use Drag & Drop Dashboard
        </button>
      </div>

      {/* Dynamic UI Switch */}
      {mode === "plain" ? <PlainUI /> : <Dashboard />}
    </div>
  );
}

export default App;