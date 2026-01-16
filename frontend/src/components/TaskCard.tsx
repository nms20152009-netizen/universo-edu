import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types';
import DOMPurify from 'dompurify';
import { Youtube, Image as ImageIcon, FileUp, Clock, Users, Download, X, ZoomIn, MessageCircle } from 'lucide-react';
import './TaskCard.css';

interface TaskCardProps {
    task: Task;
    onSelect?: (task: Task) => void;
}

const subjectConfig: Record<string, { emoji: string; className: string }> = {
    'Lenguajes': { emoji: '📚', className: 'tag-lenguajes' },
    'Saberes y Pensamiento Científico': { emoji: '🔬', className: 'tag-saberes' },
    'Ética, Naturaleza y Sociedades': { emoji: '🌍', className: 'tag-etica' },
    'De lo Humano y lo Comunitario': { emoji: '🤝', className: 'tag-humano' }
};

export function TaskCard({ task, onSelect }: TaskCardProps) {
    const isNotice = task.type === 'notice';
    const { emoji, className } = isNotice
        ? { emoji: '🔔', className: 'tag-notice' }
        : (subjectConfig[task.subject || ''] || { emoji: '📋', className: 'tag-lenguajes' });

    return (
        <div className={`task-card ${isNotice ? 'notice-card' : ''}`} onClick={() => onSelect?.(task)}>
            <div className="task-card-header">
                <span className={`tag ${className}`}>
                    {emoji} {isNotice ? 'Aviso' : (task.subject || 'General')}
                </span>
                {!isNotice && (
                    <div className="task-meta">
                        <span className="task-duration"><Clock size={14} /> {task.duration || 30} min</span>
                        {task.isCollaborative && <span className="task-collab"><Users size={14} /> Grupal</span>}
                    </div>
                )}
            </div>

            <h3 className="task-card-title">{task.title}</h3>

            <div className="task-card-excerpt" dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize((task.content || task.description || '').substring(0, 150) + ((task.content || '').length > 150 ? '...' : ''))
            }} />

            <div className="task-card-footer">
                <button className="btn btn-primary btn-sm">
                    {isNotice ? 'Leer aviso completo' : 'Ver actividad →'}
                </button>
            </div>
        </div>
    );
};

interface TaskDetailProps {
    task: Task;
    onClose: () => void;
}

// Image Lightbox Component
interface ImageLightboxProps {
    src: string;
    alt: string;
    onClose: () => void;
}

function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
    const handleDownload = async () => {
        try {
            const response = await fetch(src, { mode: 'cors' });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = alt || 'imagen-universo-edu';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch {
            // Fallback: open in new tab if CORS blocks download
            window.open(src, '_blank');
        }
    };

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                <button className="lightbox-close" onClick={onClose}><X size={24} /></button>
                <img src={src} alt={alt} className="lightbox-image" />
                <div className="lightbox-actions">
                    <button className="btn btn-primary" onClick={handleDownload}>
                        <Download size={18} /> Descargar original
                    </button>
                </div>
            </div>
        </div>
    );
}

// Image Preview Component with error handling
interface ImagePreviewProps {
    src: string;
    alt: string;
    onZoom: () => void;
    onDownload: () => void;
}

function ImagePreview({ src, alt, onZoom, onDownload }: ImagePreviewProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    if (hasError) {
        return (
            <div className="media-image-error">
                <ImageIcon size={32} />
                <span>Imagen no disponible</span>
            </div>
        );
    }

    return (
        <div className="media-image-container">
            {isLoading && <div className="media-image-loading">Cargando...</div>}
            <img
                src={src}
                alt={alt}
                className={`media-image ${isLoading ? 'loading' : ''}`}
                onLoad={() => setIsLoading(false)}
                onError={() => { setHasError(true); setIsLoading(false); }}
            />
            <div className="media-image-overlay">
                <button className="btn-icon-light" onClick={onZoom} title="Ver en grande">
                    <ZoomIn size={20} />
                </button>
                <button className="btn-icon-light" onClick={onDownload} title="Descargar">
                    <Download size={20} />
                </button>
            </div>
        </div>
    );
}

export function TaskDetail({ task, onClose }: TaskDetailProps) {
    const navigate = useNavigate();
    const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

    const isNotice = task.type === 'notice';
    const { emoji, className } = isNotice
        ? { emoji: '🔔', className: 'tag-notice' }
        : (subjectConfig[task.subject || ''] || { emoji: '📋', className: 'tag-lenguajes' });

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleImageDownload = async (url: string, title?: string) => {
        try {
            const response = await fetch(url, { mode: 'cors' });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = title || 'imagen-universo-edu';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(url, '_blank');
        }
    };

    return (
        <>
            {lightboxImage && (
                <ImageLightbox
                    src={lightboxImage.src}
                    alt={lightboxImage.alt}
                    onClose={() => setLightboxImage(null)}
                />
            )}

            <div className="task-detail-overlay" onClick={onClose}>
                <div className="task-detail" onClick={e => e.stopPropagation()}>
                    <button className="task-detail-close" onClick={onClose}>✕</button>

                    <div className="task-detail-header">
                        <span className={`tag tag-lg ${className}`}>
                            {emoji} {isNotice ? 'Aviso Importante' : (task.subject || 'Actividad')}
                        </span>
                        <h2 className="task-detail-title">{task.title}</h2>
                    </div>

                    {!isNotice && (
                        <div className="task-detail-meta">
                            <span><Clock size={16} /> {task.duration || 30} minutos</span>
                            {task.isCollaborative && <span><Users size={16} /> Trabajo en equipo</span>}
                        </div>
                    )}

                    <div className="task-detail-section rich-content">
                        <div dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(task.content || task.description || 'Próximamente más detalles sobre esta actividad.')
                        }} />
                    </div>

                    {task.multimedia && task.multimedia.length > 0 && (
                        <div className="task-detail-section multimedia-gallery">
                            <h4>📎 Material de apoyo</h4>
                            <div className="multimedia-grid">
                                {task.multimedia.map((item, idx) => (
                                    <div key={idx} className="media-preview-container">
                                        {item.type === 'youtube' && getYoutubeId(item.url) ? (
                                            <div className="video-wrapper">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${getYoutubeId(item.url)}`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        ) : item.type === 'image' ? (
                                            <ImagePreview
                                                src={item.url}
                                                alt={item.title || 'Imagen'}
                                                onZoom={() => setLightboxImage({ src: item.url, alt: item.title || 'Imagen' })}
                                                onDownload={() => handleImageDownload(item.url, item.title)}
                                            />
                                        ) : (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="media-file-link">
                                                <FileUp size={24} />
                                                <span>{item.title || 'Ver documento adjunto'}</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isNotice && task.instructions && task.instructions.length > 0 && (
                        <div className="task-detail-section">
                            <h4>📋 Pasos a seguir</h4>
                            <ol className="task-instructions">
                                {task.instructions.map((instruction, index) => (
                                    <li key={index}>{instruction.text}</li>
                                ))}
                            </ol>
                        </div>
                    )}

                    <div className="task-detail-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cerrar
                        </button>
                        {!isNotice && (
                            <button
                                className="btn btn-primary btn-help"
                                onClick={() => {
                                    // Navigate to chat with task context for EDU to explain
                                    navigate('/ayuda', {
                                        state: {
                                            taskContext: {
                                                title: task.title,
                                                content: task.content || task.description,
                                                subject: task.subject,
                                                instructions: task.instructions
                                            }
                                        }
                                    });
                                }}
                            >
                                <MessageCircle size={18} />
                                ¿Necesitas ayuda con esto? EDU está listo 💬
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
