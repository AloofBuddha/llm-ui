import React from "react";
import ChatView from "./components/ChatView";
import "./styles/app.css";
import "./styles/left-pane.css";
import "./styles/explanation-pane.css";
import "katex/dist/katex.min.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <ChatView />
    </div>
  );
};

export default App;
