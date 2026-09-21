import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  function load() {
    api.getProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createProject(name, description);
      setName('');
      setDescription('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mis proyectos</h1>
        <div className="header-actions">
          <Link to="/profile">Mi perfil</Link>
          <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <form className="new-task-form" onSubmit={handleCreate}>
        <input type="text" placeholder="Nombre del proyecto" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Crear proyecto</button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : projects.length === 0 ? (
        <p className="empty">No tienes proyectos todavía.</p>
      ) : (
        <ul className="project-list">
          {projects.map((p) => (
            <li key={p.ID} className="project-card">
              <Link to={`/projects/${p.ID}`}>
                <strong>{p.name}</strong>
                {p.description && <p>{p.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
