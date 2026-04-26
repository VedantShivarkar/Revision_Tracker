# 🧠 Spaced Repetition Tracker (PWA)

A full-stack Progressive Web App (PWA) designed to optimize learning and memory retention using the **Ebbinghaus Forgetting Curve**. 

This application allows users to log study topics and automatically schedules revision intervals (Day 0, Day 3, Day 7, Day 21, Day 90) to ensure maximum long-term retention. 

## ✨ Features
* **Automated Spaced Repetition:** Calculates the exact date you need to review a topic based on scientific memory models.
* **Smart Priority Sorting:** Missed revisions automatically jump to the top of your dashboard with high-priority tags.
* **Progress Tracking:** Gamified learning journey board to watch topics graduate from Day 0 to "Mastered".
* **Soft Deletion:** Includes a fully functional Recycle Bin to restore accidental deletions.
* **PWA Ready:** Installable directly to your mobile device (Android/iOS) or desktop for a native app experience.

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite (v8), Tailwind CSS (v4), Vite PWA Plugin
* **Backend:** Python, FastAPI
* **Database:** Firebase Firestore (NoSQL)
* **Deployment:** Vercel (Serverless Functions + Frontend Hosting)

---

## 🚀 Local Setup Instructions

### Prerequisites
* Node.js installed
* Python 3.9+ installed
* A Firebase account with a Firestore database initialized

### 1. Clone the Repository
```bash
git clone [https://github.com/VedantShivarkar/Revision_Tracker.git](https://github.com/VedantShivarkar/Revision_Tracker.git)
cd Revision_Tracker

2. Frontend Setup
⚠️ CRITICAL: This project uses Vite v8. The vite-plugin-pwa may throw a peer dependency warning during standard installation. You must use the legacy peer deps flag to bypass this conflict.

npm install --legacy-peer-deps


3. Backend Setup
Set up your Python virtual environment and install the necessary packages.

python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate
pip install -r api/requirements.txt


4. Database Credentials
Go to your Firebase Console -> Project Settings -> Service Accounts.
Generate a new private key.
Rename the downloaded file to firebase-credentials.json and place it directly inside the api/ folder.
(Note: This file is included in .gitignore and should never be pushed to a public repository).
5. Run the Application
Open two separate terminals:
Terminal 1 (Backend): uvicorn api.main:app --reload
Terminal 2 (Frontend): npm run dev
☁️ Deployment Guide (Vercel)
Deploying this app to Vercel requires specific configuration to bypass a few known quirks with Vercel's Python builder (uv) and Vite version conflicts.
Step 1: Import the Project
Import your GitHub repository into Vercel.
Step 2: Override the Install Command
Because Vercel defaults to standard npm install, the Vite v8 peer dependency conflict will crash the build.



Go to your Vercel Project Settings -> General -> Build & Development Settings.

Turn on the toggle for Install Command.

set : npm install --legacy-peer-deps


Step 3: Add Firebase Environment Variables
Since firebase-credentials.json is not pushed to GitHub, Vercel needs your keys.
Go to Settings -> Environment Variables.
Key: FIREBASE_CREDENTIALS
Value: Copy the entire contents of your firebase-credentials.json file and paste it here.
Note on the api/pyproject.toml file
You will notice an api/pyproject.toml file in this repository even though we use requirements.txt. Do not delete it. Vercel recently migrated to the uv Python package manager. When it detects requirements.txt without a pyproject.toml, it attempts to auto-generate one but fails, crashing the deployment. We have manually provided a valid pyproject.toml file to bypass this Vercel bug and ensure smooth serverless deployment.
Step 4: Deploy
Hit deploy! Once the build is green, open the URL on your mobile browser and look for the "Add to Home Screen" prompt to install the PWA.