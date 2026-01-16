import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { DailyReading } from './pages/DailyReading';
import './index.css';

function App() {
    return (
        <Router>
            <div className="app">
                <Routes>
                    {/* Admin routes (no header) */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminDashboard />} />

                    {/* Student routes (with header) */}
                    <Route path="/*" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/tareas" element={<Tasks />} />
                                    <Route path="/lectura" element={<DailyReading />} />
                                    <Route path="/chat" element={<Chat />} />
                                </Routes>
                            </main>
                        </>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
