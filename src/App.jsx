
import { useState, useEffect } from "react";
import {
  BriefcaseBusiness, LayoutDashboard, ClipboardList, Users,
  LogOut, Plus, Search, Pencil, Trash2, X, Sun, Moon,
  Eye, EyeOff, Palette
} from "lucide-react";
import "./index.css";

const themes = [
  { name: "Purple", color: "#7c3aed" },
  { name: "Light Pink", color: "#ec4899" },
  { name: "Blue", color: "#2563eb" },
  { name: "Green", color: "#16a34a" },
  { name: "Orange", color: "#ea580c" },
  { name: "Teal", color: "#0d9488" }
];

const initialJobs = [
  { id: 1, company: "Google", role: "Frontend Developer", date: "2026-11-20", status: "Applied", location: "Hyderabad" },
  { id: 2, company: "Microsoft", role: "Software Engineer", date: "2026-11-19", status: "Interview", location: "Bangalore" },
  { id: 3, company: "Amazon", role: "Web Developer", date: "2026-11-18", status: "Offer", location: "Chennai" }
];

function PasswordInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-box">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        className="eye-button"
        onClick={() => setVisible(!visible)}
        aria-label="Toggle password visibility"
      >
        {visible ? <EyeOff size={18}/> : <Eye size={18}/>}
      </button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jtUser")); }
    catch { return null; }
  });

  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jtUsers")) || []; }
    catch { return []; }
  });

  const [jobs, setJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jtJobs")) || initialJobs; }
    catch { return initialJobs; }
  });

  const [page, setPage] = useState("Dashboard");
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    company: "", role: "", date: "", status: "Applied", location: ""
  });

  const [dark, setDark] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("jtTheme") || "#7c3aed"
  );

  useEffect(() => {
    localStorage.setItem("jtUsers", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("jtJobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    if (user) localStorage.setItem("jtUser", JSON.stringify(user));
    else localStorage.removeItem("jtUser");
  }, [user]);

  useEffect(() => {
    localStorage.setItem("jtTheme", theme);
  }, [theme]);

  const passwordRules = [
    { label: "At least 8 characters", test: password.length >= 8 },
    { label: "One uppercase letter (A-Z)", test: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", test: /[a-z]/.test(password) },
    { label: "One number (0-9)", test: /[0-9]/.test(password) },
    { label: "One special character (!@#$)", test: /[^A-Za-z0-9]/.test(password) }
  ];

  const strongPassword = passwordRules.every(r => r.test);

  function handleAuth(e) {
    e.preventDefault();

    if (signup) {
      if (!strongPassword) {
        alert("Please create a strong password following all rules.");
        return;
      }

      const exists = users.some(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (exists) {
        alert("This email is already registered. Please login.");
        return;
      }

      const newUser = { name, email, password, role };
      const updatedUsers = [...users, newUser];

      setUsers(updatedUsers);
      setUser(newUser);
      setPage("Dashboard");
    } else {
      if (email === "admin@jobtrack.com" && password === "admin123") {
        setUser({ name: "Admin", email, role: "Admin" });
        setPage("Dashboard");
        return;
      }

      const found = users.find(
        u => u.email.toLowerCase() === email.toLowerCase()
          && u.password === password
      );

      if (found) {
        setUser(found);
        setPage("Dashboard");
      } else {
        alert("Invalid email or password. Please register first.");
      }
    }

    setPassword("");
  }

  function logout() {
    setUser(null);
    setPage("Dashboard");
    setEmail("");
    setPassword("");
  }

  function openAdd() {
    setEditing(null);
    setForm({ company: "", role: "", date: "", status: "Applied", location: "" });
    setShowForm(true);
  }

  function openEdit(job) {
    setEditing(job);
    setForm({ ...job });
    setShowForm(true);
  }

  function saveJob(e) {
    e.preventDefault();

    if (editing) {
      setJobs(jobs.map(j => j.id === editing.id ? { ...form, id: j.id } : j));
    } else {
      setJobs([{ ...form, id: Date.now() }, ...jobs]);
    }

    setShowForm(false);
  }

  function deleteJob(id) {
    if (window.confirm("Are you sure you want to delete this application?")) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  }

  const visibleJobs = jobs.filter(j => {
    const matchesSearch =
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || j.status === filter;
    return matchesSearch && matchesFilter;
  });

  const total = jobs.length;
  const applied = jobs.filter(j => j.status === "Applied").length;
  const interviews = jobs.filter(j => j.status === "Interview").length;
  const offers = jobs.filter(j => j.status === "Offer").length;

  return (
    <div className={`app ${dark ? "dark" : ""}`}
      style={{ "--accent": theme, "--accent-soft": `${theme}18` }}>

      {!user ? (
        <div className="auth-page">
          <div className="auth-card">

            <div className="logo">
              <BriefcaseBusiness size={30}/>
              <span>JobTrack</span>
            </div>

            <h1>{signup ? "Create Account" : "Welcome Back!"}</h1>
            <p className="subtitle">
              {signup ? "Create an account to get started" : "Login to track your job applications"}
            </p>

            <div className="theme-picker auth-theme">
              <Palette size={18}/>
              <span>Theme:</span>
              {themes.map(t => (
                <button
                  key={t.name}
                  title={t.name}
                  className={`color-dot ${theme === t.color ? "selected" : ""}`}
                  style={{ background: t.color }}
                  onClick={() => setTheme(t.color)}
                />
              ))}
            </div>

            <form onSubmit={handleAuth}>
              {signup && (
                <label>
                  Full Name
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter your name" required/>
                </label>
              )}

              <label>
                Email
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email" required/>
              </label>

              <label>
                Password
                <PasswordInput value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"/>
              </label>

              {signup && (
                <div className="password-rules">
                  <strong>Password requirements:</strong>
                  {passwordRules.map((r, i) => (
                    <div className={r.test ? "rule valid" : "rule"} key={i}>
                      <span>{r.test ? "✓" : "○"}</span> {r.label}
                    </div>
                  ))}
                </div>
              )}

              {signup && (
                <label>
                  Account Type
                  <select value={role} onChange={e => setRole(e.target.value)}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </label>
              )}

              <button className="primary full" type="submit">
                {signup ? "Register" : "Login"}
              </button>
            </form>

            {!signup && (
              <p className="demo-info">
                Demo Admin: admin@jobtrack.com / admin123
              </p>
            )}

            <p className="switch-text">
              {signup ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => {
                setSignup(!signup);
                setPassword("");
              }}>
                {signup ? "Login" : "Register"}
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="layout">

          <aside className="sidebar">
            <div className="logo">
              <BriefcaseBusiness size={28}/>
              <span>JobTrack</span>
            </div>

            <p className="nav-heading">MENU</p>

            <button className={`nav-item ${page === "Dashboard" ? "active" : ""}`}
              onClick={() => setPage("Dashboard")}>
              <LayoutDashboard size={19}/> Dashboard
            </button>

            <button className={`nav-item ${page === "Applications" ? "active" : ""}`}
              onClick={() => setPage("Applications")}>
              <ClipboardList size={19}/> Applications
            </button>

            {user.role === "Admin" && (
              <button className={`nav-item ${page === "Admin" ? "active" : ""}`}
                onClick={() => setPage("Admin")}>
                <Users size={19}/> Admin Panel
              </button>
            )}

            <div className="sidebar-bottom">
              <div className="profile">
                <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </div>
              </div>

              <button className="nav-item logout" onClick={logout}>
                <LogOut size={19}/> Logout
              </button>
            </div>
          </aside>

          <main className="main">
            <header className="topbar">
              <div>
                <h2>{page}</h2>
                <p>Welcome to your JobTrack workspace</p>
              </div>

              <div className="top-actions">
                <div className="theme-picker">
                  <Palette size={18}/>
                  {themes.map(t => (
                    <button
                      key={t.name}
                      title={t.name}
                      className={`color-dot ${theme === t.color ? "selected" : ""}`}
                      style={{ background: t.color }}
                      onClick={() => setTheme(t.color)}
                    />
                  ))}
                </div>

                <button className="icon-btn" onClick={() => setDark(!dark)}
                  title="Toggle dark mode">
                  {dark ? <Sun size={19}/> : <Moon size={19}/>}
                </button>
              </div>
            </header>

            {page === "Dashboard" && (
              <>
                <div className="welcome-card">
                  <div>
                    <h2>Hello, {user.name} 👋</h2>
                    <p>Keep track of your career journey.</p>
                  </div>
                  <BriefcaseBusiness size={42}/>
                </div>

                <div className="stats">
                  <Stat title="Total Applications" value={total} icon={<ClipboardList/>}/>
                  <Stat title="Applied" value={applied} icon={<BriefcaseBusiness/>}/>
                  <Stat title="Interviews" value={interviews} icon={<Users/>}/>
                  <Stat title="Offers" value={offers} icon={<Sun/>}/>
                </div>

                <ApplicationsSection
                  jobs={visibleJobs} search={search} setSearch={setSearch}
                  filter={filter} setFilter={setFilter}
                  openAdd={openAdd} openEdit={openEdit} deleteJob={deleteJob}
                />
              </>
            )}

            {page === "Applications" && (
              <ApplicationsSection
                jobs={visibleJobs} search={search} setSearch={setSearch}
                filter={filter} setFilter={setFilter}
                openAdd={openAdd} openEdit={openEdit} deleteJob={deleteJob}
              />
            )}

            {page === "Admin" && user.role === "Admin" && (
              <div className="section-card">
                <h3>Admin Panel</h3>
                <p>System overview and application management.</p>
                <div className="stats">
                  <Stat title="Registered Users" value={users.length} icon={<Users/>}/>
                  <Stat title="Applications" value={jobs.length} icon={<ClipboardList/>}/>
                  <Stat title="Interviews" value={interviews} icon={<BriefcaseBusiness/>}/>
                  <Stat title="Offers" value={offers} icon={<Sun/>}/>
                </div>
                <h3>Application Records</h3>
                <JobTable jobs={jobs} openEdit={openEdit} deleteJob={deleteJob}/>
              </div>
            )}

          </main>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? "Edit Application" : "Add Application"}</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}>
                <X/>
              </button>
            </div>

            <form onSubmit={saveJob}>
              <label>Company Name
                <input value={form.company} required
                  onChange={e => setForm({ ...form, company: e.target.value })}/>
              </label>

              <label>Job Role
                <input value={form.role} required
                  onChange={e => setForm({ ...form, role: e.target.value })}/>
              </label>

              <label>Location
                <input value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}/>
              </label>

              <label>Application Date
                <input type="date" value={form.date} required
                  onChange={e => setForm({ ...form, date: e.target.value })}/>
              </label>

              <label>Status
                <select value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Saved</option>
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary"
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button className="primary" type="submit">
                  {editing ? "Update" : "Save Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function ApplicationsSection({ jobs, search, setSearch, filter, setFilter, openAdd, openEdit, deleteJob }) {
  return (
    <div className="section-card">
      <div className="section-heading">
        <div>
          <h3>My Applications</h3>
          <p>Manage and track your job applications</p>
        </div>
        <button className="primary" onClick={openAdd}>
          <Plus size={18}/> Add Job
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18}/>
          <input placeholder="Search company or role..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option>
          <option>Saved</option>
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
      </div>

      <JobTable jobs={jobs} openEdit={openEdit} deleteJob={deleteJob}/>
    </div>
  );
}

function JobTable({ jobs, openEdit, deleteJob }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Location</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td><strong>{job.company}</strong></td>
              <td>{job.role}</td>
              <td>{job.location || "-"}</td>
              <td>{job.date}</td>
              <td>
                <span className={`status ${job.status.toLowerCase()}`}>
                  {job.status}
                </span>
              </td>
              <td>
                <button className="action-btn" onClick={() => openEdit(job)}
                  title="Edit"><Pencil size={16}/></button>
                <button className="action-btn delete" onClick={() => deleteJob(job.id)}
                  title="Delete"><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr><td colSpan="6" className="empty">No applications found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
