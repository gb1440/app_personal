import { openai } from './openai';
import { WorkoutSheet, InsightData, Exercise } from '../context/WorkoutContext';

const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
};

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
            model: "deepseek/deepseek-v4-flash",
            messages: [
                { role: "system", content: "Você é um assistente fitness fornecendo output JSON ESTRITO e limpo." },
                { role: "user", content: prompt }
            ],
        });

        const content = response.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(cleanJson(content)) as InsightData;
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
            model: "deepseek/deepseek-v4-flash",
            messages: [
                { role: "system", content: "Você é um assistente fitness fornecendo output JSON ESTRITO e limpo." },
                { role: "user", content: prompt }
            ],
        });

        const content = response.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(cleanJson(content)) as ExerciseSubstitution;
            return parsed;
        }
        return null;
    } catch (e) {
        console.error("Error generating substitution:", e);
        return null;
    }
}

export type GeneratedWorkout = {
    title: string;
    exercises: Omit<Exercise, 'id'>[];
};

export async function generateWorkoutFromPrompt(userPrompt: string): Promise<GeneratedWorkout[] | null> {
    try {
        const prompt = `Você é um Personal Trainer atuando como uma Inteligência Artificial.
O usuário enviou a seguinte solicitação para criar uma nova rotina de treinos:
"${userPrompt}"

Sua missão é criar uma ou mais fichas de treino perfeitamente estruturadas para atender ao objetivo e às restrições do usuário.
Devolva ESTRITAMENTE um objeto JSON neste formato, com as chaves em inglês:

{
  "workouts": [
    {
      "title": "Nome da Ficha (Ex: Ficha A - Peito e Tríceps)",
      "exercises": [
        { "name": "Nome do Exercício", "sets": "Séries", "reps": "Repetições (Ex: 8-12)", "weight": "", "notes": "Notas ou descanso" }
      ]
    }
  ]
}

- Em "weight" você pode deixar vazio ou colocar uma sugestão de intensidade se fizer sentido, mas prefira deixar vazio caso não conheça a força do usuário.
- Inclua aquecimentos adequados se achar necessário nas notas.`;

        const response = await openai.chat.completions.create({
            model: "deepseek/deepseek-v4-flash",
            messages: [
                { role: "system", content: "Você é um personal trainer altamente qualificado. Retorne APENAS um JSON estrito, sem textos explicativos." },
                { role: "user", content: prompt }
            ],
        });

        const content = response.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(cleanJson(content));
            return parsed.workouts as GeneratedWorkout[];
        }
        return null;
    } catch (e) {
        console.error("Error generating workout from prompt:", e);
        return null;
    }
}

export async function chatWithTrainer(messages: {role: 'user' | 'assistant', content: string}[]): Promise<string | null> {
    try {
        const systemPrompt = `Você é um Personal Trainer Sênior com mais de 15 anos de experiência prática de salão, atuando como o especialista oficial do app.
Sua especialidade envolve: Biomecânica avançada, Periodização para Hipertrofia e Força, Fisiologia do Exercício e Emagrecimento.
Seu tom de voz deve ser:
- Motivador e Enérgico (chame o usuário de "guerreiro(a)", "campeão", ou trate com respeito profissional mas próximo).
- Direto e sem enrolação (não mande testamentos enormes, o usuário está lendo no celular no meio do treino).
- Embasado cientificamente, mas com tradução prática (cite o "porquê", mas dê a solução real).
- Se a dúvida for sobre dor: recomende sempre procurar um médico/fisioterapeuta, mas sugira modificações imediatas no treino (ex: trocar barra por halteres, mudar ângulos).
- Se a dúvida for sobre dietas: dê dicas super gerais e lembre-os de ir num Nutri.
- Limite as respostas a 2 ou 3 parágrafos curtos. Sem blábláblá. Responda à dúvida principal imediatamente. Formate com negritos e emojis estratégicos.`;

        const response = await openai.chat.completions.create({
            model: "deepseek/deepseek-v4-flash",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ]
        });

        return response.choices[0].message?.content || null;
    } catch (e) {
        console.error("Error in chatWithTrainer:", e);
        return null;
    }
}
