export default function TaskCard({ task, onDragStart, onClick }) {
  const priorityColors = {
    low: '#4caf50',
    medium: '#ffb74d',
    high: '#ff7043',
    urgent: '#ff5c5c',
  };

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick(task)}
    >
      <div className="task-card-top">
        <span className="priority-dot" style={{ background: priorityColors[task.priority] || '#888' }} />
        <strong>{task.title}</strong>
      </div>
      {task.description && <p>{task.description}</p>}
      <div className="task-card-bottom">
        {task.due_date && <span className="due-date">{new Date(task.due_date).toLocaleDateString()}</span>}
        {task.assigned_to && <span className="assignee">{task.assigned_to.name}</span>}
      </div>
    </div>
  );
}
