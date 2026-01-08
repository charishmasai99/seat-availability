import React, { useState, useEffect } from "react";
import "./App.css";

const INITIAL_ROOMS = [
  { id: 1, name: "Main Stage (Keynote)", track: "General", category: "Hall", capacity: 500, currentAttendance: 0, status: "Available" },
  { id: 2, name: "Web Dev Workshop", track: "Technical", category: "Lab", capacity: 40, currentAttendance: 0, status: "Available" },
  { id: 3, name: "AI/ML Deep Dive", track: "Technical", category: "Lab", capacity: 40, currentAttendance: 0, status: "Available" },
  { id: 4, name: "Founder's Lounge", track: "Networking", category: "Lounge", capacity: 60, currentAttendance: 0, status: "Available" },
  { id: 5, name: "Cybersecurity Lab", track: "Technical", category: "Lab", capacity: 30, currentAttendance: 0, status: "Available" },
  { id: 6, name: "Recruiter Zone", track: "Career", category: "Hall", capacity: 100, currentAttendance: 0, status: "Available" }
];

const SESSIONS = ["Morning Track", "Afternoon Track", "Evening Social"];

function App() {
  const [role, setRole] = useState(null); 
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [filter, setFilter] = useState("All");
  const [requestCount, setRequestCount] = useState("");
  const [highlights, setHighlights] = useState([]);
  const [modal, setModal] = useState({ show: false, message: "", type: "info" });
  
  const [authMode, setAuthMode] = useState("select"); 
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  // Logic for Dynamic Risk Levels
  const getRiskColor = (r) => {
    const ratio = r.currentAttendance / r.capacity;
    if (ratio >= 1) return "#ef4444"; // Red (Full)
    if (ratio > 0.8) return "#f59e0b"; // Orange (Critical)
    return "#22c55e"; // Green (Good)
  };

  // Improved Smart Allocation for Events
  const autoAllocate = () => {
    let remaining = parseInt(requestCount);
    if (!remaining || remaining <= 0) return alert("Enter attendee count");
    
    // Prioritize rooms with most space available
    const sorted = [...rooms].sort((a,b) => (b.capacity - b.currentAttendance) - (a.capacity - a.currentAttendance));
    
    setRooms(prev => prev.map(room => {
      const space = room.capacity - room.currentAttendance;
      const assign = Math.min(space, remaining);
      if (remaining > 0 && space > 0) {
        remaining -= assign;
        const newTotal = room.currentAttendance + assign;
        return { ...room, currentAttendance: newTotal, status: newTotal >= room.capacity ? "Full" : "Available" };
      }
      return room;
    }));
    
    setRequestCount(remaining > 0 ? remaining.toString() : "");
    setModal({ show: true, type: "success", message: remaining > 0 ? `Partial Allocation: ${remaining} still waiting.` : "All Attendees Allocated Successfully!" });
  };

  useEffect(() => {
    // Simulate live event traffic on session switch
    setRooms(prev => prev.map(r => ({
      ...r,
      currentAttendance: Math.floor(Math.random() * (r.capacity * 0.3)),
      status: "Available"
    })));
  }, [sessionIdx]);

  const modifyAttendance = (id, delta) => {
    setRooms(prev => prev.map(r => {
      if (r.id === id) {
        const next = Math.max(0, Math.min(r.capacity, r.currentAttendance + delta));
        return { ...r, currentAttendance: next, status: next >= r.capacity ? "Full" : "Available" };
      }
      return r;
    }));
  };

  const doLogin = (e, type) => {
    e.preventDefault();
    if (type === 'admin' && loginId === 'admin123' && password === 'college@2025') setRole('admin');
    else if (type === 'student' && loginId && password) setRole('user');
    else alert("Invalid Credentials");
  };

  if (!role) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1 className="logo-text">ClassOptima <span>PRO</span></h1>
          {authMode === "select" ? (
            <div className="login-options">
              <button className="auth-btn" onClick={() => setAuthMode("admin")}>Event Organizer Login</button>
              <button className="auth-btn secondary" onClick={() => setAuthMode("student")}>Attendee Access</button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={(e) => doLogin(e, authMode)}>
              <h3>{authMode === 'admin' ? 'ORGANIZER' : 'ATTENDEE'} PORTAL</h3>
              <div className="input-group">
                <input type="text" placeholder="ID/Email" value={loginId} onChange={e => setLoginId(e.target.value)} required />
                <input type="password" placeholder="Access Key" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="auth-btn" type="submit">Enter Dashboard</button>
              <p onClick={() => setAuthMode("select")} className="back-link">Back to selection</p>
            </form>
          )}
        </div>
      </div>
    );
  }

  const totalAtt = rooms.reduce((acc, r) => acc + r.currentAttendance, 0);
  const totalCap = rooms.reduce((acc, r) => acc + r.capacity, 0);

  return (
    <div className="main-wrapper">
      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.type}`}>
            <div className="modal-icon">{modal.type === 'success' ? '✅' : 'ℹ️'}</div>
            <p>{modal.message}</p>
            <button className="modal-close-btn" onClick={() => setModal({ ...modal, show: false })}>Acknowledge</button>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar-header">ClassOptima</div>
        <div className="filter-group">
          <label className="sidebar-label">EVENT TRACKS</label>
          {["All", "General", "Technical", "Networking"].map(track => (
            <button key={track} className={`filter-btn ${filter === track ? "active" : ""}`} onClick={() => setFilter(track)}>
              <span>{track}</span>
              <span className="filter-badge">{track === "All" ? rooms.length : rooms.filter(r => r.track === track).length}</span>
            </button>
          ))}
        </div>
        <div className="session-widget">
          <label className="sidebar-label">LIVE STATUS</label>
          <div className="session-display">
            <span className="session-dot pulse"></span>
            <span className="session-name">{SESSIONS[sessionIdx]}</span>
          </div>
          <button onClick={() => setSessionIdx(prev => (prev + 1) % 3)} className="switch-btn">Next Session</button>
        </div>
        <div className="global-stats">
          <small className="sidebar-label" style={{color: 'rgba(255,255,255,0.6)'}}>VENUE LOAD</small>
          <h2>{totalAtt} <span style={{fontSize:'14px', opacity: 0.7}}>Attendees</span></h2>
          <div className="progress-track" style={{height:'6px', background: 'rgba(255,255,255,0.1)'}}>
            <div className="progress-fill" style={{width:`${(totalAtt/totalCap)*100}%`, background: '#60a5fa'}}></div>
          </div>
          <button onClick={() => setRole(null)} className="logout-link">Exit System</button>
        </div>
      </aside>

      <main className="content">
        <div className="allocation-hero">
            <div className="hero-info">
              <label className="hero-label">Intelligent Seating Coordinator</label>
              <p className="hero-subtext">Manage live attendee flow and session density.</p>
            </div>
            <div className="allocation-input-group">
                <input type="number" placeholder="Enter attendee count..." value={requestCount} onChange={e => setRequestCount(e.target.value)} />
                <button className="hero-btn" onClick={() => setHighlights(rooms.filter(r => r.currentAttendance < r.capacity).map(r => r.id))}>Scan Capacity</button>
                <button className="hero-btn primary-grad" onClick={autoAllocate}>Auto-Assign</button>
            </div>
        </div>

        <div className="room-grid">
          {rooms.filter(r => filter === "All" || r.track === filter).map(room => (
            <div key={room.id} className={`room-card ${highlights.includes(room.id) ? 'highlight' : ''}`}>
              <div className="room-header">
                <div><small className="card-cat">{room.track} Track</small><h3>{room.name}</h3></div>
                <div style={{textAlign: 'right'}}>
                  <span className={`status-pill ${room.status.toLowerCase()}`}>{room.status}</span>
                </div>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{width:`${(room.currentAttendance/room.capacity)*100}%`, background: getRiskColor(room)}}></div></div>
              <div className="room-footer">
                <p className="occupancy-text">Seats: <b>{room.currentAttendance} / {room.capacity}</b></p>
                <div className="risk-indicator" style={{color: getRiskColor(room)}}>
                   { (room.currentAttendance / room.capacity) > 0.8 ? "High Demand" : "Space Available"}
                </div>
              </div>
              {role === 'admin' && (
                <div className="admin-controls">
                  <button className="btn-update" onClick={() => modifyAttendance(room.id, -5)}>− 5</button>
                  <button className="btn-update" onClick={() => modifyAttendance(room.id, 5)}>+ 5</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;