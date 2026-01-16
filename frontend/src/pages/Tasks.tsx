import { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import { TaskCard, TaskDetail } from '../components/TaskCard';
import { Task } from '../types';
import './Tasks.css';

export function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const response = await taskService.getTasks();
            setTasks(response.tasks || []);
        } catch (err) {
            console.error('Failed to load tasks:', err);
            setError('No pudimos cargar las tareas. Intenta de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTasks = filter === 'all'
        ? tasks
        : tasks.filter(task => task.type === 'notice' || task.subject === filter);

    const subjects = [
        { value: 'all', label: 'Todas', emoji: '📋' },
        { value: 'Lenguajes', label: 'Lenguajes', emoji: '📚' },
        { value: 'Saberes y Pensamiento Científico', label: 'Saberes', emoji: '🔬' },
        { value: 'Ética, Naturaleza y Sociedades', label: 'Ética', emoji: '🌍' },
        { value: 'De lo Humano y lo Comunitario', label: 'Humano', emoji: '🤝' }
    ];

    return (
        <div className="tasks-page">
            <div className="tasks-header">
                <h1>📋 Tareas de la Semana</h1>
                <p>Descubre las actividades que tenemos preparadas para ti</p>
            </div>

            <div className="tasks-filters">
                {subjects.map((subject) => (
                    <button
                        key={subject.value}
                        className={`filter-btn ${filter === subject.value ? 'active' : ''}`}
                        onClick={() => setFilter(subject.value)}
                    >
                        {subject.emoji} {subject.label}
                    </button>
                ))}
            </div>

            <div className="tasks-content">
                {isLoading ? (
                    <div className="tasks-loading">
                        <div className="spinner"></div>
                        <p>Cargando tareas...</p>
                    </div>
                ) : error ? (
                    <div className="tasks-error">
                        <span className="emoji-lg">😔</span>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={loadTasks}>
                            Intentar de nuevo
                        </button>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="tasks-empty">
                        <span className="emoji-lg">📭</span>
                        <h3>No hay tareas disponibles</h3>
                        <p>
                            {filter === 'all'
                                ? 'Las nuevas tareas se publican de lunes a viernes a la 1:00 PM.'
                                : 'No hay tareas de esta materia por ahora.'}
                        </p>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onSelect={setSelectedTask}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedTask && (
                <TaskDetail
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
};

export default Tasks;
