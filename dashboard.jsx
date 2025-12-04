import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard({ onOpenModule }) {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    async function load() {
      const m = await API.get('/modules');
      setModules(m.data);
      try {
        const p = await API.get('/progress');
        setProgress(p.data);
      } catch (e) {
        // ignore if not authorized
      }
    }
    load();
  }, []);

  function progressFor(modId) {
    const p = progress.find(x => x.moduleId === modId);
    if (!p) return 'Not started';
    return `Best: ${p.bestScore}% (last: ${new Date(p.lastAttempt).toLocaleString()})`;
  }

  return (
    <div>
      <h2>Modules</h2>
      <div className="grid">
        {modules.map(m => (
          <div className="card" key={m.id}>
            <h3>{m.title}</h3>
            <p className="muted">{m.level}</p>
            <p>{progressFor(m.id)}</p>
            <button onClick={() => onOpenModule(m.id)}>Open</button>
          </div>
        ))}
      </div>
    </div>
  );
}
