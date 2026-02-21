import { ArrowLeft, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';
import { useState } from 'react';

export default function WorkoutMode() {
    const navigate = useNavigate();
    const { activeSheet, setActiveSheet } = useWorkouts();
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!activeSheet || activeSheet.exercises.length === 0) {
        return (
            <div className="flex flex-col min-h-screen p-4 items-center justify-center text-center">
                <p className="text-muted-foreground mb-4">Nenhum treino ativo.</p>
                <button onClick={() => navigate('/sheets')} className="bg-brand text-white px-6 py-3 rounded-xl font-bold">Voltar</button>
            </div>
        );
    }

    const currentExercise = activeSheet.exercises[currentIndex];

    // Simulating sets progression for the UI
    const totalSets = parseInt(String(currentExercise.sets)) || 3;
    const [currentSet, setCurrentSet] = useState(1);

    const handleNextSet = () => {
        if (currentSet < totalSets) {
            setCurrentSet(prev => prev + 1);
        } else {
            if (currentIndex < activeSheet.exercises.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setCurrentSet(1);
            } else {
                // Finish workout
                setActiveSheet(''); // Deactivate
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen p-4 pb-24">
            {/* Top Bar */}
            <header className="flex items-center justify-between mb-8 pt-2">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-foreground hover:bg-border/50 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-[10px] font-bold tracking-[0.2em] text-brand uppercase mb-1">{activeSheet.title}</h2>
                    <h1 className="text-sm font-black uppercase text-foreground">Treino em Curso</h1>
                </div>
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-foreground hover:bg-border/50 transition-colors">
                    <X size={20} />
                </button>
            </header>

            {/* Progress counter */}
            <section className="mb-6 px-1 flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Progresso</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-foreground">{String(currentIndex + 1).padStart(2, '0')}</span>
                        <span className="text-lg font-bold text-muted-foreground">/ {String(activeSheet.exercises.length).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Dots indicator */}
                <div className="flex gap-1.5 mb-2 overflow-x-auto hide-scrollbar max-w-[200px]">
                    {activeSheet.exercises.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full shrink-0 ${idx < currentIndex ? 'bg-brand' : idx === currentIndex ? 'bg-brand ring-2 ring-brand/30 h-2 w-2' : 'bg-border'}`}></div>
                    ))}
                </div>
            </section>

            {/* Main Exercise Card */}
            <section className="mb-6">
                <div className="bg-card rounded-[2rem] p-6 border border-border/50 relative overflow-hidden shadow-2xl">
                    {/* subtle glow/gradient background instead of image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    {/* Accent corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand rounded-tl-[2rem] opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand rounded-br-[2rem] opacity-50"></div>

                    <div className="relative z-10">
                        <div className="inline-block border border-brand/30 bg-brand/5 text-[10px] font-bold tracking-widest text-brand uppercase px-3 py-1 rounded-full mb-4">
                            Exercício {currentIndex + 1}
                        </div>

                        <h2 className="text-3xl font-black leading-none mb-1 text-foreground break-words">{currentExercise.name}</h2>

                        {currentExercise.notes && (
                            <div className="mt-4 mb-8 bg-brand/5 rounded-xl p-3 border border-brand/10">
                                <p className="text-xs text-brand/90 italic">
                                    {currentExercise.notes}
                                </p>
                            </div>
                        )}

                        <div className={`grid grid-cols-2 gap-4 ${!currentExercise.notes && 'mt-12'}`}>
                            <div className="bg-background/80 backdrop-blur-md rounded-2xl p-4 border border-border/50">
                                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Carga</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-brand">{currentExercise.weight || '-'}</span>
                                    {currentExercise.weight && <span className="text-sm font-bold text-muted-foreground">kg</span>}
                                </div>
                            </div>
                            <div className="bg-background/80 backdrop-blur-md rounded-2xl p-4 border border-border/50">
                                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Meta</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-foreground">{currentExercise.reps}</span>
                                    <span className="text-sm font-bold text-muted-foreground">reps</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Action Area */}
            <section className="grid grid-cols-3 gap-4">
                <div className="col-span-1 bg-card rounded-2xl p-4 border border-border/50 flex flex-col justify-center items-center">
                    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Série Atual</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-foreground">{currentSet}</span>
                        <span className="text-sm font-bold text-muted-foreground">/ {totalSets}</span>
                    </div>
                </div>

                <button onClick={handleNextSet} className="col-span-2 bg-brand text-white rounded-2xl p-4 flex flex-col justify-center items-center hover:bg-brand-light active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(37,95,245,0.4)]">
                    <Check size={24} className="mb-1" strokeWidth={3} />
                    <span className="text-[11px] font-black tracking-widest uppercase">
                        {currentSet === totalSets && currentIndex === activeSheet.exercises.length - 1 ? 'Finalizar Treino' : 'Série Concluída'}
                    </span>
                </button>
            </section>
        </div>
    );
}
