import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Plus, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkouts, Exercise, WorkoutSheet } from '../context/WorkoutContext';

export default function EditSheet() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { sheets, updateSheet } = useWorkouts();

    const [workout, setWorkout] = useState<WorkoutSheet | null>(null);

    useEffect(() => {
        if (id) {
            const sheetToEdit = sheets.find(s => s.id === id);
            if (sheetToEdit) {
                // Fazer uma cópia profunda para evitar mutações diretas
                setWorkout(JSON.parse(JSON.stringify(sheetToEdit)));
            }
        }
    }, [id, sheets]);

    if (!workout) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground p-6 items-center justify-center">
                <p className="text-zinc-500 mb-4 text-center">Ficha não encontrada ou carregando...</p>
                <button onClick={() => navigate('/sheets')} className="bg-brand text-white px-6 py-3 rounded-full font-bold">Voltar</button>
            </div>
        )
    }

    const handleUpdateTitle = (newTitle: string) => {
        setWorkout(prev => prev ? { ...prev, title: newTitle } : prev);
    };

    const handleUpdateExercise = (exerciseId: string, field: keyof Exercise, value: string) => {
        setWorkout(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                exercises: prev.exercises.map(ex =>
                    ex.id === exerciseId ? { ...ex, [field]: value } : ex
                )
            };
        });
    };

    const handleDelete = (exerciseId: string) => {
        setWorkout(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
            };
        });
    };

    const handleAddManual = () => {
        const newExercise: Exercise = {
            id: Date.now().toString(),
            name: 'Novo Exercício',
            sets: 3,
            reps: '10',
            weight: '',
            notes: ''
        };
        setWorkout(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                exercises: [...prev.exercises, newExercise]
            };
        });
    };

    const handleSave = async () => {
        if (!workout || workout.exercises.length === 0) {
            alert("A ficha deve ter pelo menos um exercício.");
            return;
        }

        await updateSheet(workout.id, {
            title: workout.title || 'Treino (Sem Nome)',
            exercises: workout.exercises
        });

        navigate('/sheets');
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-32">
            {/* Top Bar */}
            <header className="flex items-center justify-between p-4 pt-6 bg-card border-b border-border shadow-sm sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center flex-1">
                    <h2 className="text-[10px] font-bold tracking-[0.2em] text-brand uppercase mb-1">Antigravity</h2>
                    <h1 className="text-sm font-bold uppercase">Editar Ficha</h1>
                </div>
                <div className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-brand transition-colors cursor-pointer" onClick={handleSave}>
                    <Save size={20} />
                </div>
            </header>

            <div className="px-4 pb-4 mt-6">
                <div className="mb-10 last:mb-0">
                    <input
                        type="text"
                        value={workout.title}
                        onChange={(e) => handleUpdateTitle(e.target.value)}
                        className="w-full text-xl font-black mb-6 bg-transparent border-none outline-none focus:ring-2 focus:ring-brand/50 rounded-lg px-2 py-1 uppercase text-brand"
                        placeholder="Nome da Ficha"
                    />

                    <div className="space-y-4">
                        {workout.exercises.map((exercise, index) => (
                            <div key={exercise.id} className="bg-card rounded-3xl p-5 shadow-sm border border-border flex flex-col gap-4 overflow-hidden relative">
                                {/* Left Accent Bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand"></div>

                                <div className="flex-1 w-full pl-2">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand/10 text-brand font-bold px-3 py-1 rounded-lg text-sm bg-brand text-white shadow-md">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Exercício</span>
                                        </div>
                                        <button onClick={() => handleDelete(exercise.id)} className="text-red-400 hover:text-red-500 transition-colors p-2 bg-red-500/10 rounded-full hover:bg-red-500/20">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <input
                                        className="font-bold text-lg mb-4 text-foreground w-full bg-transparent border-b border-transparent hover:border-border focus:border-brand outline-none transition-colors py-1"
                                        value={exercise.name}
                                        placeholder="Nome do exercício"
                                        onChange={(e) => handleUpdateExercise(exercise.id, 'name', e.target.value)}
                                    />

                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-muted/50 border border-border rounded-xl p-2 focus-within:ring-1 focus-within:ring-brand">
                                            <p className="text-[9px] font-bold text-zinc-400 tracking-wider mb-1 uppercase">Séries</p>
                                            <input
                                                type="text"
                                                value={exercise.sets}
                                                onChange={(e) => handleUpdateExercise(exercise.id, 'sets', e.target.value)}
                                                className="w-full bg-transparent font-bold text-center outline-none text-foreground"
                                            />
                                        </div>
                                        <div className="bg-muted/50 border border-border rounded-xl p-2 focus-within:ring-1 focus-within:ring-brand">
                                            <p className="text-[9px] font-bold text-zinc-400 tracking-wider mb-1 uppercase">Reps</p>
                                            <input
                                                type="text"
                                                value={exercise.reps}
                                                onChange={(e) => handleUpdateExercise(exercise.id, 'reps', e.target.value)}
                                                className="w-full bg-transparent font-bold text-center outline-none text-foreground"
                                            />
                                        </div>
                                        <div className="bg-muted/50 border border-border rounded-xl p-2 flex items-center justify-center focus-within:ring-1 focus-within:ring-brand">
                                            <div className="w-full text-center">
                                                <p className="text-[9px] font-bold text-zinc-400 tracking-wider mb-1 uppercase text-left pl-1">Carga</p>
                                                <div className="flex items-center justify-center gap-1">
                                                    <input
                                                        type="text"
                                                        value={exercise.weight || ''}
                                                        placeholder="-"
                                                        onChange={(e) => handleUpdateExercise(exercise.id, 'weight', e.target.value)}
                                                        className="w-8 bg-transparent font-bold text-center outline-none text-foreground placeholder:text-zinc-500"
                                                    />
                                                    <span className="text-[10px] text-zinc-400 font-medium">kg</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes Field */}
                                    <div className="bg-background/80 rounded-xl p-3 border border-border focus-within:ring-1 focus-within:ring-brand/50 transition-shadow">
                                        <p className="text-[9px] font-bold text-brand tracking-wider mb-2 uppercase">Observações / Diretrizes</p>
                                        <textarea
                                            className="w-full bg-transparent text-sm text-foreground outline-none resize-none hide-scrollbar"
                                            rows={2}
                                            placeholder="Nenhuma observação."
                                            value={exercise.notes || ''}
                                            onChange={(e) => handleUpdateExercise(exercise.id, 'notes', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleAddManual}
                            className="w-full bg-transparent border-2 border-dashed border-border rounded-3xl py-5 flex items-center justify-center gap-3 text-zinc-500 hover:bg-muted hover:border-zinc-400 transition-colors mt-4 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                                <Plus size={18} />
                            </div>
                            <span className="font-bold text-sm tracking-wide">Adicionar Novo Exercício</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Fixed Actions */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/90 backdrop-blur-xl border-t border-border p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
                <button
                    onClick={handleSave}
                    className="w-full bg-brand text-white font-black text-sm tracking-wider uppercase py-4 px-6 rounded-2xl flex items-center justify-center hover:bg-brand-light active:scale-[0.98] transition-all shadow-[0_8px_25px_rgba(37,95,245,0.4)]"
                >
                    <Save size={18} className="mr-2" />
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
}
