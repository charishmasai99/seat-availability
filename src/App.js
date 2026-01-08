import React, { useState, useEffect } from "react";
import "./App.css";

const INITIAL_ROOMS = [
  { id: 1, name: "G-8 CSE A", category: "Classroom", capacity: 72, currentAttendance: 0, status: "Available" },
  { id: 2, name: "G-9 CSE B", category: "Classroom", capacity: 72, currentAttendance: 0, status: "Available" },
  { id: 3, name: "G-11 CSE C", category: "Classroom", capacity: 72, currentAttendance: 0, status: "Available" },
  { id: 4, name: "G-12 CSE D", category: "Classroom", capacity: 72, currentAttendance: 0, status: "Available" },
  { id: 5, name: "G-15 CSE E", category: "Classroom", capacity: 72, currentAttendance: 0, status: "Available" },
  { id: 6, name: "G-16 CSE F", category: "Classroom", capacity: 72, currentAttendance: 0, status: "Available" },
  { id: 7, name: "G-7 AI Nexus Lab", category: "Lab", capacity: 72, currentAttendance: 0, status: "Available" },
  { id: 8, name: "G-13/14 Combined Lab", category: "Lab", capacity: 134, currentAttendance: 0, status: "Available" },
  { id: 9, name: "G-10 Seminar Hall 1", category: "Seminar Hall", capacity: 90, currentAttendance: 0, status: "Available" }
];

const SESSIONS = ["Morning Session", "Afternoon Session"];

function App() {
  const [role, setRole] = useState('admin'); // Set to 'admin' for full control access
  const [rooms, setRooms] = useState([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [filter, setFilter] = useState("All");
  const [requestCount, setRequestCount] = useState("");
  const [availableHighlights, setAvailableHighlights] = useState([]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  // Initialize with Random Initial Strengths on session change
  useEffect(() => {
    const randomized = INITIAL_ROOMS.map(room => {
      const randomStart = Math.floor(Math.random() * (room.capacity * 0.45));
      return { ...room, currentAttendance: randomStart, status: "Available" };
    });
    setRooms(randomized);
    setAvailableHighlights([]);
  }, [sessionIdx]);

  // STEP 1: Analyze specific rooms that fit the request
  const handleAnalyze = () => {
    const count = parseInt(requestCount);
    if (!count || count <= 0) return alert("Please enter the number of students first.");
    
    const matchingIds = rooms
      .filter(r => (r.capacity - r.currentAttendance) >= count)
      .map(r => r.id);
    
    setAvailableHighlights(matchingIds);
    if (matchingIds.length === 0) alert("No single room has enough space for this group.");
  };

  // STEP 2: Manually accommodate students into a chosen highlighted room
  const accommodateInRoom = (id) => {
    const count = parseInt(requestCount);
    setRooms(prev => prev.map(r => {
      if (r.id === id) {
        const newTotal = r.currentAttendance + count;
        return { ...r, currentAttendance: newTotal, status: newTotal >= r.capacity ? "Occupied" : "Available" };
      }
      return r;
    }));
    setRequestCount("");
    setAvailableHighlights([]);
  };

  // Manual Update for Admin (Typing numbers directly)
  const handleManualEntry = (id, val) => {
    const num = parseInt(val) || 0;
    setRooms(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, currentAttendance: Math.min(num, r.capacity), status: num >= r.capacity ? "Occupied" : "Available" };
      }
      return r;
    }));
  };

  return (
    <div className={`app-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* Mobile Sidebar Toggle */}
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? "✕ Close" : "☰ Menu"}
      </button>

      <aside className="sidebar">
        <h1 className="logo">ClassOptima</h1>
        
        <div className="sidebar-section">
          <label>SESSION</label>
          <div className="session-card">
            <p>{SESSIONS[sessionIdx]}</p>
            <button onClick={() => setSessionIdx(prev => (prev + 1) % 2)}>Switch</button>
          </div>
        </div>

        <div className="sidebar-section">
          <label>CATEGORIES</label>
          <nav className="filter-nav">
            {["All", "Classroom", "Lab", "Seminar Hall"].map(cat => (
              <button 
                key={cat} 
                className={filter === cat ? "active" : ""} 
                onClick={() => {setFilter(cat); setIsSidebarOpen(false);}}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="load-box">
            <small>TOTAL VENUE LOAD</small>
            <h3>{rooms.reduce((a,b)=>a+b.currentAttendance,0)} / {rooms.reduce((a,b)=>a+b.capacity,0)}</h3>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="terminal-header">
          <div className="input-group">
            <label>SMART ALLOCATION TERMINAL</label>
            <div className="flex-row">
              <input 
                type="number" 
                placeholder="Number of students..." 
                value={requestCount}
                onChange={e => setRequestCount(e.target.value)}
              />
              <button className="btn-analyze" onClick={handleAnalyze}>Analyze</button>
            </div>
            {availableHighlights.length > 0 && (
              <span className="hint pulse">Select a highlighted room below</span>
            )}
          </div>
        </header>

        <div className="room-grid">
          {rooms.filter(r => filter === "All" || r.category === filter).map(room => (
            <div key={room.id} className={`room-card ${availableHighlights.includes(room.id) ? 'active-highlight' : ''}`}>
              <div className="card-top">
                <div>
                  <span className="cat-tag">{room.category}</span>
                  <h4>{room.name}</h4>
                </div>
                <span className={`status ${room.status.toLowerCase()}`}>{room.status}</span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="fill" 
                  style={{
                    width: `${(room.currentAttendance/room.capacity)*100}%`,
                    backgroundColor: room.currentAttendance/room.capacity > 0.8 ? '#ef4444' : '#22c55e'
                  }}
                ></div>
              </div>

              <div className="card-controls">
                <div className="manual-input">
                  <input 
                    type="number" 
                    value={room.currentAttendance} 
                    onChange={(e) => handleManualEntry(room.id, e.target.value)}
                    disabled={role !== 'admin'}
                  />
                  <span>/ {room.capacity}</span>
                </div>
                {availableHighlights.includes(room.id) && (
                  <button className="btn-allot" onClick={() => accommodateInRoom(room.id)}>Add Here</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;