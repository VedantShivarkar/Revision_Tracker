# 🧠 Spaced Repetition Tracker

A full-stack Progressive Web App (PWA) designed to optimize learning and memory retention using the **Ebbinghaus Forgetting Curve**. 

This application allows users to log study topics and automatically schedules revision intervals (Day 0, Day 3, Day 7, Day 21, Day 90) to ensure maximum long-term retention. 

## ✨ Features
* **Automated Spaced Repetition:** Calculates the exact date you need to review a topic based on scientific memory models.
* **Smart Priority Sorting:** Missed revisions automatically jump to the top of your dashboard with high-priority tags.
* **Progress Tracking:** Gamified learning journey board to watch topics graduate from Day 0 to "Mastered".
* **Soft Deletion:** Includes a fully functional Recycle Bin to restore accidental deletions.
* **PWA Ready:** Installable directly to your mobile device or desktop for a native app experience.

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS (v4)
* **Backend:** Python, FastAPI
* **Database:** Firebase Firestore (NoSQL)
* **Deployment (Target):** Vercel (Serverless Functions + Frontend Hosting)

## 🚀 Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/VedantShivarkar/Revision_Tracker.git](https://github.com/VedantShivarkar/Revision_Tracker.git)
   cd Revision_Tracker

   Install Frontend Dependencies:

Bash
npm install
Set up the Python Backend:

Bash
python -m venv venv
source venv/Scripts/activate  # On Windows Git Bash
pip install -r api/requirements.txt
Add Firebase Credentials:
Place your firebase-credentials.json file inside the api/ directory. (Note: This file is git-ignored for security).

Run the Application:
Open two terminals:

Terminal 1 (Backend): uvicorn api.main:app --reload

Terminal 2 (Frontend): npm run dev