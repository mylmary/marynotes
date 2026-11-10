import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Clock3, ListTodo, Plus, Search, Trash2, X, Pencil } from 'lucide-react';

type Note = { id: string; title: string; body: string; createdAt: string; updatedAt: string };
type Task = { id: string; title: string; date: string; time: string; done: boolean; createdAt: string };

const NOTES_KEY = 'mynotes_notes_v1';
const TASKS_KEY = 'mynotes_tasks_v1';
const today = () => new Date().toISOString().slice(0, 10);
const prettyDate = (value: string) => new Date(value + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const uid = () => Math.random().toString(36).slice(2, 10);

function Flower({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" aria-hidden="true"><g fill="#f5c6c9" stroke="#d99ba9" strokeWidth="1.4"><ellipse cx="50" cy="22" rx="12" ry="20"/><ellipse cx="50" cy="78" rx="12" ry="20"/><ellipse cx="22" cy="50" rx="20" ry="12"/><ellipse cx="78" cy="50" rx="20" ry="12"/><ellipse cx="30" cy="30" rx="12" ry="19" transform="rotate(-45 30 30)"/><ellipse cx="70" cy="30" rx="12" ry="19" transform="rotate(45 70 30)"/><ellipse cx="30" cy="70" rx="12" ry="19" transform="rotate(45 30 70)"/><ellipse cx="70" cy="70" rx="12" ry="19" transform="rotate(-45 70 70)"/></g><circle cx="50" cy="50" r="12" fill="#e9c77f"/></svg>;
}

function App() {
  const [section, setSection] = useState<'notes' | 'tasks'>('notes');
  const [notes, setNotes] = useState<Note[]>(() => { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); } catch { return []; } });
  const [tasks, setTasks] = useState<Task[]>(() => { try { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); } catch { return []; } });
  const [noteOpen, setNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(today());
  const [taskTime, setTaskTime] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }, [tasks]);

  const visibleNotes = useMemo(() => notes.filter(n => (n.title + ' ' + n.body).toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)), [notes, search]);
  const visibleTasks = useMemo(() => [...tasks].sort((a,b) => Number(a.done)-Number(b.done) || a.date.localeCompare(b.date) || a.time.localeCompare(b.time)), [tasks]);
  const openNewNote = () => { setEditingNote(null); setNoteTitle(''); setNoteBody(''); setNoteOpen(true); };
  const openEditNote = (note: Note) => { setEditingNote(note); setNoteTitle(note.title); setNoteBody(note.body); setNoteOpen(true); };
  const saveNote = () => {
    if (!noteTitle.trim() && !noteBody.trim()) return;
    const now = new Date().toISOString();
    if (editingNote) setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, title: noteTitle.trim() || 'Untitled note', body: noteBody, updatedAt: now } : n));
    else setNotes(prev => [{ id: uid(), title: noteTitle.trim() || 'Untitled note', body: noteBody, createdAt: now, updatedAt: now }, ...prev]);
    setNoteOpen(false);
  };
  const addTask = () => {
    if (!taskTitle.trim()) return;
    setTasks(prev => [{ id: uid(), title: taskTitle.trim(), date: taskDate, time: taskTime, done: false, createdAt: new Date().toISOString() }, ...prev]);
    setTaskTitle(''); setTaskDate(today()); setTaskTime(''); setTaskOpen(false);
  };

  return <div className="app-shell">
    <div className="decor decor-one"><Flower /></div><div className="decor decor-two"><Flower /></div>
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Flower /></div><div><div className="brand-name">My Notes</div><div className="brand-subtitle">a little space for your thoughts</div></div></div>
      <div className="top-date">{new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})}</div>
    </header>
    <main className="workspace">
      <aside className="welcome-panel">
        <div className="welcome-flower"><Flower /></div>
        <p className="eyebrow">YOUR LITTLE CORNER</p>
        <h1>Keep your thoughts<br/><em>close to heart.</em></h1>
        <p className="welcome-copy">A gentle place for the things you want to remember and the things you want to do.</p>
        <div className="welcome-note">“Small steps, lovely days.”</div>
      </aside>
      <section className="main-panel">
        <nav className="tabs" aria-label="Main sections">
          <button className={section === 'notes' ? 'tab active' : 'tab'} onClick={() => setSection('notes')}><BookOpen size={18}/> Notes</button>
          <button className={section === 'tasks' ? 'tab active' : 'tab'} onClick={() => setSection('tasks')}><ListTodo size={18}/> Tasks <span className="task-count">{tasks.filter(t=>!t.done).length}</span></button>
        </nav>
        {section === 'notes' ? <div className="section-content">
          <div className="section-heading"><div><p className="eyebrow">YOUR THOUGHTS, ALL IN ONE PLACE</p><h2>My notes <span>✿</span></h2><p className="muted">Write it down, come back to it anytime.</p></div><button className="primary-btn" onClick={openNewNote}><Plus size={18}/> New note</button></div>
          <div className="search-wrap"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a note..." aria-label="Search notes"/></div>
          {visibleNotes.length ? <div className="notes-grid">{visibleNotes.map((note,i)=><article className={'note-card note-'+(i%4)} key={note.id}><div className="note-card-top"><span className="note-date">{prettyDate(note.createdAt.slice(0,10))}</span><div className="card-actions"><button aria-label="Edit note" onClick={()=>openEditNote(note)}><Pencil size={15}/></button><button aria-label="Delete note" onClick={()=>setNotes(prev=>prev.filter(n=>n.id!==note.id))}><Trash2 size={15}/></button></div></div><h3>{note.title}</h3><p>{note.body || 'A little note to remember...'}</p><button className="edit-link" onClick={()=>openEditNote(note)}>Open note <span>↗</span></button></article>)}</div> : <div className="empty-state"><div className="empty-flower"><Flower /></div><h3>{search ? 'No notes found' : 'Your pages are waiting'}</h3><p>{search ? 'Try another search.' : 'Start with a thought, a reminder, or something lovely.'}</p>{!search && <button className="soft-btn" onClick={openNewNote}>Write your first note</button>}</div>}
        </div> : <div className="section-content">
          <div className="section-heading"><div><p className="eyebrow">ONE THING AT A TIME</p><h2>My tasks <span>✿</span></h2><p className="muted">Make a plan, then enjoy each little win.</p></div><button className="primary-btn" onClick={()=>setTaskOpen(true)}><Plus size={18}/> Add task</button></div>
          <div className="task-summary"><div><strong>{tasks.filter(t=>!t.done).length}</strong><span>to do</span></div><div className="summary-divider"/><div><strong>{tasks.filter(t=>t.done).length}</strong><span>completed</span></div><div className="summary-flower"><Flower /></div></div>
          {visibleTasks.length ? <div className="task-list">{visibleTasks.map(task=><div className={task.done?'task-row completed':'task-row'} key={task.id}><button className="check-btn" aria-label={task.done?'Mark incomplete':'Mark complete'} onClick={()=>setTasks(prev=>prev.map(t=>t.id===task.id?{...t,done:!t.done}:t))}>{task.done && <Check size={15}/>}</button><div className="task-info"><div className="task-title">{task.title}</div><div className="task-meta"><span>{prettyDate(task.date)}</span>{task.time && <span><Clock3 size={13}/>{task.time}</span>}</div></div><button className="delete-task" aria-label="Delete task" onClick={()=>setTasks(prev=>prev.filter(t=>t.id!==task.id))}><Trash2 size={16}/></button></div>)}</div> : <div className="empty-state task-empty"><div className="empty-flower"><Flower /></div><h3>Nothing on your list yet</h3><p>Add a task when you’re ready. You’ve got this.</p><button className="soft-btn" onClick={()=>setTaskOpen(true)}>Add your first task</button></div>}
        </div>}
      </section>
    </main>
    <footer className="footer">Made for your notes, plans, and little everyday moments <span>✿</span></footer>
    {noteOpen && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setNoteOpen(false);}}><div className="modal"><div className="modal-head"><div><p className="eyebrow">A FRESH PAGE</p><h2>{editingNote?'Edit note':'New note'}</h2></div><button className="close-btn" onClick={()=>setNoteOpen(false)} aria-label="Close"><X/></button></div><label>Title<input autoFocus value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Give your note a title"/></label><label>Your note<textarea value={noteBody} onChange={e=>setNoteBody(e.target.value)} placeholder="Start writing..." rows={7}/></label><div className="modal-date">Date: {prettyDate(editingNote?editingNote.createdAt.slice(0,10):today())}</div><div className="modal-actions"><button className="soft-btn" onClick={()=>setNoteOpen(false)}>Cancel</button><button className="primary-btn" onClick={saveNote}>Save note</button></div></div></div>}
    {taskOpen && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setTaskOpen(false);}}><div className="modal task-modal"><div className="modal-head"><div><p className="eyebrow">A LITTLE PLAN</p><h2>Add a task</h2></div><button className="close-btn" onClick={()=>setTaskOpen(false)} aria-label="Close"><X/></button></div><label>Task<input autoFocus value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTask()} placeholder="What would you like to do?"/></label><div className="field-row"><label>Date<input type="date" value={taskDate} onChange={e=>setTaskDate(e.target.value)}/></label><label>Time <span className="optional">(optional)</span><input type="time" value={taskTime} onChange={e=>setTaskTime(e.target.value)}/></label></div><div className="modal-actions"><button className="soft-btn" onClick={()=>setTaskOpen(false)}>Cancel</button><button className="primary-btn" onClick={addTask}>Add task</button></div></div></div>}
    <nav className="mobile-nav"><button className={section==='notes'?'selected':''} onClick={()=>setSection('notes')}><BookOpen size={20}/>Notes</button><button className={section==='tasks'?'selected':''} onClick={()=>setSection('tasks')}><ListTodo size={20}/>Tasks</button></nav>
  </div>;
}
export default App;
