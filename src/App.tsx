import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './components/Dashboard';
import ImportWorkout from './components/ImportWorkout';
import ReviewExtraction from './components/ReviewExtraction';
import WorkoutMode from './components/WorkoutMode';
import PreWorkout from './components/PreWorkout';
import History from './components/History';
import HistoryDetails from './components/HistoryDetails';
import Sheets from './components/Sheets';
import Profile from './components/Profile';
import EditSheet from './components/EditSheet';
import InsightsArea from './components/InsightsArea';
import { Home, History as HistoryIcon, Dumbbell, FileText, User, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WorkoutProvider, useWorkouts } from './context/WorkoutContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Layout
const Layout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoading } = useWorkouts();

    const tabs = [
        { name: 'Início', path: '/dashboard', icon: Home },
        { name: 'Histórico', path: '/history', icon: HistoryIcon },
    ];

    const tabsRight = [
        { name: 'Fichas', path: '/sheets', icon: FileText },
        { name: 'Insights', path: '/insights', icon: Sparkles },
        { name: 'Perfil', path: '/profile', icon: User },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-background border-x border-border/50 shadow-2xl items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-6 text-brand font-bold uppercase tracking-widest text-sm">Carregando Treinos</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] max-w-md mx-auto relative bg-background border-x border-border/50 shadow-2xl overflow-hidden">
            <main className="flex-1 overflow-y-auto hide-scrollbar pb-24">
                {children}
            </main>

            {/* Bottom Navigation Navbar */}
            <nav className="absolute bottom-0 w-full bg-card/80 backdrop-blur-xl border-t border-border/50 pb-safe pt-2 px-4 shadow-lg z-50">
                <ul className="flex items-center justify-between mb-2">
                    {tabs.map(tab => (
                        <li key={tab.path} onClick={() => navigate(tab.path)} className={`flex flex-col items-center flex-1 cursor-pointer transition-colors ${location.pathname === tab.path ? 'text-brand' : 'text-zinc-500 hover:text-brand'}`}>
                            <tab.icon className="w-5 h-5" />
                            <span className="text-[10px] mt-1 font-medium">{tab.name}</span>
                        </li>
                    ))}

                    <li className="flex flex-col items-center -mt-8 relative z-10 mx-2 cursor-pointer group" onClick={() => navigate('/pre-workout')}>
                        <button className="w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center shadow-[0_0_20px_rgba(37,95,245,0.4)] group-hover:scale-105 group-active:scale-95 transition-all">
                            <Dumbbell className="w-6 h-6" />
                        </button>
                        <span className="text-[10px] mt-1 font-bold text-brand px-2">TREINAR</span>
                    </li>

                    {tabsRight.map(tab => (
                        <li key={tab.path} onClick={() => navigate(tab.path)} className={`flex flex-col items-center flex-1 cursor-pointer transition-colors ${location.pathname === tab.path ? 'text-brand' : 'text-zinc-500 hover:text-brand'}`}>
                            <tab.icon className="w-5 h-5" />
                            <span className="text-[10px] mt-1 font-medium">{tab.name}</span>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}

function AppContent({ isDarkMode, toggleTheme }: { isDarkMode: boolean, toggleTheme: () => void }) {
    const { user, isLoading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <WorkoutProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/history/:logId" element={<HistoryDetails />} />
                    <Route path="/sheets" element={<Sheets />} />
                    <Route path="/profile" element={<Profile isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/import" element={<ImportWorkout />} />
                    <Route path="/review" element={<ReviewExtraction />} />
                    <Route path="/edit-sheet/:id" element={<EditSheet />} />
                    <Route path="/insights" element={<InsightsArea />} />
                    <Route path="/pre-workout" element={<PreWorkout />} />
                    <Route path="/workout" element={<WorkoutMode />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Layout>
        </WorkoutProvider>
    );
}

function App() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('app-theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('app-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
