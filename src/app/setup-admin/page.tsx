
'use client';

import { useState } from 'react';

export default function SetupAdmin() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');

    const form = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
          secret: form.get('secret'),
        }),
      });

      const result = await response.json();
      setMessage(result.message || 'Request completed.');
    } catch {
      setMessage('Request failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Create Admin Account</h1>
      <form onSubmit={submit}>
        <p>Your name</p>
        <input name="name" required style={{ width: '100%', padding: 10 }} />
        <p>Admin email</p>
        <input name="email" type="email" required style={{ width: '100%', padding: 10 }} />
        <p>Password (at least 12 characters)</p>
        <input name="password" type="password" minLength={12} required style={{ width: '100%', padding: 10 }} />
        <p>Admin setup secret</p>
        <input name="secret" type="password" required style={{ width: '100%', padding: 10 }} />
        <p><button disabled={busy}>{busy ? 'Creating account…' : 'Create Admin Account'}</button></p>
      </form>
      <p>{message}</p>
    </main>
  );
}
