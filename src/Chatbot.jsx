import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./styles/Chatbot.css";
import { FiSend } from "react-icons/fi"; // Import send icon

const API_KEY = "AIzaSyAfzm7wWjS9tBNgSRfXI-Zy97vr1TCdGSs";
const MODEL_NAME = "gemini-1.5-flash-latest";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("chats")) || [];
    setChats(savedChats);
  }, []);

  const saveChat = (newChat) => {
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    localStorage.setItem("chats", JSON.stringify(updatedChats));
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await model.generateContent(input);
      let aiReply = response.response.text();

      // Format AI response for better readability
      aiReply = aiReply
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
        .replace(/\* /g, "• ") // Convert '*' bullet points to '•'
        .replace(/\n/g, "\n\n"); // Ensure line breaks for readability

      const updatedMessages = [...newMessages, { text: aiReply, isUser: false }];
      setMessages(updatedMessages);
      saveChat(updatedMessages);
    } catch (error) {
      console.error("❌ Error fetching AI response:", error);
      setMessages([...newMessages, { text: "⚠️ Error: Could not fetch response.", isUser: false }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const loadChat = (chat) => {
    setMessages(chat);
  };

  const startNewChat = () => {
    setMessages([]);
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
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "Close" : "☰"}
        </button>
        <button className="new-chat" onClick={startNewChat}>➕ New Chat</button>

        {sidebarOpen && (
          <div className="chat-list">
            {chats.map((chat, index) => (
              <div key={index} className="chat-item">
                <span onClick={() => loadChat(chat)}>🗨 {chat[0]?.text.slice(0, 20)}...</span>
                <button className="delete-btn" onClick={() => deleteChat(index)}>🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.isUser ? "user" : "ai"}`}>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}><FiSend /></button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;