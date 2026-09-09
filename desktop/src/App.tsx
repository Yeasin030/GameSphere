import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  return (
    <div className="container">
      <h1>Welcome to GameSphere Desktop</h1>
      <p>The ultimate hub for gamers.</p>
      
      <div className="row">
        <button onClick={() => alert("Connecting to backend...")}>
          Connect to Server
        </button>
      </div>
    </div>
  );
}

export default App;
