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

  // Logic for Predictive Load/Risk
  const getRiskLevel = (room) => {
    const ratio = room.currentAttendance / room.capacity;
    if (ratio > 0.85) return { label: "High Risk", color: "#ef4444" };
    if (ratio > 0.6) return { label: "Medium Risk", color: "#f59e0b" };
    return { label: "Low Risk", color: "#22c55e" };
  };

  // Logic for Rule-Based Recommendation
  const getRecommendation = () => {
    const num = parseInt(requestCount);
    if (!num || isNaN(num)) return null;
    const bestFit = rooms
      .filter(r => (r.capacity - r.currentAttendance) >= num)
      .sort((a, b) => (a.capacity - a.currentAttendance) - (b.capacity - b.currentAttendance))[0];
    return bestFit ? `Recommended: ${bestFit.name} (Optimal Fit)` : "Multiple rooms required.";
  };

  // Logic for Smart Auto-Allocate
  const autoAllocate = () => {
    let remaining = parseInt(requestCount);
    if (!remaining || remaining <= 0) return alert("Please enter student count.");

    const sortedRooms = [...rooms].sort((a, b) => 
      (b.capacity - b.currentAttendance) - (a.capacity - a.currentAttendance)
    );

    let updatedRooms = [...rooms];
    let tempRemaining = remaining;

    updatedRooms = updatedRooms.map(room => {
      const available = room.capacity - room.currentAttendance;
      if (tempRemaining > 0 && available > 0) {
        const toAssign = Math.min(available, tempRemaining);
        tempRemaining -= toAssign;
        return { ...room, currentAttendance: room.currentAttendance + toAssign, status: (room.currentAttendance + toAssign) >= room.capacity ? "Occupied" : "Available" };
      }
      return room;
    });

    setRooms(updatedRooms);
    setRequestCount(tempRemaining > 0 ? tempRemaining.toString() : "");
    setModal({ 
      show: true, 
      type: tempRemaining === 0 ? "success" : "info", 
      message: tempRemaining === 0 ? "Smart Allocation Successful!" : `Partial allocation. ${tempRemaining} students remaining.` 
    });
  };

  useEffect(() => {
    setRooms(prev => prev.map(r => {
      const newPop = Math.floor(Math.random() * (r.capacity * 0.45));
      return { ...r, currentAttendance: newPop, status: newPop >= r.capacity ? "Occupied" : "Available" };
    }));
  }, [sessionIdx]);

  const modifyAttendance = (id, delta) => {
    setRooms(prev => prev.map(r => {
      if (r.id === id) {
        const next = Math.max(0, Math.min(r.capacity + 20, r.currentAttendance + delta)); // Allow slight overflow for anomaly test
        return { ...r, currentAttendance: next, status: next >= r.capacity ? "Occupied" : "Available" };
      }
      return r;
    }));
  };

  const executeAllocation = (id) => {
    const num = parseInt(requestCount);
    const room = rooms.find(r => r.id === id);
    const spaceLeft = room.capacity - room.currentAttendance;
    const assigned = Math.min(num, spaceLeft);
    modifyAttendance(id, assigned);
    const remaining = num - assigned;
    if (remaining > 0) {
      setModal({ show: true, type: "split", message: `Allocated ${assigned}. ${remaining} remaining.` });
      setRequestCount(remaining.toString());
    } else {
      setModal({ show: true, type: "success", message: `Allocation complete!` });
      setRequestCount("");
      setHighlights([]);
    }
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
          <h1 className="logo-text">ClassOptima</h1>
          {authMode === "select" ? (
            <div className="login-options">
              <button className="auth-btn" onClick={() => setAuthMode("admin")}>Administrator Login</button>
              <button className="auth-btn secondary" onClick={() => setAuthMode("student")}>Student Login</button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={(e) => doLogin(e, authMode)}>
              <h3>{authMode.toUpperCase()} PORTAL</h3>
              <div className="input-group">
                <input type="text" placeholder="ID" value={loginId} onChange={e => setLoginId(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="auth-btn" type="submit">Login</button>
              <p onClick={() => setAuthMode("select")} className="back-link">Back</p>
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
            <p>{modal.message}</p>
            <button className="modal-close-btn" onClick={() => setModal({ ...modal, show: false })}>Continue</button>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar-header">ClassOptima</div>
        <div className="filter-group">
          <label className="sidebar-label">ROOM CATEGORIES</label>
          {["All", "Classroom", "Lab", "Seminar Hall"].map(cat => (
            <button key={cat} className={`filter-btn ${filter === cat ? "active" : ""}`} onClick={() => setFilter(cat)}>
              <span>{cat === "All" ? "View All" : cat + "s"}</span>
              <span className="filter-badge">{cat === "All" ? rooms.length : rooms.filter(r => r.category === cat).length}</span>
            </button>
          ))}
        </div>
        <div className="session-widget">
          <label className="sidebar-label">ACTIVE SESSION</label>
          <div className="session-display">
            <span className="session-dot"></span>
            <span className="session-name">{SESSIONS[sessionIdx]}</span>
          </div>
          <button onClick={() => setSessionIdx(prev => (prev + 1) % 2)} className="switch-btn">Switch Session</button>
        </div>
        <div className="global-stats">
          <small className="sidebar-label" style={{color: 'rgba(255,255,255,0.6)'}}>BUILDING LOAD</small>
          <h2>{totalAtt} <span style={{fontSize:'14px', opacity: 0.7}}>/ {totalCap}</span></h2>
          <div className="progress-track" style={{height:'4px', background: 'rgba(255,255,255,0.1)'}}>
            <div className="progress-fill" style={{width:`${(totalAtt/totalCap)*100}%`, background: '#fff'}}></div>
          </div>
          <button onClick={() => setRole(null)} className="logout-link">Logout System</button>
        </div>
      </aside>

      <main className="content">
        <div className="allocation-hero">
            <label className="hero-label">Intelligent Resource Allocation</label>
            <div className="allocation-input-group">
                <input type="number" placeholder="Enter students (e.g. 90)" value={requestCount} onChange={e => setRequestCount(e.target.value)} />
                <button className="hero-btn" onClick={() => setHighlights(rooms.filter(r => r.currentAttendance < r.capacity).map(r => r.id))}>Analyze Space</button>
                <button className="hero-btn auto-btn" onClick={autoAllocate}>Auto-Allocate</button>
            </div>
            {requestCount && <div className="recommendation-text">💡 {getRecommendation()}</div>}
        </div>

        <div className="room-grid">
          {rooms.filter(r => filter === "All" || r.category === filter).map(room => {
            const risk = getRiskLevel(room);
            return (
              <div key={room.id} className={`room-card ${highlights.includes(room.id) ? 'highlight' : ''}`}>
                <div className="room-header">
                  <div><small className="card-cat">{room.category}</small><h3>{room.name}</h3></div>
                  <div className="status-container">
                    <span className={`status-pill ${room.status.toLowerCase()}`}>{room.status}</span>
                    <span className="risk-indicator" style={{color: risk.color}}>● {risk.label}</span>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{width:`${(room.currentAttendance/room.capacity)*100}%`, background: risk.color}}></div>
                </div>
                <p className="occupancy-text">Occupancy: <b>{room.currentAttendance} / {room.capacity}</b></p>
                
                {/* Anomaly Detection UI */}
                {room.currentAttendance > room.capacity && (
                  <div className="anomaly-alert">⚠️ Capacity Anomaly Detected</div>
                )}

                {highlights.includes(room.id) && <button className="btn-confirm" onClick={() => executeAllocation(room.id)}>Assign Part</button>}
                {role === 'admin' && (
                  <div className="admin-controls">
                    <button className="btn-update" onClick={() => modifyAttendance(room.id, -1)}>− 1</button>
                    <button className="btn-update" onClick={() => modifyAttendance(room.id, 1)}>+ 1</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App;