import { useState } from 'react';
import { Sparkles, Brain, CheckCircle, AlertTriangle, ArrowRight, LoaderCircle, Calendar, RefreshCw } from 'lucide-react';
import { useWorkouts, WorkoutSheet } from '../context/WorkoutContext';
import { generateSheetInsights } from '../lib/aiInsightsService';

export default function InsightsArea() {
    const { sheets, updateSheet } = useWorkouts();
    const [selectedSheet, setSelectedSheet] = useState<WorkoutSheet | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Filter available sheets (if they have exercises)
    const validSheets = sheets.filter(s => s.exercises && s.exercises.length > 0);

    const handleAnalyze = async (sheet: WorkoutSheet, forceAnalysis = false) => {
        if (!forceAnalysis) {
            setSelectedSheet(sheet);
        }

        if (sheet.insights && !forceAnalysis) {
            // Already analyzed
            return;
        }

        setIsAnalyzing(true);
        const generatedInsights = await generateSheetInsights(sheet, sheets);

        if (generatedInsights) {
            // Save to Firebase via Context
            await updateSheet(sheet.id, { insights: generatedInsights });
            // Let the context reactivity update the selectedSheet in the next render cycle, 
            // but we can locally mutate for instant UI update before context flows back
            setSelectedSheet({ ...sheet, insights: generatedInsights });
        }
        setIsAnalyzing(false);
    };

    return (
        <div className="flex flex-col min-h-screen p-4 pb-24 text-foreground bg-background">
            <header className="flex items-center justify-between mb-8 pt-2">
                <h1 className="text-2xl font-black uppercase text-foreground">AI Insights</h1>
                <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <Sparkles size={20} />
                </div>
            </header>

            {!selectedSheet ? (
                <section>
                    <p className="text-sm text-muted-foreground mb-6">
                        Selecione uma ficha de treino para que nossa Inteligência Artificial analise seus padrões, balanceamento muscular e ofereça dicas personalizadas.
                    </p>

                    <div className="space-y-4">
                        {validSheets.length === 0 ? (
                            <div className="text-center p-8 bg-card rounded-3xl border border-border/50">
                                <p className="text-muted-foreground">Você ainda não tem fichas de treino válidas.</p>
                            </div>
                        ) : (
                            validSheets.map(sheet => (
                                <button
                                    key={sheet.id}
                                    onClick={() => handleAnalyze(sheet)}
                                    className="w-full text-left bg-card rounded-2xl p-4 border border-border/50 hover:border-brand/50 transition-all flex items-center justify-between group"
                                >
                                    <div>
                                        <h3 className="font-bold text-foreground group-hover:text-brand transition-colors">{sheet.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">{sheet.exercises.length} Exercícios</span>
                                            {sheet.insights && (
                                                <span className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Analisado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-muted-foreground group-hover:text-brand transition-colors transform group-hover:translate-x-1" />
                                </button>
                            ))
                        )}
                    </div>
                </section>
            ) : (
                <section>
                    <button
                        onClick={() => setSelectedSheet(null)}
                        className="text-[10px] font-bold tracking-widest text-brand uppercase mb-6 flex items-center gap-1 hover:text-brand-light transition-colors"
                    >
                        &larr; Voltar para a Lista
                    </button>

                    <h2 className="text-xl font-black uppercase mb-1">{selectedSheet.title}</h2>

                    {isAnalyzing ? (
                        <div className="mt-12 flex flex-col items-center justify-center text-center p-8 bg-card/50 rounded-[2rem] border border-brand/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-brand/5 animate-pulse"></div>
                            <LoaderCircle size={48} className="text-brand animate-spin mb-6" />
                            <h3 className="text-lg font-bold mb-2">A IA está analisando sua ficha...</h3>
                            <p className="text-sm text-muted-foreground">Avaliando volume, equilíbrio muscular e histórico de treinos.</p>
                        </div>
                    ) : selectedSheet.insights ? (
                        <div className="space-y-6 mt-4 animate-fadeIn">

                            {/* Classification */}
                            <div className="bg-gradient-to-br from-brand/20 to-brand/5 rounded-3xl p-6 border border-brand/20">
                                <div className="flex items-center gap-2 mb-2 text-brand">
                                    <Brain size={20} />
                                    <h3 className="text-xs font-bold tracking-widest uppercase">Classificação do Treino</h3>
                                </div>
                                <p className="text-xl font-black">{selectedSheet.insights.classification}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Total Volume */}
                                <div className="bg-card rounded-3xl p-5 border border-border/50 flex flex-col justify-center">
                                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Volume Total Estimado</h3>
                                    <p className="text-lg font-bold text-foreground leading-tight">{selectedSheet.insights.totalVolume}</p>
                                </div>

                                {/* Muscle Distribution Mini-Chart (Mock using flex) */}
                                <div className="bg-card rounded-3xl p-5 border border-border/50">
                                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">Foco Muscular</h3>
                                    <div className="space-y-4">
                                        {Object.entries(selectedSheet.insights.muscleDistribution || {}).slice(0, 3).map(([muscle, percent]) => (
                                            <div key={muscle} className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-xs font-bold text-foreground">{muscle}</span>
                                                    <span className="text-[10px] font-bold text-brand">{percent}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-brand rounded-full"
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Historical Comparison */}
                            {selectedSheet.insights.historicalComparison && (
                                <div className="bg-card rounded-3xl p-6 border border-border/50">
                                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Comparação Histórica</h3>
                                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                        {selectedSheet.insights.historicalComparison}
                                    </p>
                                </div>
                            )}

                            {/* New Metrics Row: RPE and Diversity */}
                            <div className="grid grid-cols-2 gap-4">
                                {selectedSheet.insights.estimatedRPE && (
                                    <div className="bg-card rounded-3xl p-5 border border-border/50 flex flex-col justify-center">
                                        <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Intensidade (Estimada)</h3>
                                        <p className="text-sm font-bold text-foreground leading-tight">{selectedSheet.insights.estimatedRPE}</p>
                                    </div>
                                )}
                                {selectedSheet.insights.exerciseDiversity && (
                                    <div className="bg-card rounded-3xl p-5 border border-border/50 flex flex-col justify-center">
                                        <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Diversidade de Exercícios</h3>
                                        <p className="text-xs text-foreground/80 leading-relaxed font-medium">{selectedSheet.insights.exerciseDiversity}</p>
                                    </div>
                                )}
                            </div>

                            {/* Issues Detected */}
                            {selectedSheet.insights.issuesDetected && selectedSheet.insights.issuesDetected.length > 0 && (
                                <div className="bg-red-500/10 rounded-3xl p-6 border border-red-500/20">
                                    <div className="flex items-center gap-2 mb-4 text-red-500">
                                        <AlertTriangle size={20} />
                                        <h3 className="text-xs font-bold tracking-widest uppercase text-red-500">Atenção Necessária</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {selectedSheet.insights.issuesDetected.map((issue, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-red-200/80 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                                                {issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Coach Tips */}
                            {selectedSheet.insights.coachTips && selectedSheet.insights.coachTips.length > 0 && (
                                <div className="bg-card rounded-3xl p-6 border border-border/50">
                                    <div className="flex items-center gap-2 mb-4 text-emerald-500">
                                        <CheckCircle size={20} />
                                        <h3 className="text-xs font-bold tracking-widest uppercase text-emerald-500">Dicas do Treinador AI</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {selectedSheet.insights.coachTips.map((tip, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-foreground/70 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Periodization Tip */}
                            {selectedSheet.insights.periodizationTip && (
                                <div className="bg-brand/5 rounded-3xl p-6 border border-brand/20">
                                    <div className="flex items-center gap-2 mb-3 text-brand">
                                        <Calendar size={20} />
                                        <h3 className="text-xs font-bold tracking-widest uppercase text-brand">Sugestão de Periodização</h3>
                                    </div>
                                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                                        {selectedSheet.insights.periodizationTip}
                                    </p>
                                </div>
                            )}

                            {/* Refazer Analise Button */}
                            <button
                                onClick={() => handleAnalyze(selectedSheet, true)}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-card border border-border/50 text-muted-foreground font-bold hover:bg-brand/10 hover:text-brand hover:border-brand/20 transition-all active:scale-[0.98]"
                            >
                                <RefreshCw size={18} />
                                <span>REFAZER ANÁLISE COMPLETA</span>
                            </button>

                        </div>
                    ) : (
                        <div className="mt-12 text-center p-8 bg-red-500/10 border border-red-500/20 rounded-3xl">
                            <p className="text-red-400 font-medium">Ocorreu um erro ao gerar a análise. Tente novamente mais tarde.</p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
