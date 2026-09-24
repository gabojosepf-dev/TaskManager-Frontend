import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const columns = [
  { key: 'todo', label: 'Por hacer' },
  { key: 'in_progress', label: 'En progreso' },
  { key: 'done', label: 'Completado' },
];

export default function ProjectBoard() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [labels, setLabels] = useState([]);
  const [activity, setActivity] = useState([]);
  const [showActivity, setShowActivity] = useState(false);

  const [title, setTitle] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#4f8cff');

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    if (!loading) loadTasks();
  }, [search, priorityFilter]);

  async function loadAll() {
    try {
      const [projectData, tasksData, statsData, labelsData] = await Promise.all([
        api.getProject(id),
        api.getTasks(id),
        api.getStats(id),
        api.getLabels(id),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setStats(statsData);
      setLabels(labelsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks() {
    try {
      const data = await api.getTasks(id, { search, priority: priorityFilter });
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadActivity() {
    try {
      const data = await api.getActivity(id);
      setActivity(data);
      setShowActivity(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.createTask(id, { title, priority: 'medium' });
      setTitle('');
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    try {
      await api.addMember(id, memberEmail);
      setMemberEmail('');
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateLabel(e) {
    e.preventDefault();
    if (!labelName.trim()) return;
    try {
      await api.createLabel(id, labelName, labelColor);
      setLabelName('');
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleDragStart(e, task) {
    e.dataTransfer.setData('taskId', task.ID);
  }

  async function handleDrop(e, status) {
    const taskId = e.dataTransfer.getData('taskId');
    try {
      await api.updateTask(taskId, { status });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="page-loading">Cargando proyecto...</p>;
  if (!project) return <p className="error">Proyecto no encontrado</p>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/projects">← Proyectos</Link>
          <h1>{project.name}</h1>
        </div>
        <button className="logout-btn" onClick={loadActivity}>Ver actividad</button>
      </header>

      {error && <p className="error">{error}</p>}

      {stats && (
        <div className="stats-bar">
          <div className="stat"><strong>{stats.total}</strong><span>Total</span></div>
          <div className="stat"><strong>{stats.todo}</strong><span>Por hacer</span></div>
          <div className="stat"><strong>{stats.in_progress}</strong><span>En progreso</span></div>
          <div className="stat"><strong>{stats.done}</strong><span>Completadas</span></div>
          <div className="stat stat-overdue"><strong>{stats.overdue}</strong><span>Vencidas</span></div>
        </div>
      )}

      <div className="board-toolbar">
        <form onSubmit={handleCreateTask}>
          <input type="text" placeholder="Nueva tarea..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <button type="submit">Agregar</button>
        </form>

        <form onSubmit={handleAddMember}>
          <input type="email" placeholder="Invitar por email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
          <button type="submit">Invitar</button>
        </form>

        <form onSubmit={handleCreateLabel}>
          <input type="text" placeholder="Nueva etiqueta" value={labelName} onChange={(e) => setLabelName(e.target.value)} />
          <input type="color" value={labelColor} onChange={(e) => setLabelColor(e.target.value)} />
          <button type="submit">Crear etiqueta</button>
        </form>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Buscar tareas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      <div className="kanban-board">
        {columns.map((col) => (
          <div
            key={col.key}
            className="kanban-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <h2>{col.label}</h2>
            {tasks
              .filter((t) => t.status === col.key)
              .map((task) => (
                <TaskCard key={task.ID} task={task} onDragStart={handleDragStart} onClick={setSelectedTask} />
              ))}
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={project.members || []}
          projectLabels={labels}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => { setSelectedTask(null); loadAll(); }}
          onDeleted={() => { setSelectedTask(null); loadAll(); }}
          onLabelsChanged={loadTasks}
        />
      )}

      {showActivity && (
        <div className="modal-overlay" onClick={() => setShowActivity(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowActivity(false)}>×</button>
            <span className="section-label">Actividad reciente</span>
            <div className="activity-list">
              {activity.length === 0 && <p className="empty">Sin actividad todavía.</p>}
              {activity.map((a) => (
                <div key={a.ID} className="activity-item">
                  <strong>{a.user.name}</strong> {a.Action || a.action}
                  <span className="activity-time">{new Date(a.CreatedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
