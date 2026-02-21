import { useState, useRef, ChangeEvent } from 'react';
import { Paperclip, Sparkles, ArrowRight, AlignLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { openai } from '../lib/openai';

// Configuração do worker do PDF.js via unpkg/cdn para Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function ImportWorkout() {
    const navigate = useNavigate();
    const [rawText, setRawText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtractingPDF, setIsExtractingPDF] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [pdfFileName, setPdfFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtractingPDF(true);
        try {
            const base64Url = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            setPdfBlobUrl(base64Url);
            setPdfFileName(file.name);

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
            }).promise;

            let extractedText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                extractedText += pageText + '\n';
            }

            setRawText(extractedText);
        } catch (error) {
            console.error("Erro ao ler o PDF:", error);
            alert("Não foi possível ler este PDF. Tente colar o texto manualmente.");
        } finally {
            setIsExtractingPDF(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!rawText.trim()) return;
        setIsAnalyzing(true);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Você é uma IA de extração de treinos de academia. O usuário vai colar um texto (provavelmente copiado de um PDF ou WhatsApp) que pode conter UMA ou MAIS divisões de treino (ex: Ficha A, Ficha B, Treino 1, etc).
Sua missão é agrupar os exercícios em suas respectivas divisões (workouts) e extrair os dados.
- Identifique a divisão (ex: "Ficha A: Peito e Tríceps") e coloque no campo "title". Se não houver divisão explícita, crie um título descritivo (ex: "Treino Completo").
- Extraia cada exercício com: nome, séries (sets), repetições (reps), carga (weight - se houver).
- Se houver diretrizes, observações, bizus de execução ou pausas associadas a um exercício ou bloco, extraia isso para o campo "notes".

Sempre retorne APENAS um objeto JSON no formato exato:
{
  "workouts": [
    {
      "title": "Nome da Ficha",
      "exercises": [
        { "name": "Nome do Exerc.", "sets": "Séries", "reps": "Repetições", "weight": "", "notes": "Observações ou deixe vazio" }
      ]
    }
  ]
}`
                    },
                    {
                        role: "user",
                        content: rawText
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message?.content;
            if (content) {
                const parsed = JSON.parse(content);
                // Map the new structure
                const workouts = (parsed.workouts || []).map((w: any, wIndex: number) => ({
                    title: w.title || "Treino " + (wIndex + 1),
                    exercises: (w.exercises || []).map((ex: any, eIndex: number) => ({
                        id: Date.now().toString() + wIndex + eIndex,
                        name: ex.name || "Exercício " + (eIndex + 1),
                        sets: ex.sets || 3,
                        reps: String(ex.reps || '10'),
                        weight: ex.weight || '',
                        notes: ex.notes || ''
                    }))
                }));
                navigate('/review', { state: { extractedWorkouts: workouts, pdfUrl: pdfBlobUrl, pdfName: pdfFileName } });
            }
        } catch (error) {
            console.error("Erro na OpenAI", error);
            alert("Erro ao analisar com a IA. Verifique sua conexão e chave de API.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen p-4 pb-24">
            {/* Top Bar */}
            <header className="flex flex-col items-center justify-center mb-8 pt-6">
                <h2 className="text-[10px] font-bold tracking-[0.2em] text-brand uppercase mb-1">Antigravity</h2>
                <h1 className="text-2xl font-black uppercase text-foreground">Importar Treino</h1>
            </header>

            {/* Hidden Input */}
            <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
            />

            {/* PDF Upload Area */}
            <section className="mb-6">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-card/40 border-2 border-dashed border-brand/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all hover:bg-brand/5 hover:border-brand cursor-pointer shadow-[0_0_20px_rgba(37,95,245,0.1)]"
                >
                    {/* Subtle glow behind the icon */}
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-brand/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>

                    <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mb-4 relative z-10">
                        {isExtractingPDF ? <Loader2 size={24} className="text-brand animate-spin" /> : <Paperclip size={24} className="text-brand" />}
                    </div>

                    <h3 className="font-bold text-[15px] text-foreground relative z-10 mb-1">
                        {isExtractingPDF ? 'LENDO PDF...' : 'UPLOAD DE PDF'}
                    </h3>
                    <p className="text-sm text-muted-foreground relative z-10">
                        {isExtractingPDF ? 'Aguarde' : 'Toque para selecionar arquivo'}
                    </p>
                </div>
            </section>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 mb-6 opacity-50">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase">OU</span>
                <div className="h-px bg-border flex-1"></div>
            </div>

            {/* Text Paste Area */}
            <section className="mb-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    <AlignLeft size={16} className="text-brand" />
                    <h3 className="font-bold text-sm text-brand uppercase tracking-wider">Ver/Colar Texto</h3>
                </div>

                <div className="bg-card border border-brand/30 rounded-3xl p-1 relative flex-1 min-h-[150px] shadow-[0_0_15px_rgba(37,95,245,0.05)]">
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full h-full bg-transparent border-none resize-none p-5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none hide-scrollbar"
                        placeholder="Ex: Supino Reto 4x10&#10;Agachamento Livre 3x12&#10;... Cole seu treino aqui ou faça upload do PDF acima."
                    ></textarea>
                </div>
            </section>

            {/* Info Box */}
            <section className="mb-8">
                <div className="bg-card/40 border border-border/50 rounded-2xl p-4 flex gap-4 items-start">
                    <Sparkles size={20} className="text-brand shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-brand uppercase tracking-wider mb-1">IA Antigravity (GPT-4)</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            A nova inteligência interpretará as nomenclaturas, séries e repetições automaticamente e perfeitamente.
                        </p>
                    </div>
                </div>
            </section>

            {/* Action Button */}
            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !rawText.trim() || isExtractingPDF}
                className="w-full bg-brand disabled:bg-brand/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-light active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(37,95,245,0.4)]"
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm tracking-wider uppercase">Gerando Ficha...</span>
                    </>
                ) : (
                    <>
                        <span className="text-sm tracking-wider uppercase">Analisar Treino</span>
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </div>
    );
}
