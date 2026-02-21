import { Calendar, BarChart3, Play, Activity, Lock, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';

export default function Dashboard() {
    const navigate = useNavigate();
    const { sheets, activeSheet } = useWorkouts();

    // Mock progress calculation (To be implemented properly later)
    const progress = 0;
    const circumference = 2 * Math.PI * 40; // r=40
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    return (
        <div className="flex flex-col min-h-screen p-4 pb-24">
            {/* Top Bar */}
            <header className="flex items-center justify-between mb-8 pt-2">
                <button className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <User size={20} />
                </button>
                <h1 className="text-sm font-bold tracking-widest text-brand uppercase">Gabriel Brandão</h1>
                <button className="text-foreground/70 hover:text-foreground transition-colors">
                    <Settings size={24} />
                </button>
            </header>

            {/* Greeting */}
            <section className="mb-6">
                <h2 className="text-3xl font-black leading-tight">
                    BEM-VINDO, <br />
                    <span className="text-brand">ATLETA</span>
                </h2>
            </section>

            {/* Today's Workout / Active Sheet */}
            <section className="mb-6 relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl -z-10"></div>

                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold font-sans">Treino de Hoje</h2>
                    <button className="text-brand text-sm font-bold tracking-wider uppercase hover:text-brand-light transition-colors">
                        Ver Todos
                    </button>
                </div>

                {activeSheet ? (
                    <div className="bg-card w-full rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        {/* Status Label */}
                        <div className="absolute top-4 left-4 bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm z-10">
                            Em Andamento
                        </div>

                        {/* Progress Circle SVG */}
                        <div className="relative w-32 h-32 mb-6 mt-4">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted" />
                                <circle cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-brand drop-shadow-[0_0_10px_rgba(37,95,245,0.5)] transition-all duration-1000 ease-out" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-foreground drop-shadow-sm">{progress}%</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-foreground mb-1 group-hover:text-brand transition-colors">{activeSheet.title}</h3>
                        <p className="text-muted-foreground text-sm font-medium mb-8">
                            {activeSheet.exercises.length} exercícios restantes
                        </p>

                        <button
                            onClick={() => navigate('/pre-workout')}
                            className="bg-brand text-white w-full rounded-2xl py-4 font-bold text-sm tracking-widest uppercase shadow-[0_10px_30px_rgba(37,95,245,0.4)] hover:bg-brand-light active:scale-[0.98] transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_10px_40px_rgba(37,95,245,0.6)]"
                        >
                            <Play size={18} fill="currentColor" />
                            Continuar Treino
                        </button>
                    </div>
                ) : (
                    <div className="bg-card w-full rounded-3xl p-8 shadow-sm border border-border flex flex-col items-center justify-center text-center relative overflow-hidden h-64">
                        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4 text-brand">
                            <Activity size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Nenhum Treino Ativo</h3>
                        <p className="text-zinc-500 text-sm mb-6">Comece importando ou criando sua rotina de exercícios.</p>
                        <button
                            onClick={() => navigate('/sheets')}
                            className="bg-brand text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-brand/20"
                        >
                            Ir para Fichas
                        </button>
                    </div>
                )}
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-card rounded-2xl p-4 border border-border/50">
                    <Calendar size={20} className="text-brand mb-3" />
                    <h4 className="text-3xl font-black text-foreground mb-1">0</h4>
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase opacity-70">Dias Seguidos</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border/50">
                    <BarChart3 size={20} className="text-brand mb-3" />
                    <h4 className="text-3xl font-black text-foreground mb-1">0<span className="text-xl">kg</span></h4>
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase opacity-70">Volume Semanal</p>
                </div>
            </section>

            {/* Upcoming Workouts */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold tracking-wider uppercase">Fichas Salvas</h3>
                    <button onClick={() => navigate('/sheets')} className="text-[10px] font-bold tracking-wider text-brand uppercase">Ver Todas</button>
                </div>

                <div className="space-y-3">
                    {sheets.filter(s => !s.isActive).length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-4 bg-card rounded-2xl border border-border/50">Nenhuma outra ficha salva no momento.</p>
                    ) : (
                        sheets.filter(s => !s.isActive).slice(0, 3).map((sheet) => (
                            <div key={sheet.id} className="bg-card/40 rounded-2xl p-4 relative overflow-hidden border border-border/20 opacity-70">
                                <div className="flex items-center gap-4 pl-2">
                                    <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center font-black text-xl text-foreground/30 uppercase">
                                        {sheet.title.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-foreground/60">{sheet.title}</h4>
                                        <p className="text-xs text-foreground/40 mt-1">{sheet.exercises.length} Exercícios</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/30">
                                        <Lock size={14} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
