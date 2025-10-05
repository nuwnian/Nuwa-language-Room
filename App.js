import { useState, useCallback } from "react";

// Simple UI components since shadcn/ui might not be installed
const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, disabled, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${className}`}
  >
    {children}
  </button>
);

const Textarea = ({ placeholder, value, onChange, onKeyPress, className = "", rows = 3 }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    rows={rows}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

export default function NuwaLanguageRoom() {
  const [messages, setMessages] = useState([
    { 
      from: "ai", 
      text: "good night zan 🌙 how's your day been?",
      id: 1,
      timestamp: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    
    const newMessage = { 
      from: "user", 
      text: input.trim(),
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput("");
  }, [input]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="min-h-screen bg-[#E8F0E6] flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-[#DDE7DD] shadow">
        <h1 className="text-2xl font-bold text-gray-800">🌱 Nuwa Language Room</h1>
        <div className="rounded-full bg-[#C7D3C5] w-10 h-10 flex items-center justify-center">
          🙂
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 p-4 gap-4">
        {/* Chatbox */}
        <Card className="flex-1 flex flex-col bg-[#F5F5DC] shadow-md">
          <CardContent className="flex flex-col flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-xl max-w-xs shadow-sm ${
                  msg.from === "user"
                    ? "bg-[#FAF3E0] self-end text-gray-800"
                    : "bg-[#E6F0FA] self-start text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </CardContent>
          <div className="p-3 flex gap-2 border-t bg-[#DDE7DD]">
            <Textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-gray-300 focus:ring-gray-500"
              rows={2}
            />
            <Button onClick={handleSend} className="bg-[#A3BFA4] hover:bg-[#8EA890]">
              ➤
            </Button>
          </div>
        </Card>

        {/* Correction Panel */}
        <Card className="w-1/3 bg-white shadow-md">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">📝 Corrections</h2>
            <div className="border p-2 rounded bg-[#F2F2F2]">
              <p><strong>User Input:</strong> today i am feeling blue about something</p>
              <p><strong>Correction:</strong> Today I am feeling blue about something.</p>
              <p><strong>⭐</strong> Already correct? Yes</p>
              <p><strong>Translation (EN → ID):</strong> Hari ini saya merasa sedih tentang sesuatu.</p>
              <p><strong>Grammar:</strong> Subject + Verb + Object</p>
              <p><strong>Note:</strong> Capitalize first letter of a sentence.</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Language Tip Bar */}
      <footer className="p-2 text-center text-gray-800 bg-[#DDE7DD]">
        Looks like you're typing in English. Switch to Japanese keyboard for better practice 🌱
      </footer>
    </div>
  );
}