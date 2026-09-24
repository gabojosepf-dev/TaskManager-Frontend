import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function TaskModal({ task, members, projectLabels, onClose, onUpdated, onDeleted, onLabelsChanged }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [assignedToId, setAssignedToId] = useState(task.assigned_to_id || '');
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : '');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [taskLabels, setTaskLabels] = useState(task.labels || []);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getComments(task.ID).then(setComments).catch((err) => setError(err.message));
    api.getSubtasks(task.ID).then(setSubtasks).catch((err) => setError(err.message));
  }, [task.ID]);

  async function handleSave() {
    try {
      await api.updateTask(task.ID, {
        title,
        description,
        priority,
        assigned_to_id: assignedToId ? Number(assignedToId) : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onUpdated();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    try {
      await api.deleteTask(task.ID);
      onDeleted();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const comment = await api.createComment(task.ID, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddSubtask(e) {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      const subtask = await api.createSubtask(task.ID, newSubtask);
      setSubtasks([...subtasks, subtask]);
      setNewSubtask('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleSubtask(subtask) {
    try {
      const updated = await api.updateSubtask(subtask.ID, { done: !subtask.done });
      setSubtasks(subtasks.map((s) => (s.ID === subtask.ID ? updated : s)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeSubtask(id) {
    try {
      await api.deleteSubtask(id);
      setSubtasks(subtasks.filter((s) => s.ID !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleLabel(label) {
    const isAttached = taskLabels.some((l) => l.ID === label.ID);
    try {
      if (isAttached) {
        await api.detachLabel(task.ID, label.ID);
        setTaskLabels(taskLabels.filter((l) => l.ID !== label.ID));
      } else {
        await api.attachLabel(task.ID, label.ID);
        setTaskLabels([...taskLabels, label]);
      }
      onLabelsChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  const doneCount = subtasks.filter((s) => s.done).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {error && <p className="error">{error}</p>}

        <label>
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Descripción
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="modal-row">
          <label>
            Prioridad
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </label>
          <label>
            Fecha límite
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>
        <label>
          Asignado a
          <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
            <option value="">Sin asignar</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.user.name}</option>
            ))}
          </select>
        </label>

        <div>
          <span className="section-label">Etiquetas</span>
          <div className="label-chip-row">
            {projectLabels.map((label) => {
              const active = taskLabels.some((l) => l.ID === label.ID);
              return (
                <button
                  key={label.ID}
                  type="button"
                  className={`label-chip ${active ? 'active' : ''}`}
                  style={{ borderColor: label.color, background: active ? label.color : 'transparent' }}
                  onClick={() => toggleLabel(label)}
                >
                  {label.name}
                </button>
              );
            })}
            {projectLabels.length === 0 && <span className="empty-hint">Crea etiquetas desde el tablero</span>}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={handleSave}>Guardar cambios</button>
          <button className="delete-btn" onClick={handleDelete}>Eliminar tarea</button>
        </div>

        <hr />

        <span className="section-label">Subtareas ({doneCount}/{subtasks.length})</span>
        <div className="subtask-list">
          {subtasks.map((s) => (
            <div key={s.ID} className="subtask-row">
              <label>
                <input type="checkbox" checked={s.done} onChange={() => toggleSubtask(s)} />
                <span className={s.done ? 'subtask-done' : ''}>{s.title}</span>
              </label>
              <button className="subtask-remove" onClick={() => removeSubtask(s.ID)}>×</button>
            </div>
          ))}
        </div>
        <form className="comment-form" onSubmit={handleAddSubtask}>
          <input
            type="text"
            placeholder="Nueva subtarea..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
          />
          <button type="submit">Agregar</button>
        </form>

        <hr />

        <span className="section-label">Comentarios</span>
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.ID} className="comment">
              <strong>{c.user.name}</strong>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
        <form className="comment-form" onSubmit={handleAddComment}>
          <input
            type="text"
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}
