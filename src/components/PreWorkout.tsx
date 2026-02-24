import { ArrowLeft, Play, Dumbbell, Sparkles, LoaderCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';
import { useState } from 'react';
import { generateExerciseSubstitution, ExerciseSubstitution } from '../lib/aiInsightsService';

export default function PreWorkout() {
    const navigate = useNavigate();
    const { activeSheet } = useWorkouts();

    const [substitutions, setSubstitutions] = useState<Record<string, ExerciseSubstitution>>({});
    const [loadingSubstitution, setLoadingSubstitution] = useState<Record<string, boolean>>({});

    const handleSubstitute = async (exerciseId: string, exerciseName: string) => {
        if (!activeSheet || loadingSubstitution[exerciseId] || substitutions[exerciseId]) return;

        setLoadingSubstitution(prev => ({ ...prev, [exerciseId]: true }));
        try {
            const result = await generateExerciseSubstitution(exerciseName, activeSheet.title);
            if (result) {
                setSubstitutions(prev => ({ ...prev, [exerciseId]: result }));
            }
        } catch (error) {
            console.error("Failed to generate substitution", error);
        } finally {
            setLoadingSubstitution(prev => ({ ...prev, [exerciseId]: false }));
        }
    };

    if (!activeSheet) {
        return (
            <div className="flex flex-col min-h-screen p-4 items-center justify-center text-center">
                <Dumbbell className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2 text-foreground">Aviso</h2>
                <p className="text-muted-foreground mb-6">Você não tem nenhuma ficha ativa no momento.</p>
                <button
                    onClick={() => navigate('/sheets')}
                    className="bg-brand text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-light transition-colors"
                >
                    Escolher Ficha
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] p-4 pb-28">
            {/* Header */}
            <header className="flex items-center gap-4 mb-6 pt-2">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-foreground hover:bg-border/50 transition-colors shrink-0"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-[10px] font-bold tracking-[0.2em] text-brand uppercase mb-1">Visão Geral</h2>
                    <h1 className="text-sm font-black uppercase text-foreground truncate max-w-[200px]">{activeSheet.title}</h1>
                </div>
            </header>

            {/* Title & Info */}
            <section className="mb-6">
                <div className="bg-gradient-to-br from-brand to-brand-light rounded-3xl p-6 text-white shadow-xl shadow-brand/20 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 mb-4">
                        <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm mb-2">Treino de Hoje</span>
                        <h2 className="text-2xl font-black">{activeSheet.title}</h2>
                    </div>

                    <div className="relative z-10 flex gap-4 text-sm text-white/90">
                        <div>
                            <p className="font-bold">{activeSheet.exercises.length}</p>
                            <p className="text-xs text-white/70">Exercícios</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Exercise List */}
            <section className="flex-1">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-zinc-500 uppercase tracking-wider">Lista de Exercícios</h3>
                </div>

                <div className="space-y-4 pb-32">
                    {activeSheet.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex items-start justify-between sm:justify-start gap-3 w-full sm:w-auto">
                                <div className="flex items-start gap-3 flex-1 sm:flex-none">
                                    <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0 text-sm mt-0.5">
                                        {index + 1}
                                    </div>
                                    <h4 className="font-bold text-foreground text-base sm:hidden leading-snug">{exercise.name}</h4>
                                </div>
                                <button
                                    onClick={() => handleSubstitute(exercise.id, exercise.name)}
                                    disabled={loadingSubstitution[exercise.id]}
                                    className={`sm:hidden ml-2 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${substitutions[exercise.id] ? 'bg-brand/20 text-brand' : 'bg-muted text-muted-foreground hover:bg-brand/10 hover:text-brand'}`}
                                    title="Sugestão de Substituição (IA)"
                                >
                                    {loadingSubstitution[exercise.id] ? <LoaderCircle size={14} className="animate-spin text-brand" /> : <Sparkles size={14} />}
                                </button>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="hidden sm:flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-foreground text-base leading-snug">{exercise.name}</h4>
                                    <button
                                        onClick={() => handleSubstitute(exercise.id, exercise.name)}
                                        disabled={loadingSubstitution[exercise.id]}
                                        className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${substitutions[exercise.id] ? 'bg-brand/20 text-brand' : 'bg-muted text-muted-foreground hover:bg-brand/10 hover:text-brand'}`}
                                        title="Sugestão de Substituição (IA)"
                                    >
                                        {loadingSubstitution[exercise.id] ? <LoaderCircle size={14} className="animate-spin text-brand" /> : <Sparkles size={14} />}
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-1 text-sm text-muted-foreground font-medium">
                                    <span>{exercise.sets} Séries</span>
                                    <span className="hidden sm:inline text-border">•</span>
                                    <span>{exercise.reps} Reps</span>
                                    {exercise.weight && (
                                        <>
                                            <span className="hidden sm:inline text-border">•</span>
                                            <span className="text-brand bg-brand/10 px-2 py-0.5 rounded-md text-xs font-bold">{exercise.weight}</span>
                                        </>
                                    )}
                                </div>
                                {exercise.notes && (
                                    <div className="mt-3 text-[15px] text-foreground/90 leading-relaxed bg-muted/80 p-4 rounded-xl border border-border/50 shadow-sm">
                                        <span className="font-bold text-brand block mb-1">Técnica:</span>
                                        {exercise.notes.replace(/^Técnica:\s*/i, '')}
                                    </div>
                                )}

                                {substitutions[exercise.id] && (
                                    <div className="mt-4 bg-gradient-to-br from-brand/[0.08] to-transparent border border-brand/20 rounded-xl p-4 animate-fadeIn">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles size={16} className="text-brand" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-brand">Válvula de Escape (IA)</span>
                                        </div>

                                        <div className="mb-3">
                                            <h5 className="font-bold text-[15px] text-foreground mb-1">{substitutions[exercise.id].suggestion}</h5>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {substitutions[exercise.id].reason}
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-2 bg-brand/5 p-3 rounded-lg border border-brand/10">
                                            <Info size={16} className="text-brand shrink-0 mt-0.5" />
                                            <p className="text-[13px] text-foreground/90 leading-relaxed font-medium">
                                                {substitutions[exercise.id].execution}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 w-full px-6 py-4 bg-gradient-to-t from-background via-background/90 to-transparent z-40 pb-safe-bottom">
                <button
                    onClick={() => navigate('/workout')}
                    className="w-full bg-brand text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-light active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(37,95,245,0.4)] uppercase tracking-wider mb-20"
                >
                    <Play size={20} className="fill-white" />
                    <span>Começar Treino</span>
                </button>
            </div>
        </div>
    );
}
