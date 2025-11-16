import React from "react";
import ChatView from "./components/ChatView";
import useChat from "./hooks/useChat";
import "./styles/app.css";

const App: React.FC = () => {
  const { messages } = useChat();

  return (
    <div className="app-container">
      <h1>AI User Experience Experiment</h1>
      <ChatView messages={messages} />
    </div>
  );
};

export default App;
