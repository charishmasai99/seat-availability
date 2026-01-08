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
  const [role, setRole] = useState(null); // NULL forces the Login Page to show first
  const [rooms, setRooms] = useState([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [filter, setFilter] = useState("All");
  const [requestCount, setRequestCount] = useState("");
  const [availableHighlights, setAvailableHighlights] = useState([]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [authMode, setAuthMode] = useState("select"); 
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto-Randomize strength on session change
  useEffect(() => {
    const randomized = INITIAL_ROOMS.map(room => ({
      ...room,
      currentAttendance: Math.floor(Math.random() * (room.capacity * 0.45)),
      status: "Available"
    }));
    setRooms(randomized);
    setAvailableHighlights([]);
  }, [sessionIdx]);

  const handleAnalyze = () => {
    const count = parseInt(requestCount);
    if (!count || count <= 0) return alert("Please enter the number of students first.");
    const matchingIds = rooms.filter(r => (r.capacity - r.currentAttendance) >= count).map(r => r.id);
    setAvailableHighlights(matchingIds);
    if (matchingIds.length === 0) alert("No room has enough space.");
  };

  const accommodateInRoom = (id) => {
    const count = parseInt(requestCount);
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, currentAttendance: r.currentAttendance + count } : r)));
    setRequestCount("");
    setAvailableHighlights([]);
  };

  const doLogin = (e) => {
    e.preventDefault();
    if (loginId === 'admin123' && password === 'college@2025') setRole('admin');
    else if (loginId && password) setRole('user');
    else alert("Invalid Credentials");
  };

  // IF ROLE IS NULL, SHOW LOGIN PAGE
  if (!role) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>ClassOptima <span>PRO</span></h1>
          <form onSubmit={doLogin}>
            <div className="input-group">
              <input type="text" placeholder="ID" value={loginId} onChange={e => setLoginId(e.target.value)} required />
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁" : "🔒"}</button>
              </div>
            </div>
            <button className="auth-btn" type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰ Menu</button>
      <aside className="sidebar">
        <h1 className="logo">ClassOptima</h1>
        <div className="sidebar-section">
          <label>SESSION</label>
          <div className="session-card">
            <p>{SESSIONS[sessionIdx]}</p>
            <button onClick={() => setSessionIdx(prev => (prev + 1) % 2)}>Switch</button>
          </div>
        </div>
        <nav className="filter-nav">
          {["All", "Classroom", "Lab", "Seminar Hall"].map(cat => (
            <button key={cat} className={filter === cat ? "active" : ""} onClick={() => {setFilter(cat); setIsSidebarOpen(false);}}>{cat}</button>
          ))}
        </nav>
        <button onClick={() => setRole(null)} className="logout-btn">Logout</button>
      </aside>

      <main className="content">
        <div className="terminal-header">
          <label>SMART ALLOCATION TERMINAL</label>
          <div className="flex-row">
            <input type="number" placeholder="Number of students..." value={requestCount} onChange={e => setRequestCount(e.target.value)} />
            <button className="btn-analyze" onClick={handleAnalyze}>Analyze</button>
          </div>
        </div>

        <div className="room-grid">
          {rooms.filter(r => filter === "All" || r.category === filter).map(room => (
            <div key={room.id} className={`room-card ${availableHighlights.includes(room.id) ? 'active-highlight' : ''}`}>
              <div className="card-top">
                <h4>{room.name}</h4>
                <span className={`status ${room.status.toLowerCase()}`}>{room.status}</span>
              </div>
              <div className="progress-bar"><div className="fill" style={{ width: `${(room.currentAttendance/room.capacity)*100}%` }}></div></div>
              <div className="card-controls">
                <span>{room.currentAttendance} / {room.capacity}</span>
                {availableHighlights.includes(room.id) && <button className="btn-allot" onClick={() => accommodateInRoom(room.id)}>Add Here</button>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;