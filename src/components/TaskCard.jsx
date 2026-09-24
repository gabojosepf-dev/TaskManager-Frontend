export default function TaskCard({ task, onDragStart, onClick }) {
  const priorityColors = {
    low: '#4caf50',
    medium: '#ffb74d',
    high: '#ff7043',
    urgent: '#ff5c5c',
  };

  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const doneSubtasks = task.subtasks ? task.subtasks.filter((s) => s.done).length : 0;

  return (
    <div className="task-card" draggable onDragStart={(e) => onDragStart(e, task)} onClick={() => onClick(task)}>
      <div className="task-card-top">
        <span className="priority-dot" style={{ background: priorityColors[task.priority] || '#888' }} />
        <strong>{task.title}</strong>
      </div>
      {task.description && <p>{task.description}</p>}

      {task.labels && task.labels.length > 0 && (
        <div className="label-chip-row">
          {task.labels.map((label) => (
            <span key={label.ID} className="label-chip active" style={{ background: label.color, borderColor: label.color }}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="task-card-bottom">
        {task.due_date && <span className="due-date">{new Date(task.due_date).toLocaleDateString()}</span>}
        {totalSubtasks > 0 && <span className="due-date">{doneSubtasks}/{totalSubtasks} subtareas</span>}
        {task.assigned_to && <span className="assignee">{task.assigned_to.name}</span>}
      </div>
    </div>
  );
}
