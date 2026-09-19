'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
    });
    if (response.ok) window.location.reload();
    else {
      setError('Parol noto‘g‘ri.');
      setLoading(false);
    }
  }

  return (
    <main className="admin-denied">
      <form className="admin-login" onSubmit={submit}>
        <a className="logo" href="/"><span>Robiya</span><small>shop</small></a>
        <h1>Admin panel</h1>
        <p>Mahsulot rasmlari va narxlarini boshqarish uchun parolni kiriting.</p>
        <label htmlFor="admin-password">Parol</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error && <span className="admin-error" role="alert">{error}</span>}
        <button type="submit" disabled={loading}>{loading ? 'Tekshirilmoqda…' : 'Kirish'}</button>
        <a href="/">Do‘konga qaytish</a>
      </form>
    </main>
  );
}
