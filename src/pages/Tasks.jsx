import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await api.getTasks();
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.createTask(title, description);
      setTitle('');
      setDescription('');
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleDone(task) {
    try {
      await api.updateTask(task.ID, {
        title: task.title,
        description: task.description,
        done: !task.done,
      });
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteTask(id);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <h1>Mis tareas</h1>
        <Link to="/profile" style={{ color: 'var(--accent)' }}>Mi perfil</Link>
        <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      {error && <p className="error">{error}</p>}

      <form className="new-task-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Título de la tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Agregar</button>
      </form>

      {loading ? (
        <p>Cargando tareas...</p>
      ) : tasks.length === 0 ? (
        <p className="empty">No tienes tareas todavía. ¡Agrega la primera!</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.ID} className={task.done ? 'task done' : 'task'}>
              <label>
                <input type="checkbox" checked={task.done} onChange={() => toggleDone(task)} />
                <div>
                  <strong>{task.title}</strong>
                  {task.description && <p>{task.description}</p>}
                </div>
              </label>
              <button className="delete-btn" onClick={() => handleDelete(task.ID)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
