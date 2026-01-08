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

function App() {
  const [role, setRole] = useState(null); 
  const [rooms, setRooms] = useState([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [filter, setFilter] = useState("All");
  const [requestCount, setRequestCount] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", type: "" });
  
  const [authMode, setAuthMode] = useState("select"); 
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize with random strengths
  useEffect(() => {
    const randomized = INITIAL_ROOMS.map(room => {
      const randomStart = Math.floor(Math.random() * (room.capacity * 0.45));
      return { ...room, currentAttendance: randomStart, status: "Available" };
    });
    setRooms(randomized);
  }, [sessionIdx]);

  // Alert Trigger
  const showAlert = (msg, type) => {
    setModal({ show: true, message: msg, type: type });
    setTimeout(() => setModal({ show: false, message: "", type: "" }), 3000);
  };

  // Main Bar Allocation (Waterfall)
  const handleMainAllocation = () => {
    let toAssign = parseInt(requestCount);
    if (!toAssign || toAssign <= 0) return showAlert("Please enter a valid number of students", "error");

    let successCount = 0;
    const newRooms = rooms.map(room => {
      const space = room.capacity - room.currentAttendance;
      if (toAssign > 0 && space > 0) {
        const take = Math.min(space, toAssign);
        toAssign -= take;
        successCount += take;
        return { ...room, currentAttendance: room.currentAttendance + take };
      }
      return room;
    });

    setRooms(newRooms);
    if (toAssign === 0) {
      showAlert(`Successfully allocated all ${successCount} students!`, "success");
    } else {
      showAlert(`Allocated ${successCount}. ${toAssign} students couldn't fit!`, "warning");
    }
    setRequestCount("");
  };

  // Manual Input at Each Class
  const handleManualClassUpdate = (id, value) => {
    const val = parseInt(value) || 0;
    setRooms(prev => prev.map(r => {
      if (r.id === id) {
        if (val > r.capacity) {
            showAlert(`${r.name} capacity exceeded!`, "error");
            return r;
        }
        return { ...r, currentAttendance: val, status: val >= r.capacity ? "Occupied" : "Available" };
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
          <h1>ClassOptima <span>PRO</span></h1>
          {authMode === "select" ? (
            <div className="login-options">
              <button className="auth-btn" onClick={() => setAuthMode("admin")}>Organizer Login</button>
              <button className="auth-btn secondary" onClick={() => setAuthMode("student")}>Student Access</button>
            </div>
          ) : (
            <form onSubmit={(e) => doLogin(e, authMode)}>
              <div className="input-group">
                <input type="text" placeholder="ID" value={loginId} onChange={e => setLoginId(e.target.value)} required />
                <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁" : "🔒"}</button>
                </div>
              </div>
              <button className="auth-btn" type="submit">Login</button>
              <p onClick={() => setAuthMode("select")} className="back-link">Back</p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      {modal.show && <div className={`global-alert ${modal.type}`}>{modal.message}</div>}

      <aside className="sidebar">
        <div className="sidebar-header">ClassOptima</div>
        <div className="filter-group">
          {["All", "Classroom", "Lab", "Seminar Hall"].map(cat => (
            <button key={cat} className={`filter-btn ${filter === cat ? "active" : ""}`} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>
        <div className="global-stats">
          <small>TOTAL LOAD</small>
          <h2>{rooms.reduce((a,b)=>a+b.currentAttendance,0)} / {rooms.reduce((a,b)=>a+b.capacity,0)}</h2>
          <button onClick={() => setRole(null)} className="logout-link">Logout</button>
        </div>
      </aside>

      <main className="content">
        <div className="allocation-hero">
            <label>Smart Allocation Terminal</label>
            <div className="allocation-input-group">
                <input type="number" placeholder="Enter number of students to allocate..." value={requestCount} onChange={e => setRequestCount(e.target.value)} />
                <button className="hero-btn" onClick={handleMainAllocation}>Request Allocation</button>
            </div>
        </div>

        <div className="room-grid">
          {rooms.filter(r => filter === "All" || r.category === filter).map(room => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <div><small>{room.category}</small><h3>{room.name}</h3></div>
                <span className={`status-pill ${room.status.toLowerCase()}`}>{room.status}</span>
              </div>
              
              <div className="progress-track">
                <div className="progress-fill" style={{width:`${(room.currentAttendance/room.capacity)*100}%`, background: room.currentAttendance/room.capacity > 0.8 ? '#ef4444' : '#22c55e'}}></div>
              </div>

              <div className="manual-entry">
                <label>Current Strength:</label>
                <input 
                  type="number" 
                  value={room.currentAttendance} 
                  onChange={(e) => handleManualClassUpdate(room.id, e.target.value)}
                  disabled={role !== 'admin'}
                />
                <span>/ {room.capacity}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;