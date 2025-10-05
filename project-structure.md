# Nuwa Language Room - Project Structure

```
nuwa_language_room/
├── frontend/                    # React + Tailwind frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx
│   │   │   ├── CorrectionPanel.jsx
│   │   │   └── VirtualKeyboard.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   └── user.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── config/
│   │   │   └── supabase.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ai-service/                  # Python + FastAPI microservice
│   ├── src/
│   │   ├── models/
│   │   │   └── ai_handler.py
│   │   ├── utils/
│   │   │   └── language_detector.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```