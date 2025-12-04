import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/Module';
import { setToken } from './api';

function App() {
  const [token, setTokenState] = useState(localStorage.getItem('mindra_token') || null);
  const [page, setPage] = useState({ name: 'dashboard', params: {} });

  useEffect(() => {
    setToken(token);
    if (token) {
      localStorage.setItem('mindra_token', token);
    } else {
      localStorage.removeItem('mindra_token');
    }
  }, [token]);

  const handleNavigate = (name, params = {}) => setPage({ name, params });
  const logout = () => setTokenState(null);

  if (!token) {
    return <Login onLogin={(t) => setTokenState(t)} />;
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-grid">
          <h1 className="brand">Mindra</h1>
          <nav>
            <button onClick={() => handleNavigate('dashboard')}>Dashboard</button>
            <button onClick={logout}>Logout</button>
          </nav>
        </div>
      </header>

      <main className="container">
        {page.name === 'dashboard' && <Dashboard onOpenModule={(id) => handleNavigate('module', { id })} />}
        {page.name === 'module' && <ModulePage moduleId={page.params.id} onDone={() => handleNavigate('dashboard')} />}
      </main>

      <footer className="site-footer container">
        <small>© {new Date().getFullYear()} Mindra</small>
      </footer>
    </div>
  );
}

export default App;
