from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
import os

# 1. Initialize Firebase
cred_path = os.path.join(os.path.dirname(__file__), "firebase-credentials.json")
try:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Firebase Init Error: {e}")

# 2. Setup FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# Ebbinghaus curve: 3 days, 7 days, 21 days, 90 days
REVISION_INTERVALS = [3, 7, 21, 90]

class TopicInput(BaseModel):
    topic_name: str
    studied_date: str 

@app.post("/api/add-topic")
def add_topic(topic: TopicInput):
    try:
        doc_ref = db.collection(u'revisions').document()
        new_task = {
            "id": doc_ref.id,
            "topic_name": topic.topic_name,
            "last_studied": topic.studied_date,
            "next_due": topic.studied_date, # Due immediately
            "interval_index": 0,
            "is_done": False,
            "is_deleted": False # For the Recycle Bin
        }
        doc_ref.set(new_task)
        return {"message": "Success", "data": new_task}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get-dashboard")
def get_dashboard():
    try:
        docs = db.collection(u'revisions').stream()
        today = datetime.now().strftime("%Y-%m-%d")
        
        dashboard_tasks = []
        recycle_bin = []
        all_topics = [] # <-- New list for the Progress Board
        
        for doc in docs:
            task = doc.to_dict()
            
            # Sort into Recycle Bin
            if task.get('is_deleted', False):
                recycle_bin.append(task)
                continue
                
            # If it's not deleted, it belongs on your Progress Board
            all_topics.append(task)
                
            # If it's mastered forever, skip adding it to the daily to-do
            if task.get('is_done', False):
                continue
                
            # If it's due today or in the past, add to Daily Dashboard
            if task['next_due'] <= today:
                dashboard_tasks.append(task)
                
        # Priority Sorts
        dashboard_tasks.sort(key=lambda x: (x['next_due'], -x['interval_index']))
        all_topics.sort(key=lambda x: x['last_studied'], reverse=True) # Newest first
        
        return {
            "tasks": dashboard_tasks, 
            "recycle_bin": recycle_bin,
            "all_topics": all_topics # <-- Sending it to React
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/complete-task/{task_id}")
def complete_task(task_id: str):
    """Calculates the next jump on the Ebbinghaus curve."""
    try:
        doc_ref = db.collection(u'revisions').document(task_id)
        task = doc_ref.get().to_dict()
        
        current_index = task.get('interval_index', 0)
        
        # If they finished the 90-day revision, they mastered it!
        if current_index >= len(REVISION_INTERVALS):
            doc_ref.update({"is_done": True})
            return {"message": "Topic Mastered!"}
            
        # Calculate next due date
        days_to_add = REVISION_INTERVALS[current_index]
        next_index = current_index + 1
        
        # Always calculate the next jump from TODAY, not the old missed date
        today = datetime.now()
        next_due = (today + timedelta(days=days_to_add)).strftime("%Y-%m-%d")
        
        doc_ref.update({
            "interval_index": next_index,
            "next_due": next_due,
            "last_studied": today.strftime("%Y-%m-%d")
        })
        return {"message": "Task advanced"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trash-task/{task_id}")
def trash_task(task_id: str):
    """Moves a task to the recycle bin."""
    db.collection(u'revisions').document(task_id).update({"is_deleted": True})
    return {"message": "Moved to trash"}

@app.post("/api/restore-task/{task_id}")
def restore_task(task_id: str):
    """Restores a task from the recycle bin."""
    db.collection(u'revisions').document(task_id).update({"is_deleted": False})
    return {"message": "Restored"}

@app.delete("/api/delete-task/{task_id}")
def delete_task(task_id: str):
    """Permanently deletes a task."""
    db.collection(u'revisions').document(task_id).delete()
    return {"message": "Deleted permanently"}