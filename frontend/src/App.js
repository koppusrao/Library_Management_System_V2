import React from "react";
import Dashboard from "./Dashboard";
import "./App.css";
import libraryBg from "./assets/library-bg.jpg";

function App() {
  return (
    <div
      className="App-header"
      style={{ backgroundImage: `url(${libraryBg})` }}
    >
      <Dashboard />
    </div>
  );
}

export default App;