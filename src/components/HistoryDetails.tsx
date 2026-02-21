import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';
import { ArrowLeft, Dumbbell, Calendar, FileText } from 'lucide-react';

const HistoryDetails = () => {
    const { logId } = useParams();
    const navigate = useNavigate();
    const { historyLogs, sheets, updateHistoryLog, updateSheet } = useWorkouts();
    const [isLinking, setIsLinking] = useState(false);

    const log = historyLogs.find(l => l.id === logId);

    if (!log) {
        return (
            <div className="flex flex-col h-full bg-background text-foreground p-6 items-center justify-center">
                <p className="text-zinc-500 mb-4 text-center">Registro de histórico não encontrado.</p>
                <button onClick={() => navigate('/history')} className="bg-brand text-white px-6 py-3 rounded-full font-bold">Voltar</button>
            </div>
        );
    }

    // Filtra as fichas que pertencem a este registro de histórico (via groupId)
    const programSheets = log.groupId
        ? sheets.filter(sheet => sheet.groupId === log.groupId)
        : [];

    const date = new Date(log.date);

    const handleLinkOldSheets = async () => {
        setIsLinking(true);
        try {
            const orphanSheets = sheets.filter(s => !s.groupId);

            if (orphanSheets.length === 0) {
                alert("Nenhuma ficha solta encontrada para vincular.");
                setIsLinking(false);
                return;
            }

            // Atribui o ID do history log como groupId de todos para amarrar
            await updateHistoryLog(log.id, { groupId: log.id });

            // Usar Promise.all para atualizar todas as fichas paralelamente
            await Promise.all(
                orphanSheets.map(sheet => updateSheet(sheet.id, { groupId: log.id }))
            );
        } catch (error) {
            console.error(error);
            alert("Erro ao vincular as fichas.");
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground p-6">
            <header className="mb-6 flex flex-col gap-4">
                <button
                    onClick={() => navigate('/history')}
                    className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold font-sans">{log.title}</h1>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {date.toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 pb-24">
                {/* PDF Anexado (se houver) */}
                {log.pdfUrl && (
                    <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-sm">Documento Original</h3>
                                <p className="text-xs text-muted-foreground">{log.pdfName || 'treino.pdf'}</p>
                            </div>
                        </div>
                        <a
                            href={log.pdfUrl}
                            download={log.pdfName || "treino.pdf"}
                            className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                        >
                            Baixar
                        </a>
                    </div>
                )}

                {/* Lista de Fichas do Programa */}
                <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Dumbbell size={20} className="text-brand" />
                        Conteúdo do Programa
                    </h2>

                    {programSheets.length === 0 ? (
                        <div className="bg-card/50 border border-border/30 rounded-2xl p-6 text-center">
                            <p className="text-sm text-zinc-500 mb-4">
                                {log.groupId
                                    ? "As fichas deste programa foram removidas do acervo."
                                    : "Este registro antigo não possui fichas vinculadas."}
                            </p>

                            {!log.groupId && (
                                <button
                                    onClick={handleLinkOldSheets}
                                    disabled={isLinking}
                                    className="text-xs font-bold text-brand bg-brand/10 px-4 py-2 rounded-full hover:bg-brand hover:text-white transition-colors disabled:opacity-50"
                                >
                                    {isLinking ? "Vinculando..." : "Vincular Fichas do Acervo"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {programSheets.map((sheet) => (
                                <div key={sheet.id} className="bg-card border border-border/50 rounded-2xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-foreground">{sheet.title}</h3>
                                        <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded-md">
                                            {sheet.exercises.length} {sheet.exercises.length === 1 ? 'exercício' : 'exercícios'}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {sheet.exercises.map((exercise, idx) => (
                                            <div key={idx} className="flex justify-between items-start text-sm border-b border-border/30 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                                                <span className="text-foreground/90 pr-3 flex-1 font-medium leading-snug">{exercise.name}</span>
                                                <span className="text-muted-foreground whitespace-nowrap text-xs mt-0.5">
                                                    {exercise.sets}x{exercise.reps} {exercise.weight ? `| ${exercise.weight}` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryDetails;
