'use client';
import { useState } from 'react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Foci');
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    if (!title) {
      setMessage('A cím kötelező!');
      return;
    }

    const response = await fetch('/api/create-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category })
    });

    const data = await response.json();

    if (data.error) {
      setMessage('Hiba: ' + data.error);
    } else {
      setMessage('Poszt sikeresen létrehozva!');
      setTitle('');
      setDescription('');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
      <h1>Új poszt létrehozása</h1>
      <div style={{ marginBottom: 15 }}>
        <label>Cím *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Mi a kérdésed?"
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 5 }}
        />
      </div>
      <div style={{ marginBottom: 15 }}>
        <label>Leírás</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Részletek..."
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 5, height: 100 }}
        />
      </div>
      <div style={{ marginBottom: 15 }}>
        <label>Kategória</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 5 }}
        >
          <option>Foci</option>
          <option>Lakhatás</option>
          <option>Politika</option>
          <option>Technológia</option>
          <option>Autók</option>
        </select>
      </div>
      <button
        onClick={handleSubmit}
        style={{ width: '100%', padding: 12, backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
      >
        Poszt közzététele
      </button>
      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
}