import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function TaskModal({ task, members, onClose, onUpdated, onDeleted }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [assignedToId, setAssignedToId] = useState(task.assigned_to_id || '');
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : '');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getComments(task.ID).then(setComments).catch((err) => setError(err.message));
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

        <div className="modal-actions">
          <button onClick={handleSave}>Guardar cambios</button>
          <button className="delete-btn" onClick={handleDelete}>Eliminar tarea</button>
        </div>

        <hr />

        <h3>Comentarios</h3>
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
