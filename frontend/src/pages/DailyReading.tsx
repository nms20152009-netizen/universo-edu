import { useState, useEffect } from 'react';
import { readingService } from '../services/api';
import DOMPurify from 'dompurify';
import { BookOpen, Clock, Calendar, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './DailyReading.css';

interface Reading {
    title: string;
    content: string;
    author: string;
    readingTime: number;
    publishDate: string;
    topic: string;
}

export function DailyReading() {
    const [reading, setReading] = useState<Reading | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGated, setIsGated] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        const checkTimeAndFetch = () => {
            const now = new Date();
            const publishHour = 13;
            const publishMinute = 30;

            const publishTime = new Date();
            publishTime.setHours(publishHour, publishMinute, 0, 0);

            if (now < publishTime) {
                setIsGated(true);
                updateCountdown(publishTime);
                setIsLoading(false);
            } else {
                setIsGated(false);
                fetchReading();
            }
        };

        const updateCountdown = (target: Date) => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${hours}h ${mins}m ${secs}s`);
        };

        checkTimeAndFetch();
        const timer = setInterval(() => {
            if (isGated) {
                const publishTime = new Date();
                publishTime.setHours(13, 30, 0, 0);
                updateCountdown(publishTime);
                if (new Date() >= publishTime) {
                    setIsGated(false);
                    fetchReading();
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isGated]);

    const fetchReading = async () => {
        try {
            const res = await readingService.getTodayReading();
            setReading(res.reading);
        } catch (err: any) {
            console.error('Error fetching reading:', err);
            setError(err.response?.data?.message || 'Aún no hay una lectura programada para hoy.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="reading-loading">Preparando tu lectura... 📖</div>;

    if (isGated) {
        return (
            <div className="reading-gated container">
                <div className="gated-card animate-fade-in">
                    <div className="gated-icon">
                        <Lock size={48} color="#f59e0b" />
                    </div>
                    <h2>¡Paciencia, joven lector! 💡</h2>
                    <p>La lectura del día se libera todos los días a las <strong>1:30 PM</strong>.</p>
                    <div className="countdown-box">
                        <span>Disponible en:</span>
                        <div className="timer">{timeRemaining}</div>
                    </div>
                    <Link to="/" className="btn btn-secondary">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    if (error || !reading) {
        return (
            <div className="reading-error container">
                <div className="error-card animate-fade-in">
                    <h2>📚 La biblioteca está descansando</h2>
                    <p>{error || 'Vuelve más tarde para descubrir una nueva historia.'}</p>
                    <Link to="/" className="btn btn-primary">Ir a mis tareas</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="daily-reading-view">
            <div className="reading-progress-bar"></div>

            <header className="reading-header">
                <div className="container">
                    <Link to="/" className="back-link">
                        <ArrowLeft size={20} /> Volver
                    </Link>
                    <div className="reading-meta">
                        <span className="reading-tag">{reading.topic}</span>
                        <span className="reading-time"><Clock size={16} /> {reading.readingTime} min de lectura</span>
                    </div>
                    <h1 className="reading-title">{reading.title}</h1>
                    <div className="reading-author">
                        Por: <strong>{reading.author}</strong> • <Calendar size={14} /> {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </header>

            <article className="reading-article container">
                <div className="reading-content rich-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(reading.content) }}
                />

                <div className="reading-footer">
                    <div className="completion-card">
                        <h3>¡Felicidades por terminar! 🎊</h3>
                        <p>Has completado tu sesión de lectura de hoy. ¿Qué fue lo que más te sorprendió?</p>
                        <div className="completion-actions">
                            <Link to="/chat" className="btn btn-primary">
                                Discutir esta lectura con EDU 🤖
                            </Link>
                            <Link to="/" className="btn btn-secondary">
                                Volver al tablero
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
