import { useState, useEffect, useRef } from "react";

export default function NuwaLanguageRoom() {
  const [messages, setMessages] = useState([
    { from: "ai", text: "good night zan 🌙 how's your day been?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { from: "user", text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(input.toLowerCase());
    const currentInput = input;
    setInput("");
    
    setIsTyping(true);
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      const data = await response.json();
      const aiMessage = { from: "ai", text: data.reply, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage = { from: "ai", text: "Sorry, I'm having trouble connecting.", timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    }
    setIsTyping(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#E8F0E6', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', backgroundColor: '#DDE7DD', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🌱 Nuwa Language Room</h1>
        <div>🙂</div>
      </header>

      <main style={{ flex: 1, padding: '1rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, backgroundColor: '#F5F5DC', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  borderRadius: '12px',
                  maxWidth: '70%',
                  backgroundColor: msg.from === "user" ? '#FAF3E0' : '#E6F0FA',
                  alignSelf: msg.from === "user" ? 'flex-end' : 'flex-start',
                  marginLeft: msg.from === "user" ? 'auto' : '0',
                  marginRight: msg.from === "user" ? '0' : 'auto'
                }}
              >
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ padding: '0.75rem', backgroundColor: '#E6F0FA', borderRadius: '12px', maxWidth: '70%' }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'none' }}
              rows={2}
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#A3BFA4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}