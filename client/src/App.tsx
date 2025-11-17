import React from "react";
import ChatView from "./components/ChatView";
import "./styles/app.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <ChatView />
    </div>
  );
};

export default App;
