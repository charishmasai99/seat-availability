import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import "./App.css";

// --- PASTE YOUR ACTUAL FIREBASE CONFIG KEYS HERE ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const SESSIONS = ["Morning Track", "Afternoon Track"];

function App() {
  const [role, setRole] = useState(null); 
  const [rooms, setRooms] = useState([]); 
  const [sessionIdx, setSessionIdx] = useState(0);
  const [filter, setFilter] = useState("All");
  const [requestCount, setRequestCount] = useState("");
  const [highlights, setHighlights] = useState([]);
  const [modal, setModal] = useState({ show: false, message: "", type: "info" });
  
  const [authMode, setAuthMode] = useState("select"); 
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password Visibility State

  // LIVE SYNC & AUTO-SEED LOGIC
  useEffect(() => {
    const roomsRef = ref(db, 'rooms');
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Data exists: Sync to UI
        const roomList = Object.keys(data).map(key => ({
          ...data[key],
          fbKey: key 
        }));
        setRooms(roomList);
      } else {
        // IF DATABASE IS EMPTY: Seed with Random Initial Allotments
        const initialRooms = {};
        const roomNames = ["G-8 CSE A", "G-9 CSE B", "G-11 CSE C", "G-7 AI Nexus Lab", "G-13 Lab", "G-10 Seminar Hall"];
        
        roomNames.forEach((name, i) => {
          const cap = name.includes("Seminar") ? 150 : 72;
          const randomAttendance = Math.floor(Math.random() * (cap * 0.45)); // Start with 0-45% random occupancy
          initialRooms[`room_${i + 1}`] = {
            id: i + 1,
            name: name,
            category: name.includes("Lab") ? "Lab" : name.includes("Hall") ? "Seminar Hall" : "Classroom",
            capacity: cap,
            currentAttendance: randomAttendance,
            status: "Available"
          };
        });
        set(ref(db, 'rooms'), initialRooms);
      }
    });

    onValue(ref(db, 'currentSession'), (snap) => setSessionIdx(snap.val() || 0));
  }, []);

  const getRiskColor = (r) => {
    const ratio = r.currentAttendance / r.capacity;
    return ratio > 0.85 ? "#ef4444" : ratio > 0.6 ? "#f59e0b" : "#22c55e";
  };

  const autoAllocate = () => {
    let remaining = parseInt(requestCount);
    if (!remaining || remaining <= 0) return alert("Enter attendee count");
    const updates = {};
    const sorted = [...rooms].sort((a,b) => (b.capacity - b.currentAttendance) - (a.capacity - a.currentAttendance));
    sorted.forEach(room => {
      const space = room.capacity - room.currentAttendance;
      if (remaining > 0 && space > 0) {
        const assign = Math.min(space, remaining);
        remaining -= assign;
        const newTotal = room.currentAttendance + assign;
        updates[`rooms/${room.fbKey}/currentAttendance`] = newTotal;
        updates[`rooms/${room.fbKey}/status`] = newTotal >= room.capacity ? "Occupied" : "Available";
      }
    });
    update(ref(db), updates);
    setRequestCount("");
    setModal({ show: true, type: "success", message: "Live Cloud Allocation Synced!" });
  };

  const modifyAttendance = (fbKey, delta) => {
    const room = rooms.find(r => r.fbKey === fbKey);
    const next = Math.max(0, Math.min(room.capacity, room.currentAttendance + delta));
    update(ref(db, `rooms/${fbKey}`), {
      currentAttendance: next,
      status: next >= room.capacity ? "Occupied" : "Available"
    });
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
              <button className="auth-btn" onClick={() => setAuthMode("admin")}>Organizer Login</button>
              <button className="auth-btn secondary" onClick={() => setAuthMode("student")}>Attendee Access</button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={(e) => doLogin(e, authMode)}>
              <h3>{authMode.toUpperCase()} PORTAL</h3>
              <div className="input-group">
                <input type="text" placeholder="ID / Username" value={loginId} onChange={e => setLoginId(e.target.value)} required />
                <div className="password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <button className="auth-btn" type="submit">Login</button>
              <p onClick={() => setAuthMode("select")} className="back-link">← Back</p>
            </form>
          )}
        </div>
      </div>
    );
  }

  const totalAtt = rooms.reduce((acc, r) => acc + (r.currentAttendance || 0), 0);
  const totalCap = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);

  return (
    <div className="main-wrapper">
      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>{modal.message}</p>
            <button className="modal-close-btn" onClick={() => setModal({ ...modal, show: false })}>Acknowledge</button>
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
          <label className="sidebar-label">LIVE STATUS</label>
          <div className="session-display">
            <span className="session-dot pulse"></span>
            <span className="session-name">{SESSIONS[sessionIdx]}</span>
          </div>
          {role === 'admin' && (
            <button onClick={() => set(ref(db, 'currentSession'), (sessionIdx + 1) % 2)} className="switch-btn">Switch Session (Global)</button>
          )}
        </div>
        <div className="global-stats">
          <small className="sidebar-label" style={{color: 'rgba(255,255,255,0.6)'}}>BUILDING LOAD</small>
          <h2>{totalAtt} <span style={{fontSize:'14px', opacity: 0.7}}>/ {totalCap}</span></h2>
          <div className="progress-track" style={{height:'4px', background: 'rgba(255,255,255,0.1)'}}>
            <div className="progress-fill" style={{width:`${(totalAtt/totalCap)*100}%`, background: '#fff'}}></div>
          </div>
          <button onClick={() => {setRole(null); localStorage.removeItem('userRole')}} className="logout-link">Logout System</button>
        </div>
      </aside>

      <main className="content">
        <div className="allocation-hero">
            <label className="hero-label">Live Waterfall Allotment</label>
            <div className="allocation-input-group">
                <input type="number" placeholder="Enter students..." value={requestCount} onChange={e => setRequestCount(e.target.value)} />
                {role === 'admin' && (
                  <>
                    <button className="hero-btn" onClick={() => setHighlights(rooms.filter(r => r.currentAttendance < r.capacity).map(r => r.id))}>Analyze</button>
                    <button className="hero-btn" style={{background: '#8b5cf6'}} onClick={autoAllocate}>Sync Allotment</button>
                  </>
                )}
            </div>
        </div>

        <div className="room-grid">
          {rooms.filter(r => filter === "All" || r.category === filter).map(room => (
            <div key={room.id} className={`room-card ${highlights.includes(room.id) ? 'highlight' : ''}`}>
              <div className="room-header">
                <div><small className="card-cat">{room.category}</small><h3>{room.name}</h3></div>
                <div style={{textAlign: 'right'}}>
                  <span className={`status-pill ${room.status.toLowerCase()}`}>{room.status}</span>
                  <div style={{fontSize: '9px', fontWeight: 'bold', color: getRiskColor(room), marginTop: '5px'}}>● LIVE FEED</div>
                </div>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{width:`${(room.currentAttendance/room.capacity)*100}%`, background: getRiskColor(room)}}></div></div>
              <p className="occupancy-text">Live Attendance: <b>{room.currentAttendance} / {room.capacity}</b></p>
              {role === 'admin' && (
                <div className="admin-controls">
                  <button className="btn-update" onClick={() => modifyAttendance(room.fbKey, -1)}>− 1</button>
                  <button className="btn-update" onClick={() => modifyAttendance(room.fbKey, 1)}>+ 1</button>
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