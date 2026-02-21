import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Calendar, FileText, Plus, LoaderCircle } from 'lucide-react';
import { useWorkouts } from '../context/WorkoutContext';

const History = () => {
    const { historyLogs, updateHistoryLog } = useWorkouts();
    const navigate = useNavigate();
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const handleRetroactivePdfUpload = async (e: ChangeEvent<HTMLInputElement>, id: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(id);
        try {
            const base64Url = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            await updateHistoryLog(id, {
                pdfUrl: base64Url,
                pdfName: file.name
            });
        } catch (error) {
            console.error("Erro ao salvar PDF:", error);
            alert("Não foi possível anexar o PDF. Tente novamente.");
        } finally {
            setUploadingId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground p-6">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold font-sans">Histórico</h1>
                <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                    <HistoryIcon className="w-5 h-5 text-zinc-400" />
                </div>
            </header>

            {historyLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-32 text-center opacity-80">
                    <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand mb-4">
                        <HistoryIcon size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Sem histórico ainda</h2>
                    <p className="text-sm text-zinc-500 max-w-[250px]">
                        Seus programas importados aparecerão aqui. Importe treinos para manter seu histórico!
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pb-24">
                    {historyLogs.map((log) => {
                        const date = new Date(log.date);
                        return (
                            <div
                                key={log.id}
                                onClick={() => navigate(`/history/${log.id}`)}
                                className="bg-card border border-border/50 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-brand/40 transition-colors"
                            >
                                <div>
                                    <h3 className="font-bold text-foreground mb-1">{log.title}</h3>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {date.toLocaleDateString('pt-BR', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {log.pdfUrl ? (
                                        <a
                                            href={log.pdfUrl}
                                            download={log.pdfName || "treino.pdf"}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <FileText size={16} />
                                        </a>
                                    ) : (
                                        <label
                                            className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-500 hover:bg-zinc-500 hover:text-white transition-colors cursor-pointer relative"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                onChange={(e) => handleRetroactivePdfUpload(e, log.id)}
                                                disabled={uploadingId === log.id}
                                            />
                                            {uploadingId === log.id ? (
                                                <LoaderCircle className="animate-spin" size={16} />
                                            ) : (
                                                <Plus size={16} />
                                            )}
                                        </label>
                                    )}
                                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                        <HistoryIcon size={16} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default History;
