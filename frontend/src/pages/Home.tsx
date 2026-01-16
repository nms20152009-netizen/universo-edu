import { Link } from 'react-router-dom';
import './Home.css';

const subjects = [
    {
        name: 'Lenguajes',
        emoji: '📚',
        description: 'Lectura, escritura y expresión oral',
        color: 'lenguajes'
    },
    {
        name: 'Saberes y Pensamiento Científico',
        emoji: '🔬',
        description: 'Matemáticas y ciencias',
        color: 'saberes'
    },
    {
        name: 'Ética, Naturaleza y Sociedades',
        emoji: '🌍',
        description: 'Historia, geografía y civismo',
        color: 'etica'
    },
    {
        name: 'De lo Humano y lo Comunitario',
        emoji: '🤝',
        description: 'Arte, convivencia y salud',
        color: 'humano'
    }
];

export function Home() {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero animate-fade-in">
                <div className="hero-decoration">
                    <div className="blob blob-1 animate-pulse-soft"></div>
                    <div className="blob blob-2 animate-float"></div>
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">
                        ¡Aprender es una <span className="gradient-text">Aventura</span>! 🚀
                    </h1>
                    <p className="hero-subtitle">
                        Explora, descubre y crece con <strong>UNIVERSO EDU</strong>.
                        Tu compañero inteligente para 6° grado.
                    </p>

                    <div className="hero-actions">
                        <Link to="/tareas" className="btn btn-primary btn-lg hover-scale">
                            📋 Mis Tareas
                        </Link>
                        <Link to="/lectura" className="btn btn-secondary btn-lg hover-scale">
                            📖 Lectura del Día
                        </Link>
                        <Link to="/chat" className="btn btn-outline btn-lg hover-scale">
                            💬 Hablar con EDU
                        </Link>
                    </div>
                </div>

                <div className="hero-mascot animate-float">
                    <div className="mascot-bubble">
                        <p>¡Hola! Soy <strong>EDU</strong> 🤖</p>
                        <p>¿Qué descubriremos hoy?</p>
                    </div>
                    <div className="mascot-avatar">🎓</div>
                </div>
            </section>

            {/* Subjects Section */}
            <section className="subjects-section">
                <h2 className="section-title">
                    <span className="emoji">📖</span>
                    Campos Formativos
                </h2>
                <p className="section-subtitle">
                    Explora las diferentes áreas del conocimiento de la Nueva Escuela Mexicana
                </p>

                <div className="subjects-grid">
                    {subjects.map((subject) => (
                        <div key={subject.name} className={`subject-card subject-${subject.color}`}>
                            <span className="subject-emoji">{subject.emoji}</span>
                            <h3 className="subject-name">{subject.name}</h3>
                            <p className="subject-desc">{subject.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">
                    <span className="emoji">✨</span>
                    Tu espacio de aprendizaje
                </h2>

                <div className="features-grid">
                    <div className="feature-card animate-fade-in">
                        <div className="feature-icon">📋</div>
                        <h3>Tareas Inteligentes</h3>
                        <p>Actividades diseñadas para ti, basadas en la Nueva Escuela Mexicana.</p>
                    </div>

                    <div className="feature-card animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <div className="feature-icon">🤖</div>
                        <h3>Asistente EDU</h3>
                        <p>¿Tienes dudas? EDU te guía paso a paso sin darte la respuesta de inmediato.</p>
                    </div>

                    <div className="feature-card animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <div className="feature-icon">🌈</div>
                        <h3>Creatividad</h3>
                        <p>Expresa tus ideas y comparte tus logros con toda la comunidad escolar.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-card">
                    <h2>¿Tienes una pregunta?</h2>
                    <p>EDU está listo para ayudarte. No importa si es de matemáticas, español o cualquier materia.</p>
                    <Link to="/chat" className="btn btn-primary btn-lg">
                        💬 Pregúntale a EDU
                    </Link>
                </div>
            </section>

            {/* Footer / Credits */}
            <footer className="home-footer animate-fade-in">
                <div className="footer-content">
                    <div className="footer-credits">
                        <p>Desarrollado para la educación pública en México</p>
                        <p className="owner-credit">Proyecto bajo la dirección del <strong>Profr. Noé Mérida</strong></p>
                    </div>
                    <div className="footer-copyright">
                        &copy; {new Date().getFullYear()} UNIVERSO EDU - Todos los derechos reservados
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
