import { useCallback, useEffect, useState } from 'react';
import './leadership-tasks.css';

type Task = {
  id: string;
  title: string;
  description: string;
  first_name: string;
  last_name: string;
  due_date: string;
  priority: string;
  status: string;
  progress_note: string;
  overdue: boolean;
};

type Leader = {
  member_id: string;
  first_name?: string;
  last_name?: string;
  status: string;
};

export default function LeadershipTasks({
  apiBaseUrl, authFetch, role, leaders,
}: {
  apiBaseUrl: string;
  authFetch: any;
  role: string;
  leaders: Leader[];
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memberId, setMemberId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('NORMAL');

  const load = useCallback(async () => {
    try {
      const r = await authFetch(`${apiBaseUrl}/leadership-tasks`);
      if (!r.ok) throw Error('Unable to load leadership tasks');
      const data = await r.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to load tasks');
    }
  }, [apiBaseUrl, authFetch]);

  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    if (!title.trim() || !description.trim() || !memberId || !dueDate) {
      setMessage('Complete all task fields.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const r = await authFetch(`${apiBaseUrl}/leadership-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, memberId, dueDate, priority,
        }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Unable to create task'
        );
      }
      setTitle('');
      setDescription('');
      setMemberId('');
      setDueDate('');
      setOpen(false);
      await load();
      setMessage('Task assigned successfully.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to create task');
    } finally {
      setBusy(false);
    }
  };

  const update = async (task: Task, status: string, note: string) => {
    setBusy(true);
    setMessage('');
    try {
      const r = await authFetch(
        `${apiBaseUrl}/leadership-tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, progressNote: note }),
        }
      );
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Unable to update task'
        );
      }
      await load();
      setMessage('Task progress updated.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to update task');
    } finally {
      setBusy(false);
    }
  };

  const activeLeaders = Array.from(
    new Map(
      leaders
        .filter(l => l.status === 'ACTIVE' && l.member_id)
        .map(l => [l.member_id, l])
    ).values()
  );

  return (
    <section className="clgf-tasks">
      <div className="clgf-tasks-heading">
        <div>
          <h3>Leadership Task Management</h3>
          <p>Responsibilities, deadlines and ministry accountability.</p>
        </div>
        {role === 'ADMIN' && (
          <button type="button" onClick={() => setOpen(!open)}>
            {open ? 'Close' : '+ Assign Task'}
          </button>
        )}
      </div>

      <div className="clgf-tasks-stats">
        {[
          ['Total Tasks', tasks.length],
          ['Pending', tasks.filter(t => t.status === 'PENDING').length],
          ['In Progress', tasks.filter(t => t.status === 'IN_PROGRESS').length],
          ['Completed', tasks.filter(t => t.status === 'COMPLETED').length],
          ['Overdue', tasks.filter(t => t.overdue).length],
        ].map(([label, value]) => (
          <div className="clgf-tasks-stat" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {open && role === 'ADMIN' && (
        <div className="clgf-tasks-panel">
          <h3>Assign Leadership Task</h3>
          <label>Task Title
            <input value={title} onChange={e => setTitle(e.target.value)} />
          </label>
          <label>Description
            <textarea rows={3} value={description}
              onChange={e => setDescription(e.target.value)} />
          </label>
          <label>Assigned Leader
            <select value={memberId} onChange={e => setMemberId(e.target.value)}>
              <option value="">Select Leader</option>
              {activeLeaders.map(l => (
                <option key={l.member_id} value={l.member_id}>
                  {l.first_name} {l.last_name}
                </option>
              ))}
            </select>
          </label>
          <label>Deadline
            <input type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)} />
          </label>
          <label>Priority
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <button disabled={busy} type="button" onClick={() => void create()}>
            Save Task
          </button>
        </div>
      )}

      <div className="clgf-tasks-panel">
        <h3>{role === 'ADMIN' ? 'Leadership Tasks' : 'My Assigned Tasks'}</h3>
        {tasks.length === 0 && <p>No tasks assigned yet.</p>}
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} busy={busy} update={update} />
        ))}
      </div>

      {message && <p role="status">{message}</p>}
    </section>
  );
}

function TaskCard({
  task, busy, update,
}: {
  task: Task;
  busy: boolean;
  update: (task: Task, status: string, note: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(task.status);
  const [note, setNote] = useState(task.progress_note || '');

  useEffect(() => {
    setStatus(task.status);
    setNote(task.progress_note || '');
  }, [task.status, task.progress_note]);

  return (
    <article className="clgf-task-card">
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p><strong>Leader:</strong> {task.first_name} {task.last_name}</p>
      <p><strong>Deadline:</strong> {String(task.due_date).slice(0, 10)}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      {task.overdue && <strong className="clgf-task-overdue">Overdue</strong>}
      <label>Progress Status
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </label>
      <label>Progress Notes
        <textarea rows={2} value={note}
          onChange={e => setNote(e.target.value)} />
      </label>
      <button disabled={busy} type="button"
        onClick={() => void update(task, status, note)}>
        Update Progress
      </button>
    </article>
  );
}
