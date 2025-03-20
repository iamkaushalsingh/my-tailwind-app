import { useState, useEffect } from "react";
import "./styles/Chatbot.css";
import { FiSend } from "react-icons/fi"; // Removed theme icons

const BACKEND_URL = "http://localhost:5001"; 

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "👋 Welcome to my chatbot!", isUser: false, timestamp: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChats, setShowChats] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Thinking...");
  const [isNewChat, setIsNewChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Typing indicator

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("chats")) || [];
    setChats(savedChats);

    const placeholderOptions = ["Ask me anything...", "How can I help?", "Type a message..."];
    let index = 0;
    const interval = setInterval(() => {
      setPlaceholderText(placeholderOptions[index]);
      index = (index + 1) % placeholderOptions.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const saveChat = (chat) => {
    if (chat.length <= 1) return;
    const updatedChats = [chat, ...chats].slice(0, 10);
    setChats(updatedChats);
    localStorage.setItem("chats", JSON.stringify(updatedChats));
  };

  const formatResponse = (text) => {
    if (!text) return "⚠️ No response from AI.";
    return text.replace(/\*\*/g, "").replace(/\. /g, ".\n\n").replace(/\n- /g, "\n\n- ");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const newMessages = [...messages, { text: input, isUser: true, timestamp }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Failed to fetch AI response");

      const data = await response.json();
      const aiReply = formatResponse(data.reply || "⚠️ No response from AI.");

      const updatedMessages = [...newMessages, { text: aiReply, isUser: false, timestamp: new Date().toLocaleTimeString() }];
      setMessages(updatedMessages);
      if (isNewChat) {
        saveChat(updatedMessages);
        setIsNewChat(false);
      }
    } catch (error) {
      console.error("❌ Error fetching AI response:", error);
      setMessages([...newMessages, { text: "⚠️ Error: Could not fetch response.", isUser: false, timestamp }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) handleSendMessage();
  };

  const loadChat = (chat) => setMessages(chat);
  
  const startNewChat = () => {
    if (messages.length > 1) saveChat(messages);
    setMessages([{ text: "👋 Welcome to my chatbot!", isUser: false, timestamp: new Date().toLocaleTimeString() }]);
    setShowChats(true);
    setIsNewChat(true);
  };

  const deleteChat = (index) => {
    const updatedChats = chats.filter((_, i) => i !== index);
    setChats(updatedChats);
    localStorage.setItem("chats", JSON.stringify(updatedChats));
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? "Close" : "☰"}</button>
        <button className="new-chat" onClick={startNewChat}>➕ New Chat</button>

        {sidebarOpen && showChats && (
          <div className="chat-list">
            {chats.length > 0 ? (
              chats.map((chat, index) => (
                <div key={index} className="chat-item">
                  <span onClick={() => loadChat(chat)}>🗨 {chat[0]?.text.slice(0, 20)}...</span>
                  <button className="delete-btn" onClick={() => deleteChat(index)}>🗑</button>
                </div>
              ))
            ) : (
              <p className="no-chats">No chats yet</p>
            )}
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.isUser ? "user" : "ai"}`}>
              <span className="avatar">{msg.isUser ? "🧑‍💻" : "🤖"}</span>
              <div className="message-content">
                <div className="message-text">
                  {msg.text.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                </div>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          {isTyping && <div className="typing-indicator">🤖 Typing...</div>}
        </div>

        {/* Chat Input */}
        <div className="chat-input">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholderText} />
          <button onClick={handleSendMessage} disabled={!input.trim()}><FiSend /></button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;