# 🎥 Interview Practice Platform

A full-stack AI-powered video interview platform that helps users practice job interviews by recording answers, getting scored, and receiving feedback based on face detection and expression analysis.

---

## 🚀 Features

- 🎤 Record video answers to interview questions
- 🎯 Real-time facial analysis using MediaPipe (face detection)
- 📊 Scoring based on visual and audio feedback
- 📁 Video storage and playback
- 👤 User authentication and session handling
- 🔐 JWT-secured APIs (Authorization protected)
- 💬 Feedback after submission
- 📦 MongoDB for storing interview data and videos

---

## 🧑‍💻 Developed By

| Name | Role |
|------|------|
| Ifra Zaib | Frontend Developer (React.js, UI/UX, Integration) |
| Faiez Tariq | Backend Developer (Node.js, MongoDB, MediaPipe Integration) |

---

## 🛠️ Tech Stack

### 🔹 Frontend
- React.js
- Axios
- HTML5 Video API
- MediaPipe (Face Detection)
- Bootstrap / Tailwind (if used)

### 🔹 Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (JSON Web Token)
- Multer (for video uploads)
- MediaPipe (Python OR JS integration)

---

## 🗂️ Project Structure
📦 interview-practice-platform
├── 📁 client # React Frontend
│ ├── 📁 src
│ │ ├── components # Record, Feedback, etc.
│ │ ├── axiosInstance.js
│ │ └── App.js
├── 📁 server # Node.js Backend
│ ├── 📁 routes # API Routes
│ ├── 📁 controllers # Video, Auth Logic
│ ├── 📁 uploads # Saved videos
│ └── index.js

## ⚙️ How to Run

### 🖥️ Frontend (React)

```bash
cd client
npm install
npm start
