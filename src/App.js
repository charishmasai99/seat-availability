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

  // Initialize with Random Strengths on load and session change
  useEffect(() => {
    const randomized = INITIAL_ROOMS.map(room => ({
      ...room,
      currentAttendance: Math.floor(Math.random() * (room.capacity * 0.45)),
      status: "Available"
    }));
    setRooms(randomized);
    setHighlights([]);
  }, [sessionIdx]);

  const triggerAlert = (msg, type) => {
    setAlert({ show: true, message: msg, type: type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 6000);
  };

  // ANALYZE: Highlight all rooms with available space
  const handleAnalyze = () => {
    const count = parseInt(requestCount);
    if (!count || count <= 0) return triggerAlert("Enter students to analyze", "error");
    
    const availableIds = rooms
      .filter(r => r.currentAttendance < r.capacity)
      .map(r => r.id);
    
    setHighlights(availableIds);
    triggerAlert(`Analyze complete. Select 'Add Here' on a room to start waterfall for ${count} students.`, "success");
  };

  // WATERFALL LOGIC: Fills rooms sequentially starting from a specific ID
  const handleWaterfallAllocation = (startId) => {
    let toAssign = parseInt(requestCount);
    if (!toAssign) return triggerAlert("Enter a count first", "error");

    let details = [];
    let updatedRooms = [...rooms];
    const startIndex = updatedRooms.findIndex(r => r.id === startId);

    for (let i = startIndex; i < updatedRooms.length; i++) {
      let room = updatedRooms[i];
      let space = room.capacity - room.currentAttendance;

      if (toAssign > 0 && space > 0) {
        let taking = Math.min(space, toAssign);
        toAssign -= taking;
        updatedRooms[i].currentAttendance += taking;
        updatedRooms[i].status = updatedRooms[i].currentAttendance >= updatedRooms[i].capacity ? "Occupied" : "Available";
        details.push(`${updatedRooms[i].name} (+${taking})`);
      }
      if (toAssign === 0) break;
    }

    setRooms(updatedRooms);
    setRequestCount("");
    setHighlights([]);

    if (toAssign === 0) {
      triggerAlert(`Waterfall Successful: ${details.join(", ")}`, "success");
    } else {
      triggerAlert(`Partial Success: ${details.join(", ")}. ${toAssign} students remaining.`, "warning");
    }
  };

  const handleManualUpdate = (id, val) => {
    const num = parseInt(val) || 0;
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, currentAttendance: Math.min(num, r.capacity), status: num >= r.capacity ? "Occupied" : "Available" } : r)));
  };

  const doLogin = (e) => {
    e.preventDefault();
    if (loginId === 'admin123' && password === 'college@2025') setRole('admin');
    else if (loginId && password) setRole('user');
    else triggerAlert("Invalid credentials", "error");
  };

  if (!role) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>ClassOptima</h1>
          <form onSubmit={doLogin}>
            <input type="text" placeholder="ID" value={loginId} onChange={e => setLoginId(e.target.value)} required />
            <div className="password-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
            <button className="auth-btn" type="submit">Login</button>
          </form>
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
        <div className="session-card">
          <p>{SESSIONS[sessionIdx]}</p>
          <button onClick={() => setSessionIdx(prev => (prev + 1) % 2)}>Switch</button>
        </div>
        <nav className="filter-nav">
          {["All", "Classroom", "Lab", "Seminar Hall"].map(cat => (
            <button key={cat} className={filter === cat ? "active" : ""} onClick={() => {setFilter(cat); setIsSidebarOpen(false);}}>{cat}</button>
          ))}
        </nav>
        <button className="logout-btn" onClick={() => setRole(null)}>Logout</button>
      </aside>

      <main className="content">
        <div className="terminal-header">
          <label>SMART ALLOCATION TERMINAL</label>
          <div className="flex-row">
            <input type="number" placeholder="Enter students (e.g. 99)..." value={requestCount} onChange={e => setRequestCount(e.target.value)} />
            <button className="btn-analyze" onClick={handleAnalyze}>Analyze</button>
            <button className="btn-auto" onClick={() => handleWaterfallAllocation(rooms[0].id)}>Auto Allocate</button>
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
              <div className="manual-entry-row">
                <input type="number" value={room.currentAttendance} onChange={(e) => handleManualUpdate(room.id, e.target.value)} disabled={role !== 'admin'} />
                <span>/ {room.capacity}</span>
                {highlights.includes(room.id) && (
                  <button className="add-here-btn" onClick={() => handleWaterfallAllocation(room.id)}>Add Here</button>
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