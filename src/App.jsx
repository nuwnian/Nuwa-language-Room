import { useState, useCallback, useEffect, useRef } from "react";
import { User, Wand2, Globe, BookOpen, Sparkles } from 'lucide-react';

// Simple UI components since shadcn/ui might not be installed
const Separator = ({ className = "" }) => (
  <div className={`border-t ${className}`}></div>
);
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
      text: "こんばんは！🌙 How was your day? Feel free to chat in English, Japanese, or Mandarin!",
      id: 1,
      timestamp: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [lastCorrection, setLastCorrection] = useState({
    user: "Yesterday I go to the market and buy some fruits.",
    correction: "Yesterday I went to the market and bought some fruits.",
    translation: {
      english: "Yesterday I went to the market and bought some fruits.",
      indonesian: "Kemarin saya pergi ke pasar dan membeli beberapa buah."
    },
    explanation: {
      rule: "Use past tense verbs when talking about completed actions in the past.",
      formula: "Time + Subject + Past Verb"
    }
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Simulate AI responses
  const getAIResponse = (userMessage) => {
    const responses = [
      "That's interesting! Tell me more about it. 😊",
      "I understand how you feel. What happened next?",
      "That sounds wonderful! 🌟",
      "Thanks for sharing that with me! How are you feeling now?",
      "I'm here to listen. Please continue! 💙",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Generate correction simulation
  const generateCorrection = (text) => {
    const corrections = {
      "i am feeling good": {
        user: text,
        correction: "I am feeling good.",
        translation: {
          english: "I am feeling good.",
          indonesian: "Saya merasa baik."
        },
        explanation: {
          rule: "Remember to capitalize 'I' and end sentences with a period.",
          formula: "Subject + Verb + Adjective"
        }
      },
      "today is nice day": {
        user: text,
        correction: "Today is a nice day.",
        translation: {
          english: "Today is a nice day.",
          indonesian: "Hari ini adalah hari yang menyenangkan."
        },
        explanation: {
          rule: "Don't forget the article 'a' before 'nice day'.",
          formula: "Subject + Verb + Article + Adjective + Noun"
        }
      }
    };
    
    const lowerText = text.toLowerCase();
    return corrections[lowerText] || {
      user: text,
      correction: text,
      translation: {
        english: text,
        indonesian: "Translation would appear here"
      },
      explanation: {
        rule: "Great job! Your sentence looks good! ⭐",
        formula: "Perfect grammar structure"
      }
    };
  };

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    
    const userMessage = { 
      from: "user", 
      text: input.trim(),
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Generate correction for user input
    const correction = generateCorrection(input.trim());
    setLastCorrection(correction);
    
    setInput("");
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        from: "ai",
        text: getAIResponse(input.trim()),
        id: Date.now() + 1,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
    
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
      <main className="flex flex-1 p-4 gap-4 min-h-0">
        {/* Chatbox */}
        <Card className="flex-1 flex flex-col bg-[#F5F5DC] shadow-md h-full">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-xl max-w-xs shadow-sm ${
                  msg.from === "user"
                    ? "bg-[#FAF3E0] self-end text-gray-800 ml-auto"
                    : "bg-[#E6F0FA] self-start text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="bg-[#E6F0FA] self-start p-2 rounded-xl max-w-xs shadow-sm text-gray-800">
                <div className="flex items-center gap-1">
                  <span>Nuwa is typing</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Sticky Input Area */}
          <div className="sticky bottom-0 p-3 flex gap-2 border-t bg-[#DDE7DD] backdrop-blur-sm">
            <Textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-gray-300 focus:ring-gray-500 resize-none"
              rows={2}
            />
            <Button onClick={handleSend} className="bg-[#A3BFA4] hover:bg-[#8EA890] self-end">
              ➤
            </Button>
          </div>
        </Card>

        {/* Enhanced Correction Panel */}
        <div className="w-1/2 flex flex-col h-full bg-[#F8F5F0] p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-[#4A5D23] mb-2">Learning Breakdown</h2>
            <div className="flex items-center justify-center gap-2 text-[#6B8E4E] bg-[#E8F0E6] px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Nice try! You're improving 🌱</span>
            </div>
            <div className="flex gap-1 mt-4 justify-center">
              <button 
                onClick={() => setCurrentLanguage("EN")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  currentLanguage === "EN" 
                    ? "bg-[#6B8E4E] text-white" 
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                EN
              </button>
              <button 
                onClick={() => setCurrentLanguage("JP")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  currentLanguage === "JP" 
                    ? "bg-[#6B8E4E] text-white" 
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                JP
              </button>
              <button 
                onClick={() => setCurrentLanguage("CN")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  currentLanguage === "CN" 
                    ? "bg-[#6B8E4E] text-white" 
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                CN
              </button>
            </div>
          </div>

          {/* Combined Breakdown Card */}
          <Card className="bg-white border-0 shadow-sm rounded-2xl p-6 transition-all duration-200 hover:shadow-md flex-1">
            {/* User Section */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 bg-[#F4D4D4] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#4A5D23]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#4A5D23] mb-2">Your Sentence</h3>
                <p className="text-sm text-[#4A5D23] leading-relaxed bg-[#fce7e9] p-3 rounded-xl">
                  {lastCorrection.user}
                </p>
              </div>
            </div>

            <Separator className="my-6 bg-[#E5E7EB]" />

            {/* Correction Section */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 bg-[#E8F0E6] rounded-full flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-5 h-5 text-[#6B8E4E]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#4A5D23] mb-2">Corrected Version</h3>
                <p className="text-sm text-[#4A5D23] leading-relaxed bg-[#fce7e9] p-3 rounded-xl">
                  {lastCorrection.correction}
                </p>
              </div>
            </div>

            <Separator className="my-6 bg-[#E5E7EB]" />

            {/* Translation Section */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 bg-[#F4D4D4] rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-[#4A5D23]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#4A5D23] mb-2">Translation</h3>
                <div className="space-y-2">
                  <div className="bg-[#fce7e9] p-3 rounded-xl">
                    <p className="text-xs font-medium text-[#6B8E4E] mb-1">English</p>
                    <p className="text-sm text-[#4A5D23] leading-relaxed">
                      {lastCorrection.translation.english}
                    </p>
                  </div>
                  <div className="bg-[#fce7e9] p-3 rounded-xl">
                    <p className="text-xs font-medium text-[#6B8E4E] mb-1">Indonesian</p>
                    <p className="text-sm text-[#4A5D23] leading-relaxed">
                      {lastCorrection.translation.indonesian}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-[#E5E7EB]" />

            {/* Explanation Section */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#E8F0E6] rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-[#6B8E4E]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#4A5D23] mb-2">Grammar Explanation</h3>
                <div className="space-y-3">
                  <p className="text-sm text-[#4A5D23] leading-relaxed bg-[#fce7e9] p-3 rounded-xl">
                    {lastCorrection.explanation.rule}
                  </p>
                  <div className="bg-[#fce7e9] p-3 rounded-xl">
                    <p className="text-xs font-medium text-[#6B8E4E] mb-1">Formula</p>
                    <p className="text-sm font-medium text-[#4A5D23]">
                      {lastCorrection.explanation.formula}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Language Tip Bar */}
      <footer className="p-2 text-center text-gray-800 bg-[#DDE7DD]">
        <span className="inline-flex items-center gap-2">
          🌱 Current language: <strong>{currentLanguage}</strong> 
          {currentLanguage === "EN" && "- Try switching to Japanese (JP) or Mandarin (CN) for practice!"}
        </span>
      </footer>
    </div>
  );
}