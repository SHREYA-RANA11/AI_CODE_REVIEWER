# 🤖 AI Code Reviewer

**Instant AI-powered pull request reviews — like having a senior developer review your code in 10 seconds.**

![React](https://img.shields.io/badge/React-18.x-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933)
![Express](https://img.shields.io/badge/Express-4.x-000000)
![Groq](https://img.shields.io/badge/Groq-LLM-ff69b4)

---

## ✨ Live Demo

> Frontend: http://localhost:3000
> Backend: http://localhost:3001

---

## 📋 What It Does

Paste any GitHub Pull Request link and get:

* 🐛 Bugs found with severity levels
* 🔒 Security vulnerability detection
* ⚡ Performance issue analysis
* 💡 Improvement suggestions
* 📈 Overall code quality score

**Review time: 5–10 seconds instead of 30+ minutes manually.**

---

## 🏗️ Tech Stack

| Layer       | Technology         |
| ----------- | ------------------ |
| Frontend    | React.js           |
| Backend     | Node.js + Express  |
| API         | GitHub REST API    |
| AI Model    | Groq Llama 3.3 70B |
| HTTP Client | Axios              |

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ai-code-reviewer.git
cd ai-code-reviewer
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
```

### 4. Setup Environment Variables

Create a `.env` file:

```env
PORT=3001
GITHUB_TOKEN=your_github_token
GROQ_API_KEY=your_groq_api_key
```

### 5. Start Backend

```bash
node index.js
```

### 6. Start Frontend

```bash
cd client
npm start
```

### 7. Open Browser

```text
http://localhost:3000
```

---

## 🎮 Example Pull Requests

```text
https://github.com/facebook/react/pull/1234
https://github.com/vercel/next.js/pull/70001
```

---

## 📁 Project Structure

```text
ai-code-reviewer/
├── client/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── index.js
├── github.js
├── aiReview.js
├── .env
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint        | Description        |
| ------ | --------------- | ------------------ |
| GET    | /api/health     | Health check       |
| POST   | /api/fetch-diff | Fetch PR diff      |
| POST   | /api/review-pr  | Generate AI review |

---

## 📊 How It Works

```text
User pastes GitHub PR URL
        ↓
Backend fetches PR diff from GitHub API
        ↓
Groq LLM analyzes code changes
        ↓
Structured review JSON returned
        ↓
Frontend displays categorized results
```

---

## 🧩 Challenges & Solutions

| Challenge             | Solution                              |
| --------------------- | ------------------------------------- |
| Inconsistent AI JSON  | Prompt engineering + fallback parsing |
| Large PR token limits | Truncated diffs to manageable size    |
| API handling errors   | Added proper error handling           |
| Slow AI responses     | Loading spinner and UI feedback       |

---

## 🚀 Future Improvements

* GitHub OAuth login
* Review history
* Dark mode
* CI/CD integration
* AI-generated code fixes
* VS Code extension

---

## 👨‍💻 Author

**Shreya Rana**
Final Year IT Student | AI/ML & Full Stack Developer

---

## ⭐ Support

If you like this project, consider giving it a star on GitHub.
