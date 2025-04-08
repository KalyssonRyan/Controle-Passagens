import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PublicPage from './pages/PublicPage';
import AdminPage from './pages/AdminPage';
import AddTicketPage from './pages/AddTicketPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './PrivateRoute';
import { isAuthenticated, logout, isAdmin } from './auth';
import TicketManagerPage from './pages/TicketManagerPage';
import RegisterPage from './pages/RegisterPage';
import MinhaContaPage from './pages/MinhaContaPage';
function App() {
    return (
        <Router>
            <div className="container mt-4">
                <nav className="mb-4 d-flex justify-content-between">
                    <div>
                        <Link className="btn btn-outline-primary me-2" to="/">Página Pública</Link>

                        {isAuthenticated() && isAdmin() && (
                            <>
                                <Link className="btn btn-outline-success me-2" to="/admin">Admin</Link>
                                <Link className="btn btn-outline-warning me-2" to="/add-ticket">Passagens</Link>
                                <Link className="btn btn-outline-info me-2" to="/gerenciar-tickets">Gerenciar Tickets</Link>
                                <Link className="btn btn-outline-info me-2" to="/minha-conta">Minha Conta</Link>

                            </>
                        )}
                        {isAuthenticated() && !isAdmin() && (
                            <>
                                <Link className="btn btn-outline-info me-2" to="/minha-conta">Minha Conta</Link>

                            </>
                        )}
                    </div>
                    {isAuthenticated() ? (
                        <button className="btn btn-outline-danger" onClick={() => {
                            logout();
                            window.location.href = '/login';
                        }}>Sair</button>
                    ) : (
                        <>
                            <Link className="btn btn-outline-dark" to="/login">Login</Link>
                            <Link className="btn btn-outline-info me-2" to="/register">Registrar</Link>
                        </>
                    )}

                </nav>

                <Routes>
                    <Route path="/" element={<PublicPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/minha-conta" element={
                        <PrivateRoute><MinhaContaPage /></PrivateRoute>
                    } />

                    <Route path="/admin" element={
                        <AdminRoute><AdminPage /></AdminRoute>
                    } />
                    <Route path="/add-ticket" element={
                        <AdminRoute><AddTicketPage /></AdminRoute>
                    } />
                    <Route path="/gerenciar-tickets" element={
                        <AdminRoute><TicketManagerPage /></AdminRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}
export default App;
