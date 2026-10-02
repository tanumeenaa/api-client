import { useState, useEffect } from "react";
import { API_URL } from "./config";

export default function App() {
  // Auth State
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // API Client State
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [activeTab, setActiveTab] = useState("Params");
  const [params, setParams] = useState([{ key: "", value: "" }]);
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("{\n  \n}");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save & History State
  const [savedRequests, setSavedRequests] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchSavedRequests(savedToken);
    }
  }, []);

  const fetchSavedRequests = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedRequests(data);
      }
    } catch (err) { console.error("Failed to load history", err); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_URL}/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      if (authMode === "login") {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        fetchSavedRequests(data.token);
      } else {
        setAuthMode("login");
        alert("Account created! Please log in.");
      }
    } catch (err) { setAuthError(err.message); } finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setResponse(null);
    setSavedRequests([]);
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: saveName,
          method,
          url,
          headers: headers.filter((h) => h.key.trim() !== ""),
          body,
        }),
      });
      if (res.ok) {
        alert("Request saved successfully!");
        setShowSaveModal(false);
        setSaveName("");
        fetchSavedRequests(token); // Refresh list
      } else {
        alert("Failed to save request.");
      }
    } catch (err) { console.error(err); }
  };

  const loadSavedRequest = (req) => {
    setMethod(req.method);
    setUrl(req.url);
    setHeaders(req.headers && req.headers.length ? req.headers : [{ key: "", value: "" }]);
    setBody(req.body || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper functions for tabs
  const addRow = (type) => {
    if (type === "Params") setParams([...params, { key: "", value: "" }]);
    else setHeaders([...headers, { key: "", value: "" }]);
  };
  const updateRow = (type, index, field, value) => {
    const setter = type === "Params" ? setParams : setHeaders;
    const current = type === "Params" ? params : headers;
    const updated = [...current];
    updated[index][field] = value;
    setter(updated);
  };
  const removeRow = (type, index) => {
    const setter = type === "Params" ? setParams : setHeaders;
    const current = type === "Params" ? params : headers;
    setter(current.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    setLoading(true);
    setError("");
    setResponse(null);
    const cleanParams = params.filter((p) => p.key.trim() !== "");
    const cleanHeaders = headers.filter((h) => h.key.trim() !== "");
    let parsedBody = body;
    if (body.trim().startsWith("{") || body.trim().startsWith("[")) {
      try { parsedBody = JSON.parse(body); } catch (e) {}
    } else if (body.trim() === "") { parsedBody = null; }

    try {
      const res = await fetch(`${API_URL}/api/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, url, params: cleanParams, headers: cleanHeaders, body: parsedBody }),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setResponse(data);
    } catch (err) { setError("Failed to send request. Check the URL and backend."); } finally { setLoading(false); }
  };

  // --- RENDER: AUTH SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">API Client</h1>
            <p className="text-slate-400 text-sm">Sign in to save your requests and history</p>
          </div>
          <div className="flex bg-slate-950 rounded-lg p-1 mb-6">
            <button onClick={() => { setAuthMode("login"); setAuthError(""); }} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${authMode === "login" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}>Login</button>
            <button onClick={() => { setAuthMode("signup"); setAuthError(""); }} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${authMode === "signup" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}>Sign Up</button>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            {authError && <div className="bg-red-900/30 border border-red-800 text-red-200 text-sm p-3 rounded-lg">{authError}</div>}
            <button type="submit" disabled={authLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors">{authLoading ? "Processing..." : (authMode === "login" ? "Log In" : "Create Account")}</button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN UI ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <h1 className="text-2xl font-bold text-white">API Client</h1>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Logged in as <span className="text-emerald-400 font-medium">{username || "User"}</span></span>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 font-medium">Logout</button>
          </div>
        </div>

        {/* Request Bar */}
        <div className="flex gap-2">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-slate-800 border border-slate-700 text-emerald-400 font-bold px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-28">
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter endpoint URL" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <button onClick={handleSend} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
            {loading ? <><span className="animate-spin">⟳</span> Sending...</> : "Send"}
          </button>
          <button onClick={() => setShowSaveModal(true)} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
            💾 Save
          </button>
        </div>

        {error && <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg text-sm">⚠️ {error}</div>}

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Request Builder */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex border-b border-slate-800">
              {["Params", "Headers", "Body"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"}`}>{tab}</button>
              ))}
            </div>
            <div className="p-4 min-h-[300px]">
              {activeTab === "Params" && (
                <div className="space-y-3">
                  {params.map((row, i) => (
                    <div key={i} className="flex gap-2">
                      <input placeholder="Key" value={row.key} onChange={(e) => updateRow("Params", i, "key", e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                      <input placeholder="Value" value={row.value} onChange={(e) => updateRow("Params", i, "value", e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                      <button onClick={() => removeRow("Params", i)} className="text-slate-500 hover:text-red-400 px-2">✕</button>
                    </div>
                  ))}
                  <button onClick={() => addRow("Params")} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-2">+ Add Parameter</button>
                </div>
              )}
              {activeTab === "Headers" && (
                <div className="space-y-3">
                  {headers.map((row, i) => (
                    <div key={i} className="flex gap-2">
                      <input placeholder="Key" value={row.key} onChange={(e) => updateRow("Headers", i, "key", e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                      <input placeholder="Value" value={row.value} onChange={(e) => updateRow("Headers", i, "value", e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                      <button onClick={() => removeRow("Headers", i)} className="text-slate-500 hover:text-red-400 px-2">✕</button>
                    </div>
                  ))}
                  <button onClick={() => addRow("Headers")} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-2">+ Add Header</button>
                </div>
              )}
              {activeTab === "Body" && (
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='{ "key": "value" }' className="w-full h-64 bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-sm text-slate-300 focus:outline-none focus:border-emerald-500 resize-none" />
              )}
            </div>
          </div>

          {/* RIGHT: Response Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-300">Response</span>
              {response && (
                <div className="flex gap-3 text-xs font-mono">
                  <span className={`px-2 py-1 rounded ${response.status >= 200 && response.status < 300 ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>{response.status}</span>
                  <span className="text-slate-400">{response.time}ms</span>
                  <span className="text-slate-400">{response.size}</span>
                </div>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-4">
              {!response && !loading && !error && (<div className="text-center text-slate-600 mt-20"><p className="text-4xl mb-2">📡</p><p className="text-sm">Send a request to see the response</p></div>)}
              {loading && <div className="text-center text-slate-400 mt-20"><p className="animate-pulse">Waiting for server...</p></div>}
              {response && (
                <>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Body</h3>
                    <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-emerald-300 overflow-x-auto">{typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : response.data}</pre>
                  </div>
                  {response.explanation && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">💡 {response.explanation.title}</h3>
                      <p className="text-sm text-slate-300 mb-3">{response.explanation.meaning}</p>
                      {response.explanation.checklist?.length > 0 && (<ul className="space-y-1">{response.explanation.checklist.map((item, i) => (<li key={i} className="text-xs text-slate-400 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> {item}</li>))}</ul>)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Saved Requests History */}
        {savedRequests.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">📚 Saved Requests History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRequests.map((req) => (
                <div key={req._id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 hover:border-emerald-500 transition-colors cursor-pointer group" onClick={() => loadSavedRequest(req)}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${req.method === "GET" ? "bg-blue-900/30 text-blue-400" : req.method === "POST" ? "bg-emerald-900/30 text-emerald-400" : "bg-slate-800 text-slate-300"}`}>{req.method}</span>
                    <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-400">{req.name}</h3>
                  <p className="text-xs text-slate-400 font-mono truncate">{req.url}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Save Request</h2>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Get User Data"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowSaveModal(false); setSaveName(""); }} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}