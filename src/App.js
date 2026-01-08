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
  const [authMode, setAuthMode] = useState("select"); 
  const [rooms, setRooms] = useState([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [filter, setFilter] = useState("All");
  const [requestCount, setRequestCount] = useState("");
  const [highlights, setHighlights] = useState([]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const randomized = INITIAL_ROOMS.map(room => ({
      ...room,
      currentAttendance: Math.floor(Math.random() * (room.capacity * 0.45)),
      status: "Available"
    }));
    setRooms(randomized);
  }, [sessionIdx]);

  const triggerAlert = (msg, type) => {
    setAlert({ show: true, message: msg, type: type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 6000);
  };

  const handleAnalyze = () => {
    const count = parseInt(requestCount);
    if (!count || count <= 0) return triggerAlert("Enter students to analyze", "error");
    setHighlights(rooms.filter(r => r.currentAttendance < r.capacity).map(r => r.id));
    triggerAlert(`Analyzing ${count} students. Pick a room to start allocation.`, "success");
  };

  const handleManualAddHere = (roomId) => {
    if (role !== 'admin') return triggerAlert("Only Organizers can allot students", "error");
    let currentRequest = parseInt(requestCount);
    if (!currentRequest) return;

    let updatedRooms = [...rooms];
    const roomIdx = updatedRooms.findIndex(r => r.id === roomId);
    let space = updatedRooms[roomIdx].capacity - updatedRooms[roomIdx].currentAttendance;

    if (space <= 0) return triggerAlert("Room is full!", "error");

    let taking = Math.min(space, currentRequest);
    let remaining = currentRequest - taking;

    updatedRooms[roomIdx].currentAttendance += taking;
    updatedRooms[roomIdx].status = updatedRooms[roomIdx].currentAttendance >= updatedRooms[roomIdx].capacity ? "Occupied" : "Available";

    setRooms(updatedRooms);
    setRequestCount(remaining > 0 ? remaining.toString() : "");
    
    if (remaining === 0) {
        setHighlights([]);
        triggerAlert(`Success! All students allocated. SMS sent to Admin and Students.`, "success");
    } else {
        triggerAlert(`${remaining} students remaining. Pick the next room!`, "warning");
    }
  };

  const handleAutoAllocate = () => {
    if (role !== 'admin') return triggerAlert("Only Admin can Auto Allocate", "error");
    let toAssign = parseInt(requestCount);
    if (!toAssign) return;
    
    let updatedRooms = [...rooms];
    for (let i = 0; i < updatedRooms.length; i++) {
      let space = updatedRooms[i].capacity - updatedRooms[i].currentAttendance;
      if (toAssign > 0 && space > 0) {
        let taking = Math.min(space, toAssign);
        toAssign -= taking;
        updatedRooms[i].currentAttendance += taking;
        updatedRooms[i].status = updatedRooms[i].currentAttendance >= updatedRooms[i].capacity ? "Occupied" : "Available";
      }
    }
    setRooms(updatedRooms);
    setRequestCount(toAssign > 0 ? toAssign.toString() : "");
    triggerAlert("Auto Allocation Successful!", "success");
  };

  const doLogin = (e, mode) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (loginId === 'admin123' && password === 'college@2025') {
        setRole('admin');
      } else {
        alert("Invalid Admin Credentials");
      }
    } else {
      setRole('student');
    }
  };

  if (!role) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>ClassOptima</h1>
          {authMode === "select" ? (
            <div className="login-options">
              <button className="auth-btn" onClick={() => setAuthMode("admin")}>Organizer Login</button>
              <button className="auth-btn secondary" onClick={() => setAuthMode("student")}>Attendee Access</button>
            </div>
          ) : (
            <form onSubmit={(e) => doLogin(e, authMode)}>
              <h3>{authMode.toUpperCase()} LOGIN</h3>
              <input type="text" placeholder="ID" value={loginId} onChange={e => setLoginId(e.target.value)} required />
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁" : "🔒"}</button>
              </div>
              <button className="auth-btn" type="submit">Login</button>
              <p className="back-link" onClick={() => setAuthMode("select")}>← Back to Selection</p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {alert.show && <div className={`global-alert ${alert.type}`}>{alert.message}</div>}
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰ Menu</button>
      
      <aside className="sidebar">
        <h1 className="logo">ClassOptima</h1>
        <div className="sidebar-section">
          <label>SESSION</label>
          <div className="session-card">
            <span>{SESSIONS[sessionIdx]}</span>
            <button onClick={() => setSessionIdx(prev => (prev + 1) % 2)}>Switch</button>
          </div>
        </div>
        <nav className="filter-nav">
          <label>CATEGORIES</label>
          {["All", "Classroom", "Lab", "Seminar Hall"].map(cat => (
            <button key={cat} className={filter === cat ? "active" : ""} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </nav>
        <div className="venue-load">
            <small>ROLE: {role.toUpperCase()}</small>
            <h2>{rooms.reduce((a,b)=>a+b.currentAttendance,0)} / 728</h2>
        </div>
        <button className="logout-btn" onClick={() => {setRole(null); setAuthMode("select");}}>Logout</button>
      </aside>

      <main className="content">
        <div className="terminal-header">
          <label>SMART ALLOCATION TERMINAL</label>
          <div className="flex-row">
            <input type="number" placeholder="Enter students (e.g. 99)..." value={requestCount} onChange={e => setRequestCount(e.target.value)} />
            <button className="btn-analyze" onClick={handleAnalyze}>Analyze</button>
            {role === 'admin' && <button className="btn-auto" onClick={handleAutoAllocate}>Auto Allocate</button>}
          </div>
        </div>

        <div className="room-grid">
          {rooms.filter(r => filter === "All" || r.category === filter).map(room => (
            <div key={room.id} className={`room-card ${highlights.includes(room.id) ? 'active-highlight' : ''}`}>
              <div className="card-top">
                <h4>{room.name}</h4>
                <span className={`status ${room.status.toLowerCase()}`}>{room.status}</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${(room.currentAttendance/room.capacity)*100}%`, background: room.currentAttendance/room.capacity > 0.85 ? '#ef4444' : '#22c55e' }}></div>
              </div>
              <div className="card-footer">
                <div className="manual-input">
                  <input type="number" value={room.currentAttendance} onChange={(e) => {
                    if (role !== 'admin') return;
                    const val = Math.min(parseInt(e.target.value) || 0, room.capacity);
                    setRooms(prev => prev.map(r => r.id === room.id ? {...r, currentAttendance: val, status: val >= r.capacity ? 'Occupied' : 'Available'} : r));
                  }} readOnly={role !== 'admin'} />
                  <span>/ {room.capacity}</span>
                </div>
                {highlights.includes(room.id) && role === 'admin' && (
                  <button className="add-here-btn" onClick={() => handleManualAddHere(room.id)}>Add Here</button>
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