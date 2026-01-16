import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import DatePicker from 'react-datepicker';
import {
    LayoutDashboard,
    FilePlus2,
    FileText,
    Calendar,
    LogOut,
    Youtube,
    Image as ImageIcon,
    FileUp,
    Trash2,
    Edit,
    CheckCircle,
    Clock,
    Send,
    Plus,
    X,
    Upload
} from 'lucide-react';
import { authService, adminService } from '../services/api';
import { Task } from '../types';
import 'react-quill/dist/quill.snow.css';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminDashboard.css';

type Tab = 'stats' | 'creator' | 'content' | 'schedules';

export function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('stats');
    const [stats, setStats] = useState<any>(null);
    const [content, setContent] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

    // Form State
    const [type, setType] = useState<'task' | 'notice'>('task');
    const [title, setTitle] = useState('');
    const [richContent, setRichContent] = useState('');
    const [subject, setSubject] = useState('Lenguajes');
    const [publishDate, setPublishDate] = useState<Date>(new Date());
    const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>('published');
    const [weekNumber, setWeekNumber] = useState(1);
    const [multimedia, setMultimedia] = useState<{ type: 'youtube' | 'image' | 'file', url: string, title?: string }[]>([]);
    const [tempMediaUrl, setTempMediaUrl] = useState('');
    const [tempMediaType, setTempMediaType] = useState<'youtube' | 'image' | 'file'>('youtube');
    const [isDragging, setIsDragging] = useState(false);

    // Handle file upload - convert to base64 data URL
    const handleFileUpload = async (files: File[]) => {
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                alert('Solo se permiten imágenes');
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es muy grande (máximo 5MB)');
                continue;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setMultimedia(prev => [...prev, {
                    type: 'image',
                    url: dataUrl,
                    title: file.name
                }]);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const user = authService.getUser();
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
            return;
        }
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        if (activeTab !== 'stats' && activeTab !== 'content') return;

        setIsLoading(true);
        try {
            if (activeTab === 'stats') {
                const res = await adminService.getStats();
                setStats(res.stats);
            } else if (activeTab === 'content') {
                const res = await adminService.getContent();
                setContent(res.items);
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMedia = () => {
        if (!tempMediaUrl) return;
        setMultimedia([...multimedia, { type: tempMediaType, url: tempMediaUrl }]);
        setTempMediaUrl('');
    };

    const handleRemoveMedia = (index: number) => {
        setMultimedia(multimedia.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const taskData = {
                type,
                title,
                content: richContent,
                subject: type === 'task' ? subject : undefined,
                multimedia,
                publishDate,
                status: status === 'published' && publishDate > new Date() ? 'scheduled' : status,
                weekNumber: type === 'task' ? weekNumber : undefined
            };

            if (editingTaskId) {
                await adminService.updateTask(editingTaskId, taskData);
                alert('¡Contenido actualizado exitosamente!');
            } else {
                await adminService.createManualTask(taskData);
                alert('¡Contenido creado exitosamente!');
            }

            resetForm();
            setActiveTab('content');
        } catch (err) {
            console.error('Error saving content:', err);
            alert('Error al guardar el contenido');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (item: Task) => {
        try {
            console.log('✏️ Target item for edit:', item);
            if (!item || !item._id) {
                alert('Error: Datos del item incompletos');
                return;
            }

            setEditingTaskId(item._id);
            setType(item.type || 'task');
            setTitle(item.title || '');
            setRichContent(item.content || item.description || '');
            setSubject(item.subject || 'Lenguajes');
            setPublishDate(item.publishDate ? new Date(item.publishDate) : new Date());
            setStatus(item.status || 'published');
            setWeekNumber(item.weekNumber || 1);
            setMultimedia(item.multimedia || []);

            setActiveTab('creator');
            console.log('🚀 Tab switched to creator for ID:', item._id);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('❌ Error in handleEdit:', error);
            alert('Error al intentar editar: ' + (error as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este contenido?')) return;
        try {
            await adminService.deleteTask(id);
            loadData();
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    const resetForm = () => {
        setEditingTaskId(null);
        setTitle('');
        setRichContent('');
        setMultimedia([]);
        setPublishDate(new Date());
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    if (isLoading && activeTab === 'stats') return <div className="admin-loading">Cargando...</div>;

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <span className="admin-logo">🏫</span>
                    <h2>UNIVERSO EDU</h2>
                    <span className="admin-badge">ADMIN</span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        <LayoutDashboard size={20} />
                        <span className="sidebar-text">Escritorio</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'creator' ? 'active' : ''}`}
                        onClick={() => setActiveTab('creator')}
                    >
                        <FilePlus2 size={20} />
                        <span className="sidebar-text">Nuevo Contenido</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
                        onClick={() => setActiveTab('content')}
                    >
                        <FileText size={20} />
                        <span className="sidebar-text">Gestión de Contenido</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'schedules' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schedules')}
                    >
                        <Calendar size={20} />
                        <span className="sidebar-text">Programaciones AI</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>{
                        activeTab === 'stats' ? 'Panel de Control' :
                            activeTab === 'creator' ? (editingTaskId ? 'Editar Contenido' : 'Centro de Creación') :
                                activeTab === 'content' ? 'Gestión de Contenido' : 'Programaciones de IA'
                    }</h1>
                    <div className="admin-user-info">
                        <span>Hola, Admin 👋</span>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'stats' && stats && (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon"><FileText color="#3b82f6" /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.totalTasks}</span>
                                    <span className="stat-label">Total Publicaciones</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><CheckCircle color="#10b981" /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.publishedTasks}</span>
                                    <span className="stat-label">Publicado</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><Clock color="#f59e0b" /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.pendingTasks}</span>
                                    <span className="stat-label">Programado</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'creator' && (
                        <div className="creator-card">
                            <form onSubmit={handleSubmit}>
                                <div className="type-selector">
                                    <button
                                        type="button"
                                        className={`type-btn ${type === 'task' ? 'active' : ''}`}
                                        onClick={() => setType('task')}
                                    >
                                        <FileText size={20} /> Tarea
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn ${type === 'notice' ? 'active' : ''}`}
                                        onClick={() => setType('notice')}
                                    >
                                        <Send size={20} /> Aviso
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label>Título de la {type === 'task' ? 'Tarea' : 'Publicación'}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        placeholder="Ej: La Revolución Mexicana / Aviso: Suspensión de clases"
                                    />
                                </div>

                                {type === 'task' && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Materia</label>
                                            <select
                                                className="form-control"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                            >
                                                <option>Lenguajes</option>
                                                <option>Saberes y Pensamiento Científico</option>
                                                <option>Ética, Naturaleza y Sociedades</option>
                                                <option>De lo Humano y lo Comunitario</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Semana</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={weekNumber}
                                                onChange={(e) => setWeekNumber(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Contenido Enriquecido</label>
                                    <div className="quill-wrapper">
                                        <ReactQuill
                                            theme="snow"
                                            value={richContent}
                                            onChange={setRichContent}
                                            modules={quillModules}
                                        />
                                    </div>
                                </div>

                                <div className="multimedia-section">
                                    <label><Plus size={16} /> Agregar Multimedia</label>

                                    {/* Drag & Drop Zone for Images */}
                                    <div
                                        className={`dropzone ${isDragging ? 'dragging' : ''}`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            const files = Array.from(e.dataTransfer.files);
                                            handleFileUpload(files);
                                        }}
                                        onClick={() => document.getElementById('file-upload-input')?.click()}
                                    >
                                        <Upload size={32} />
                                        <span>Arrastra imágenes aquí o haz clic para seleccionar</span>
                                        <span className="dropzone-hint">PNG, JPG, GIF hasta 5MB</span>
                                        <input
                                            id="file-upload-input"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    handleFileUpload(Array.from(e.target.files));
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* URL-based media input */}
                                    <div className="url-media-section">
                                        <span className="section-divider">o agrega por URL</span>
                                        <div className="form-row">
                                            <select
                                                className="form-control"
                                                value={tempMediaType}
                                                onChange={(e) => setTempMediaType(e.target.value as any)}
                                            >
                                                <option value="youtube">Video de YouTube</option>
                                                <option value="image">Imagen (URL)</option>
                                                <option value="file">Archivo / PDF (URL)</option>
                                            </select>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Pega la URL aquí..."
                                                    value={tempMediaUrl}
                                                    onChange={(e) => setTempMediaUrl(e.target.value)}
                                                />
                                                <button type="button" className="btn btn-secondary" onClick={handleAddMedia}>
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Media Preview Grid */}
                                    <div className="media-preview-grid">
                                        {multimedia.map((item, idx) => (
                                            <div key={idx} className="media-preview-item">
                                                {item.type === 'image' ? (
                                                    <img src={item.url} alt={item.title || 'Preview'} className="media-thumb" />
                                                ) : item.type === 'youtube' ? (
                                                    <div className="media-thumb youtube-thumb">
                                                        <Youtube size={24} />
                                                        <span>YouTube</span>
                                                    </div>
                                                ) : (
                                                    <div className="media-thumb file-thumb">
                                                        <FileUp size={24} />
                                                        <span>Archivo</span>
                                                    </div>
                                                )}
                                                <button type="button" onClick={() => handleRemoveMedia(idx)} className="remove-media-btn">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Programar Publicación</label>
                                        <DatePicker
                                            selected={publishDate}
                                            onChange={(date: Date | null) => date && setPublishDate(date)}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            className="datepicker-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado Inicial</label>
                                        <select
                                            className="form-control"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as any)}
                                        >
                                            <option value="published">Publicar ahora</option>
                                            <option value="scheduled">Programado</option>
                                            <option value="draft">Borrador</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ width: '100%', marginTop: '1rem' }}>
                                    {isSaving ? 'Guardando...' : (editingTaskId ? 'Actualizar Contenido' : 'Crear y Publicar Contenido')}
                                </button>
                                {editingTaskId && (
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={resetForm}
                                        style={{ width: '100%', marginTop: '0.5rem' }}
                                    >
                                        Cancelar Edición
                                    </button>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="content-table-card">
                            <table className="content-table">
                                <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Título</th>
                                        <th>Materia / Info</th>
                                        <th>Publicación</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {content.map((item) => (
                                        <tr key={item._id}>
                                            <td>
                                                <span className={`badge ${item.type === 'task' ? 'badge-info' : 'badge-warning'}`}>
                                                    {item.type === 'task' ? 'Tarea' : 'Aviso'}
                                                </span>
                                            </td>
                                            <td><strong>{item.title}</strong></td>
                                            <td>{item.subject || '-'}</td>
                                            <td>{new Date(item.publishDate).toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge status-${item.status}`}>
                                                    {item.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns" style={{ pointerEvents: 'auto' }}>
                                                    <button
                                                        className="btn-icon"
                                                        title="Editar"
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('Button Clicked Handled');
                                                            handleEdit(item);
                                                        }}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDelete(item._id)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'schedules' && (
                        <div className="tools-grid">
                            <div className="tool-card glass">
                                <div className="tool-header">
                                    <div className="tool-icon">🤖</div>
                                    <h3>Generación Asistida</h3>
                                </div>
                                <p>Configura las reglas para que la IA genere tareas automáticamente basándose en el calendario escolar.</p>
                                <button className="btn btn-secondary">Gestionar Programaciones AI</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
