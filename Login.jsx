import React, { useState } from 'react';
import API, { setToken } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e, url = '/login') => {
    e.preventDefault();
    try {
      const res = await API.post(url, { email, password });
      const { token } = res.data;
      setToken(token);
      onLogin(token);
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const register = (e) => submit(e, '/register');

  return (
    <div className="auth-card">
      <h2>Mindra — Sign in</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <div className="row">
          <button type="submit">Sign in</button>
          <button type="button" onClick={register}>Register</button>
        </div>
      </form>
    </div>
  );
}
