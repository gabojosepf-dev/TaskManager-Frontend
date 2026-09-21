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
  const [title, setTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [id]);

  async function loadAll() {
    try {
      const [projectData, tasksData] = await Promise.all([
        api.getProject(id),
        api.getTasks(id),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      </header>

      {error && <p className="error">{error}</p>}

      <div className="board-toolbar">
        <form onSubmit={handleCreateTask}>
          <input
            type="text"
            placeholder="Nueva tarea..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit">Agregar</button>
        </form>

        <form onSubmit={handleAddMember}>
          <input
            type="email"
            placeholder="Invitar por email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <button type="submit">Invitar</button>
        </form>
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
                <TaskCard
                  key={task.ID}
                  task={task}
                  onDragStart={handleDragStart}
                  onClick={setSelectedTask}
                />
              ))}
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={project.members || []}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => { setSelectedTask(null); loadAll(); }}
          onDeleted={() => { setSelectedTask(null); loadAll(); }}
        />
      )}
    </div>
  );
}
