import { useState } from 'react';
import { FileText, Plus, FileDown, Dumbbell, Trash2, Edit, ChevronDown, ChevronUp, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';

const Sheets = () => {
    const navigate = useNavigate();
    const { sheets, activeSheet, setActiveSheet, deleteSheet } = useWorkouts();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Format date string to display nicely
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', day: 'numeric' });
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const inactiveSheets = sheets.filter(s => !s.isActive);
    const groupedSheets = inactiveSheets.reduce((acc, sheet) => {
        if (sheet.groupId) {
            if (!acc[sheet.groupId]) acc[sheet.groupId] = [];
            acc[sheet.groupId].push(sheet);
        } else {
            if (!acc['manual']) acc['manual'] = [];
            acc['manual'].push(sheet);
        }
        return acc;
    }, {} as Record<string, typeof sheets>);


    const renderSheetItem = (sheet: typeof sheets[0]) => (
        <div key={sheet.id} className="bg-card border border-border rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 opacity-80 hover:opacity-100 transition-all group mb-3 last:mb-0">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted text-zinc-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base pr-2 truncate">{sheet.title}</h3>
                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1">{formatDate(sheet.createdAt)} • {sheet.exercises.length} Ex.</p>
                </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border sm:border-0 sm:mt-0">
                <button
                    onClick={() => setActiveSheet(sheet.id)}
                    className="text-[10px] sm:text-xs font-bold bg-brand/10 text-brand px-3 py-2 sm:py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors uppercase tracking-wider flex-1 sm:flex-none text-center"
                >
                    Ativar
                </button>
                <div className="flex gap-1.5 sm:gap-1 shrink-0">
                    <button
                        onClick={() => navigate(`/edit-sheet/${sheet.id}`)}
                        className="p-2 sm:p-1.5 text-zinc-400 hover:bg-brand/10 hover:text-brand rounded-lg transition-colors bg-muted/30 sm:bg-transparent"
                    >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        onClick={() => { if (confirm('Excluir esta ficha?')) deleteSheet(sheet.id) }}
                        className="p-2 sm:p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors bg-muted/30 sm:bg-transparent"
                    >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background text-foreground p-6">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-sans">Fichas</h1>
                    <p className="text-sm text-zinc-500 mt-1">Gerencie seus treinos</p>
                </div>
                <button
                    onClick={() => navigate('/import')}
                    className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shadow-lg hover:bg-brand-dark transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </header>

            {sheets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                        <Dumbbell className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Nenhuma ficha salva</h2>
                    <p className="text-sm text-zinc-500 mb-8 max-w-[250px]">
                        Importe seu treino via PDF, cole o texto, ou crie uma ficha manualmente.
                    </p>
                    <button
                        onClick={() => navigate('/import')}
                        className="bg-brand text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm shadow-[0_10px_30px_rgba(37,95,245,0.4)] active:scale-[0.98] transition-all"
                    >
                        Criar Primeira Ficha
                    </button>
                </div>
            ) : (
                <>
                    {activeSheet && (
                        <>
                            <h2 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Ficha Atual</h2>

                            <div className="bg-gradient-to-br from-brand to-brand-light rounded-3xl p-6 text-white shadow-xl shadow-brand/20 mb-8 relative overflow-hidden min-h-40 flex flex-col justify-between gap-4">
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="pr-4">
                                        <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm mb-2">Ativa</span>
                                        <h3 className="text-2xl font-bold shadow-sm leading-tight">{activeSheet.title}</h3>
                                    </div>
                                    <div className="flex gap-2 relative z-10 shrink-0">
                                        <button onClick={() => navigate(`/edit-sheet/${activeSheet.id}`)} className="p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors" title="Editar Ficha">
                                            <Edit className="w-4 h-4 text-white" />
                                        </button>
                                        <button onClick={() => { if (confirm('Excluir esta ficha?')) deleteSheet(activeSheet.id) }} className="p-2 bg-red-500/40 rounded-full backdrop-blur-sm hover:bg-red-500/80 transition-colors" title="Excluir Ficha">
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10 flex text-sm text-white/90 justify-between items-end mt-2">
                                    <div>
                                        <p>{activeSheet.exercises.length} Exercícios</p>
                                        <p className="text-xs text-white/70 mt-1">Criada em {formatDate(activeSheet.createdAt)}</p>
                                    </div>
                                    <button onClick={() => navigate('/pre-workout')} className="bg-white text-brand px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all">
                                        Treinar
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <h2 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Acervo de Fichas</h2>

                    <div className="space-y-4">
                        {/* Render Manual Sheets */}
                        {groupedSheets['manual']?.map(renderSheetItem)}

                        {/* Render Grouped Sheets */}
                        {Object.entries(groupedSheets).filter(([key]) => key !== 'manual').map(([groupId, groupSheets]) => {
                            const isExpanded = expandedGroups[groupId] || false;
                            // Sort group sheets by title to keep A, B, C order if imported that way
                            const sortedGroup = [...groupSheets].sort((a, b) => a.title.localeCompare(b.title));
                            return (
                                <div key={groupId} className="bg-card border border-border rounded-2xl overflow-hidden">
                                    <button
                                        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                                        onClick={() => toggleGroup(groupId)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                                                <Folder className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-sm">Programa Completo</h3>
                                                <p className="text-xs text-zinc-500">{sortedGroup.length} Fichas • Cadastrado em {formatDate(sortedGroup[0]?.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {sortedGroup[0]?.pdfUrl && (
                                                <a
                                                    href={sortedGroup[0].pdfUrl}
                                                    download={sortedGroup[0].pdfName || "ProgramaCompleto.pdf"}
                                                    className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title={sortedGroup[0].pdfName || "Baixar PDF Original"}
                                                >
                                                    <FileDown className="w-4 h-4" />
                                                </a>
                                            )}
                                            <div className="text-zinc-400">
                                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="p-4 pt-2 bg-background/50 border-t border-border">
                                            {sortedGroup.map(renderSheetItem)}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-8 border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-colors"
                        onClick={() => navigate('/import')}>
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <FileDown className="w-6 h-6 text-zinc-400" />
                        </div>
                        <h3 className="font-bold text-sm mb-1">Importar Nova Ficha</h3>
                        <p className="text-xs text-zinc-500">Faça upload ou cole um treino</p>
                    </div>
                </>
            )}

            <div className="h-6"></div> {/* Bottom padding */}
        </div>
    );
};

export default Sheets;
