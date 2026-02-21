import { useState } from 'react';
import { ArrowLeft, Trash2, Plus, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkouts, Exercise } from '../context/WorkoutContext';


export default function ReviewExtraction() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addSheet, sheets, addHistoryLog } = useWorkouts();

    type WorkoutDraft = {
        title: string;
        exercises: Exercise[];
    };

    const initialWorkouts: WorkoutDraft[] = location.state?.extractedWorkouts || [];
    const pdfBlobUrl: string | null = location.state?.pdfUrl || null;
    const pdfFileName: string | null = location.state?.pdfName || null;

    const [workouts, setWorkouts] = useState<WorkoutDraft[]>(initialWorkouts);
    const [isSaving, setIsSaving] = useState(false);

    const handleUpdateTitle = (wIndex: number, newTitle: string) => {
        setWorkouts(prev => {
            const copy = [...prev];
            copy[wIndex].title = newTitle;
            return copy;
        });
    };

    const handleUpdateExercise = (wIndex: number, id: string, field: keyof Exercise, value: string) => {
        setWorkouts(prev => {
            const copy = [...prev];
            copy[wIndex].exercises = copy[wIndex].exercises.map(ex =>
                ex.id === id ? { ...ex, [field]: value } : ex
            );
            return copy;
        });
    };

    const handleDelete = (wIndex: number, id: string) => {
        setWorkouts(prev => {
            const copy = [...prev];
            copy[wIndex].exercises = copy[wIndex].exercises.filter(ex => ex.id !== id);
            return copy;
        });
    };

    const handleAddManual = (wIndex: number) => {
        const newExercise: Exercise = {
            id: Date.now().toString(),
            name: 'Novo Exercício',
            sets: 3,
            reps: '10',
            weight: '',
            notes: ''
        };
        setWorkouts(prev => {
            const copy = [...prev];
            copy[wIndex].exercises = [...copy[wIndex].exercises, newExercise];
            return copy;
        });
    };

    const handleSave = async () => {
        if (workouts.length === 0 || workouts.every(w => w.exercises.length === 0)) {
            alert("Adicione pelo menos um exercício para salvar.");
            return;
        }
        setIsSaving(true);
        const groupId = Date.now().toString();

        try {
            const promises = workouts.map((w, index) => {
                if (w.exercises.length > 0) {
                    return addSheet({
                        title: w.title || 'Treino Importado',
                        exercises: w.exercises,
                        isActive: sheets.length === 0 ? index === 0 : false,
                        groupId,
                        pdfUrl: pdfBlobUrl || undefined,
                        pdfName: pdfFileName || undefined
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(promises);

            await addHistoryLog(
                'Programa Completo',
                pdfBlobUrl || undefined,
                pdfFileName || undefined,
                groupId
            );

            navigate('/sheets');
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Houve um error ao salvar sua ficha.");
        } finally {
            setIsSaving(false);
        }
    };

    if (workouts.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground p-6 items-center justify-center">
                <p className="text-zinc-500 mb-4 text-center">Nenhum treino encontrado para revisar.</p>
                <button onClick={() => navigate('/import')} className="bg-brand text-white px-6 py-3 rounded-full font-bold">Voltar para Importação</button>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-32">
            {/* Top Bar */}
            <header className="flex items-center justify-between p-4 pt-6 bg-card border-b border-border shadow-sm sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center flex-1">
                    <h2 className="text-[10px] font-bold tracking-[0.2em] text-brand uppercase mb-1">Antigravity</h2>
                    <h1 className="text-sm font-bold uppercase">Revisar Extração</h1>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-full">
                    <span className="text-xs font-bold text-zinc-500">2/2</span>
                </div>
            </header>

            <div className="px-4 pb-4 mt-4">
                <p className="text-sm text-zinc-500 mb-6 px-2">
                    Nossa IA separou seus treinos em Fichas. Verifique os destalhes e observações e altere o que precisar antes de confirmar.
                </p>

                {workouts.map((workout, wIndex) => (
                    <div key={wIndex} className="mb-10 last:mb-0">
                        <input
                            type="text"
                            value={workout.title}
                            onChange={(e) => handleUpdateTitle(wIndex, e.target.value)}
                            className="w-full text-xl font-black mb-4 bg-transparent border-none outline-none focus:ring-2 focus:ring-brand/50 rounded-lg px-2 py-1 uppercase text-brand"
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
                                                <div className="bg-brand/10 text-brand font-bold px-3 py-1 rounded-lg text-sm">
                                                    {String(index + 1).padStart(2, '0')}
                                                </div>
                                                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Exercício</span>
                                            </div>
                                            <button onClick={() => handleDelete(wIndex, exercise.id)} className="text-red-400 hover:text-red-500 transition-colors p-1">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <input
                                            className="font-bold text-lg mb-4 text-foreground w-full bg-transparent border-b border-transparent hover:border-border focus:border-brand outline-none transition-colors"
                                            value={exercise.name}
                                            placeholder="Nome do exercício"
                                            onChange={(e) => handleUpdateExercise(wIndex, exercise.id, 'name', e.target.value)}
                                        />

                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="bg-muted border border-border rounded-xl p-2">
                                                <p className="text-[9px] font-bold text-zinc-400 tracking-wider mb-1 uppercase">Séries</p>
                                                <input
                                                    type="text"
                                                    value={exercise.sets}
                                                    onChange={(e) => handleUpdateExercise(wIndex, exercise.id, 'sets', e.target.value)}
                                                    className="w-full bg-transparent font-bold text-center outline-none text-foreground"
                                                />
                                            </div>
                                            <div className="bg-muted border border-border rounded-xl p-2">
                                                <p className="text-[9px] font-bold text-zinc-400 tracking-wider mb-1 uppercase">Reps</p>
                                                <input
                                                    type="text"
                                                    value={exercise.reps}
                                                    onChange={(e) => handleUpdateExercise(wIndex, exercise.id, 'reps', e.target.value)}
                                                    className="w-full bg-transparent font-bold text-center outline-none text-foreground"
                                                />
                                            </div>
                                            <div className="bg-muted border border-border rounded-xl p-2 flex items-center justify-center">
                                                <div className="w-full text-center">
                                                    <p className="text-[9px] font-bold text-zinc-400 tracking-wider mb-1 uppercase text-left">Carga</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={exercise.weight || ''}
                                                            placeholder="-"
                                                            onChange={(e) => handleUpdateExercise(wIndex, exercise.id, 'weight', e.target.value)}
                                                            className="w-8 bg-transparent font-bold text-center outline-none text-foreground placeholder:text-zinc-500"
                                                        />
                                                        <span className="text-xs text-zinc-400 font-medium">kg</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Field */}
                                        <div className="bg-background/50 rounded-xl p-3 border border-border/50">
                                            <p className="text-[9px] font-bold text-brand tracking-wider mb-2 uppercase">Observações / Diretrizes</p>
                                            <textarea
                                                className="w-full bg-transparent text-xs text-muted-foreground outline-none resize-none hide-scrollbar"
                                                rows={2}
                                                placeholder="Nenhuma observação."
                                                value={exercise.notes || ''}
                                                onChange={(e) => handleUpdateExercise(wIndex, exercise.id, 'notes', e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Manual Button for this specific workout */}
                            <button
                                onClick={() => handleAddManual(wIndex)}
                                className="w-full bg-transparent border-2 border-dashed border-border rounded-3xl py-4 flex items-center justify-center gap-2 text-zinc-500 hover:bg-muted hover:border-zinc-400 transition-colors mt-2"
                            >
                                <div className="w-6 h-6 rounded-full bg-zinc-400 text-white flex items-center justify-center">
                                    <Plus size={16} />
                                </div>
                                <span className="font-bold text-sm">Adicionar Manualmente em {workout.title}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Fixed Actions */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/90 backdrop-blur-xl border-t border-border p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
                <div className="flex justify-end mb-4 pr-2">
                    <button className="bg-foreground text-background rounded-full py-2 px-4 flex items-center gap-2 hover:opacity-90 transition-opacity text-xs font-bold shadow-md">
                        <FileText size={14} />
                        Ver Original
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-brand disabled:bg-brand/50 disabled:cursor-not-allowed text-white font-black text-sm tracking-wider uppercase py-4 px-6 rounded-2xl flex items-center justify-center hover:bg-brand-light active:scale-[0.98] transition-all shadow-[0_8px_25px_rgba(37,95,245,0.4)]"
                >
                    {isSaving ? "Enviando ao seu Treinador Online..." : "Confirmar e Salvar Ficha"}
                </button>
            </div>
        </div>
    );
}
