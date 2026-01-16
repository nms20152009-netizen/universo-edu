import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './AdminLogin.css';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await authService.login(email, password);
            if (response.success) {
                navigate('/admin');
            } else {
                setError(response.error || 'Error al iniciar sesión');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-icon">🔐</span>
                    <h1>Acceso Administrativo</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@escuela.edu.mx"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ Iniciando sesión...' : '🚀 Iniciar Sesión'}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="/" className="back-link">← Volver al inicio</a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
