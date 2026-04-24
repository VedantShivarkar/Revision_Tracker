import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([])
  const [trashedTasks, setTrashedTasks] = useState([])
  const [allTopics, setAllTopics] = useState([]) // New state for Progress
  const [newTopic, setNewTopic] = useState('')
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('dashboard') // 'dashboard', 'progress', or 'trash'

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/get-dashboard')
      const data = await res.json()
      setTasks(data.tasks || [])
      setTrashedTasks(data.recycle_bin || [])
      setAllTopics(data.all_topics || []) // Save the progress data
    } catch (error) {
      console.error("Fetch error", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddTopic = async (e) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    const today = new Date().toISOString().split('T')[0]

    await fetch('/api/add-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_name: newTopic, studied_date: today })
    })
    setNewTopic('')
    fetchData()
  }

  const handleComplete = async (id) => {
    setTasks(tasks.filter(t => t.id !== id)) 
    await fetch(`/api/complete-task/${id}`, { method: 'POST' })
    fetchData() 
  }

  const handleTrash = async (id) => {
    setTasks(tasks.filter(t => t.id !== id))
    await fetch(`/api/trash-task/${id}`, { method: 'POST' })
    fetchData()
  }

  const handleRestore = async (id) => {
    setTrashedTasks(trashedTasks.filter(t => t.id !== id))
    await fetch(`/api/restore-task/${id}`, { method: 'POST' })
    fetchData()
  }

  const handlePermanentDelete = async (id) => {
    setTrashedTasks(trashedTasks.filter(t => t.id !== id))
    await fetch(`/api/delete-task/${id}`, { method: 'DELETE' })
    fetchData()
  }

  // Tags for the To-Do Dashboard
  const getTodoTag = (intervalIndex, nextDue) => {
    const today = new Date().toISOString().split('T')[0]
    const days = [0, 3, 7, 21, 90]
    if (nextDue < today) return { text: 'Priority: Missed', color: 'bg-rose-100 text-rose-700 border-rose-200' }
    if (intervalIndex === 0) return { text: 'Due Today (New)', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    return { text: `${days[intervalIndex]}d Revision`, color: 'bg-sky-100 text-sky-700 border-sky-200' }
  }

  // Tags for the Progress Board (Shows what was COMPLETED)
  const getCheckpointBadge = (task) => {
    if (task.is_done) return { text: '🏆 Mastered (90 Days)', color: 'bg-amber-100 text-amber-700 border-amber-300' }
    if (task.interval_index === 0) return { text: 'Pending Day 0', color: 'bg-slate-100 text-slate-600 border-slate-200' }
    if (task.interval_index === 1) return { text: '✅ Day 0 Logged', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
    if (task.interval_index === 2) return { text: '✅ Day 3 Completed', color: 'bg-violet-100 text-violet-700 border-violet-200' }
    if (task.interval_index === 3) return { text: '✅ Day 7 Completed', color: 'bg-purple-100 text-purple-700 border-purple-200' }
    if (task.interval_index === 4) return { text: '✅ Day 21 Completed', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' }
    return { text: 'In Progress', color: 'bg-slate-100 text-slate-600' }
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-slate-800 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Spaced Repetition</h1>
            <p className="text-slate-500">Master your concepts with the Ebbinghaus curve.</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-sm border border-orange-100">
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-orange-100 text-orange-800' : 'text-slate-500 hover:bg-slate-50'}`}>
              To-Do
            </button>
            <button onClick={() => setView('progress')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'progress' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              Progress
            </button>
            <button onClick={() => setView('trash')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'trash' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>
              Trash
            </button>
          </div>
        </header>

        {/* VIEW ROUTER */}
        {view === 'dashboard' && (
          <>
            <form onSubmit={handleAddTopic} className="flex gap-3 mb-10 bg-white p-2 rounded-2xl shadow-sm border border-orange-100">
              <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="What did you study today?" className="flex-1 px-4 py-3 bg-transparent outline-none placeholder-slate-400" />
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shrink-0">Log Topic</button>
            </form>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Due Today
                <span className="bg-orange-200 text-orange-800 text-xs py-1 px-2 rounded-full">{tasks.length}</span>
              </h2>

              {loading ? (
                <p className="text-slate-400 text-center py-10">Loading your revisions...</p>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-orange-200">
                  <p className="text-slate-500">You're all caught up! Great job.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tasks.map((task) => {
                    const tag = getTodoTag(task.interval_index, task.next_due)
                    return (
                      <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-orange-300 transition-colors group gap-4">
                        <div className="flex items-center gap-4">
                          <button onClick={() => handleComplete(task.id)} className="shrink-0 w-6 h-6 rounded-full border-2 border-slate-300 hover:bg-emerald-500 hover:border-emerald-500 flex items-center justify-center transition-colors group/check">
                            <svg className="w-3.5 h-3.5 text-white opacity-0 group-hover/check:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <div>
                            <h3 className="font-semibold text-lg">{task.topic_name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Last studied: {task.last_studied}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${tag.color}`}>{tag.text}</span>
                          <button onClick={() => handleTrash(task.id)} className="text-slate-300 hover:text-rose-500 transition-colors" title="Move to Recycle Bin">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* PROGRESS BOARD VIEW */}
        {view === 'progress' && (
           <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
              Learning Journey
              <span className="bg-indigo-100 text-indigo-700 text-xs py-1 px-2 rounded-full">{allTopics.length} Total</span>
            </h2>
            {allTopics.length === 0 ? (
              <p className="text-slate-400 text-center py-10">You haven't logged any topics yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {allTopics.map((task) => {
                  const badge = getCheckpointBadge(task)
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="font-semibold text-slate-700">{task.topic_name}</h3>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
         </div>
        )}

        {/* RECYCLE BIN VIEW */}
        {view === 'trash' && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-600">Recycle Bin</h2>
            {trashedTasks.length === 0 ? (
              <p className="text-slate-400 text-center py-10">Trash is empty.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {trashedTasks.map((task) => (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 opacity-75 rounded-2xl border border-slate-200 gap-4">
                    <h3 className="font-semibold text-slate-600 line-through">{task.topic_name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => handleRestore(task.id)} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-sky-50 transition-colors">Restore</button>
                      <button onClick={() => handlePermanentDelete(task.id)} className="px-3 py-1 bg-white border border-rose-200 text-rose-600 text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors shrink-0">Delete Forever</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default App