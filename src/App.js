import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import confetti from 'canvas-confetti';

const CATEGORY_COLORS = {
  Work: '#b5ead7',
  Personal: '#c7ceea',
  Shopping: '#ffdac1',
  Study: '#ffb6b9',
  Other: '#e2f0cb',
};
const CATEGORY_LIST = Object.keys(CATEGORY_COLORS);

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('Personal');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const prevTasksRef = useRef([]);

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pastel-tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);
  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('pastel-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Confetti on task completion
  useEffect(() => {
    const prevTasks = prevTasksRef.current;
    tasks.forEach((task, i) => {
      const prev = prevTasks.find(t => t.id === task.id);
      if (prev && !prev.completed && task.completed) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#ffb6b9', '#b5ead7', '#c7ceea', '#ffdac1', '#e2f0cb'],
        });
      }
    });
    prevTasksRef.current = tasks;
  }, [tasks]);

  const handleAddTask = () => {
    if (input.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: input,
          completed: false,
          category,
        },
      ]);
      setInput('');
    }
  };

  const handleToggle = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleEditChange = (e) => {
    setEditingText(e.target.value);
  };

  const handleEditSave = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, text: editingText } : task));
    setEditingId(null);
    setEditingText('');
  };

  const handleEditKey = (e, id) => {
    if (e.key === 'Enter') handleEditSave(id);
    if (e.key === 'Escape') {
      setEditingId(null);
      setEditingText('');
    }
  };

  return (
    <div className="pastel-app-bg">
      <h1 className="pastel-heading">My Tasks <span role="img" aria-label="sparkle">💖</span></h1>
      <div className="add-task-floating">
        <input
          className="add-task-input"
          type="text"
          placeholder="Add a cute task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTask()}
        />
        <select
          className="category-select"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORY_LIST.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button className="add-task-btn" onClick={handleAddTask} aria-label="Add Task">
          <span className="plus-icon">＋</span>
        </button>
      </div>
      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-card${task.completed ? ' completed' : ''}`}> 
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
              />
              <span className="checkmark"></span>
            </label>
            <span
              className="category-tag"
              style={{ background: CATEGORY_COLORS[task.category] || '#e2f0cb' }}
            >
              {task.category}
            </span>
            {editingId === task.id ? (
              <input
                className="edit-task-input"
                value={editingText}
                onChange={handleEditChange}
                onBlur={() => handleEditSave(task.id)}
                onKeyDown={e => handleEditKey(e, task.id)}
                autoFocus
              />
            ) : (
              <span
                className="task-text"
                onDoubleClick={() => startEditing(task.id, task.text)}
                title="Double-click to edit"
              >
                {task.text}
              </span>
            )}
            <button className="delete-btn" onClick={() => handleDelete(task.id)} aria-label="Delete Task">
              <span className="delete-icon">🗑️</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
