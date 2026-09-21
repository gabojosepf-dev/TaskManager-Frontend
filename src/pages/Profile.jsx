import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Profile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        setName(data.name);
        setPhone(data.phone);
        setEmail(data.email);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await api.updateProfile(name, phone);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="page-loading">Cargando perfil...</p>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mi perfil</h1>
        <Link to="/projects">Volver a proyectos</Link>
      </header>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Perfil actualizado</p>}
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>
          Email (no editable)
          <input type="email" value={email} disabled />
        </label>
        <label>
          Nombre
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Teléfono
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
}
