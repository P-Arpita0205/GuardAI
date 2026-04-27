# 🛡️ GuardAI: Real-Time AI Security System

GuardAI is an advanced security platform designed to detect malicious Instagram profiles and cyberstalkers using a multi-modal AI pipeline. It combines behavioral heuristics with Gemini 2.0 Flash to provide instant, explainable risk assessments.

---

## 🚀 Core Features
- **🧠 Unified AI Pipeline**: NLP and Vision analysis in a single multi-modal call to Gemini.
- **⚡ Smart Fallback**: Automatically switches to advanced behavioral simulation if API quotas are hit.
- **🧩 Manifest V3 Extension**: Scans profiles directly within the Instagram web interface.
- **📊 Interactive Dashboard**: Visualizes risk scores, intent analysis, and historical scans.
- **🛡️ Explainable AI (XAI)**: Provides human-readable reasons for every risk assessment.

---

## 🛠️ Project Structure
- `/backend`: FastAPI server handling AI logic and behavioral analysis.
- `/dashboard`: React-based UI for managing and viewing scanned profiles.
- `/extension`: Chrome Extension for Instagram integration.

---

## 💻 Installation & Setup

### 1. Backend (Python/FastAPI)
1. **Navigate to backend**: `cd backend`
2. **Install Dependencies**: `pip install -r requirements.txt`
3. **Configure Environment**: Create a `.env` file and add your key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. **Run Server**: `uvicorn main:app --reload --host 0.0.0.0`

### 2. Dashboard (React/Vite)
1. **Navigate to dashboard**: `cd dashboard`
2. **Install Dependencies**: `npm install`
3. **Run Dev Server**: `npm run dev`

### 3. Extension (Chrome)
1. Open `chrome://extensions/`
2. Enable **Developer Mode**.
3. Click **Load Unpacked** and select the `/extension` folder.

---

## 🌐 Running on Different Computers

To run the system across multiple machines (e.g., Backend on a server, Extension on a laptop):

1. **Host the Backend**: Run the backend with `--host 0.0.0.0` to allow external connections.
2. **Find the IP Address**: On the backend machine, run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to get your local IP (e.g., `192.168.1.5`).
3. **Update the Extension**:
   - Open `extension/content.js` and `extension/popup.js`.
   - Replace `localhost:8000` with `your-ip-address:8000`.
4. **Firewall**: Ensure port `8000` is open on the host machine.

---

## 🛡️ Emergency Submission Mode (Smart Fallback)
GuardAI includes a **Smart Fallback** system. If the Gemini API hits a rate limit or exhaustion during a demo, the system automatically switches to a local behavioral engine. This ensures the dashboard always provides accurate results based on:
- Follower-to-following ratios
- Bio keyword analysis
- Profile completeness
- Emoji density

---

## 🧪 Tech Stack
- **AI**: Google Gemini 2.0 Flash
- **Backend**: FastAPI, Pydantic, Pillow
- **Frontend**: React, Vite, Lucide Icons
- **Browser**: Chrome Extension Manifest V3
