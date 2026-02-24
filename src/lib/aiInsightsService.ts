import { openai } from './openai';
import { WorkoutSheet, InsightData } from '../context/WorkoutContext';

export async function generateSheetInsights(targetSheet: WorkoutSheet, allSheets: WorkoutSheet[]): Promise<InsightData | null> {
    try {
        // Prepare context for the AI
        const previousSheets = allSheets
            .filter(s => s.id !== targetSheet.id)
            .map(s => ({
                title: s.title,
                exercises: s.exercises.slice(0, 5) // truncate to save tokens
            }));

        const prompt = `Você é um treinador de alto rendimento atuando como um assistente de Inteligência Artificial para análise de Fichas de Treino.
O usuário vai enviar uma Ficha de Treino principal e algumas fichas anteriores.
Sua missão é devolver ESTRITAMENTE um JSON neste exato formato com chaves em inglês, sem blocos de código extra e parseável:
{
  "totalVolume": "Texto curto estimando repetições/séries semanais. (Ex: 'Aprox. 240 reps/semana')",
  "muscleDistribution": {
    "Peito": 20, 
    "Costas": 30
    // Inteiros somando 100% representando o foco do treino
  },
  "classification": "Classificação do treino (Ex: Força, Hipertrofia ABCD, FullBody)",
  "issuesDetected": ["Aviso 1", "Aviso 2"] (Liste os principais desequilíbrios musculares ou volume excessivo/faltante. Se não houver, deixe vazio),
  "historicalComparison": "Texto curto comparando esta ficha com o agrupamento anterior (Ex: 'Aumentou o volume de pernas em X% comparado ao treino antigo.')",
  "coachTips": ["Dica 1", "Dica 2"] (Dicas essenciais e personalizadas baseadas nos exercícios desta ficha),
  "estimatedRPE": "Estimativa de Intensidade baseada nos exercícios (Ex: 'Alta Intensidade', 'Foco Metabólico', 'Moderada/Iniciante')",
  "exerciseDiversity": "Breve análise sobre as variações de ângulos/máquinas/livres (Ex: 'Boa mescla de pesos livres e máquinas' ou 'Muito repetitivo, carece de variação de ângulos')",
  "periodizationTip": "Sugestão de periodização em texto curto (Ex: 'Semana 1-3: Foco progressivo com aumento de carga. Semana 4: Deload (reduzir cargas em 20%).')"
}

FICHA ALVO:
Título: ${targetSheet.title}
Exercícios: ${JSON.stringify(targetSheet.exercises)}

FICHAS ANTERIORES PARA COMPARAÇÃO:
${JSON.stringify(previousSheets)}
`;

        const response = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: "Você é um assistente fitness fornecendo output JSON ESTRITO e limpo." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(content) as InsightData;
            return parsed;
        }
        return null;
    } catch (e) {
        console.error("Error generating insights:", e);
        return null;
    }
}

export type ExerciseSubstitution = {
    suggestion: string;
    reason: string;
    execution: string;
};

export async function generateExerciseSubstitution(exerciseName: string, sheetTitle: string): Promise<ExerciseSubstitution | null> {
    try {
        const prompt = `Você é um treinador de alto rendimento atuando como assistente de IA.
O usuário está visualizando a ficha "${sheetTitle}" e quer uma sugestão de substituição pontual para o exercício: "${exerciseName}".
Sua missão é sugerir UMA alternativa viável que trabalhe a mesma musculatura e responda ESTRITAMENTE num JSON com chaves em inglês, parseável e sem blocos extra:

{
  "suggestion": "Nome do exercício substituto (Ex: Peck Deck Voador)",
  "reason": "Por que essa é uma boa troca? (Ex: Isola o peitoral de forma similar e poupa os ombros)",
  "execution": "Dica rápida de execução (Ex: Mantenha as escápulas aduzidas e os cotovelos altos durante o movimento)"
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: "Você é um assistente fitness fornecendo output JSON ESTRITO e limpo." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(content) as ExerciseSubstitution;
            return parsed;
        }
        return null;
    } catch (e) {
        console.error("Error generating substitution:", e);
        return null;
    }
}
