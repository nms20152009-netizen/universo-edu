import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import './Header.css';


export function Header() {
    const location = useLocation();
    const isAdmin = authService.isAuthenticated();
    const user = authService.getUser();

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    <span className="logo-icon">🎓</span>
                    <span className="logo-text">UNIVERSO EDU</span>
                </Link>

                <nav className="header-nav">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        🏠 Inicio
                    </Link>
                    <Link
                        to="/tareas"
                        className={`nav-link ${location.pathname === '/tareas' ? 'active' : ''}`}
                    >
                        📋 Tareas
                    </Link>
                    <Link
                        to="/lectura"
                        className={`nav-link ${location.pathname === '/lectura' ? 'active' : ''}`}
                    >
                        📖 Lectura
                    </Link>
                    <Link
                        to="/chat"
                        className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`}
                    >
                        💬 Ayuda
                    </Link>
                </nav>

                <div className="header-actions">
                    {isAdmin ? (
                        <div className="admin-menu">
                            <Link to="/admin" className="btn btn-outline btn-sm">
                                ⚙️ {user?.name || 'Admin'}
                            </Link>
                        </div>
                    ) : (
                        <Link to="/admin/login" className="btn-admin-link">
                            🔐
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
