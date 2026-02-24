import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export type Exercise = {
    id: string;
    name: string;
    sets: number | string;
    reps: string;
    weight?: string;
    notes?: string;
};

export type WorkoutHistoryLog = {
    id: string;
    title: string;
    date: string;
    pdfUrl?: string;
    pdfName?: string;
    groupId?: string;
};

export type InsightData = {
    totalVolume: string;
    muscleDistribution: Record<string, number>;
    classification: string;
    issuesDetected: string[];
    historicalComparison: string;
    coachTips: string[];
    estimatedRPE?: string;
    exerciseDiversity?: string;
    periodizationTip?: string;
};

export type WorkoutSheet = {
    id: string;
    title: string;
    createdAt: string;
    exercises: Exercise[];
    isActive: boolean;
    groupId?: string;
    pdfUrl?: string;
    pdfName?: string;
    insights?: InsightData;
    userId?: string;
};

interface WorkoutContextType {
    sheets: WorkoutSheet[];
    historyLogs: WorkoutHistoryLog[];
    addSheet: (sheet: Omit<WorkoutSheet, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean; groupId?: string }) => Promise<void>;
    deleteSheet: (id: string) => Promise<void>;
    setActiveSheet: (id: string) => Promise<void>;
    updateSheet: (id: string, updates: Partial<WorkoutSheet>) => Promise<void>;
    addHistoryLog: (title: string, pdfUrl?: string, pdfName?: string, groupId?: string) => Promise<void>;
    updateHistoryLog: (id: string, updates: Partial<WorkoutHistoryLog>) => Promise<void>;
    activeSheet: WorkoutSheet | undefined;
    isLoading: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
    const [sheets, setSheets] = useState<WorkoutSheet[]>([]);
    const [historyLogs, setHistoryLogs] = useState<WorkoutHistoryLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return; // Segurança, pois o componente condicional já protege isso

        let isResolved = false;

        // Script de migração fantasma: varre todos e atualiza o userId onde está nulo.
        const runMigration = async () => {
            try {
                const sheetsSnapshot = await getDocs(collection(db, 'workoutSheets'));
                const historySnapshot = await getDocs(collection(db, 'workoutHistory'));
                const batch = writeBatch(db);
                let count = 0;

                sheetsSnapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data();
                    if (!data.userId) {
                        batch.update(docSnapshot.ref, { userId: user.uid });
                        count++;
                    }
                });

                historySnapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data();
                    if (!data.userId) {
                        batch.update(docSnapshot.ref, { userId: user.uid });
                        count++;
                    }
                });

                if (count > 0) {
                    await batch.commit();
                    console.log(`Migração concluída: ${count} documentos transferidos.`);
                }
            } catch (err) {
                console.error("Erro na migração de documentos: ", err);
            }
        };

        // Roda migração uma vez por mount para o usuário atrelado
        runMigration();

        // Evitando orderBy(createdAt) junto com where(userId) pelo index inexistente no Firestore original
        const qSheets = query(collection(db, 'workoutSheets'), where("userId", "==", user.uid));
        const unsubscribeSheets = onSnapshot(qSheets, (snapshot) => {
            isResolved = true;
            const sheetsData: WorkoutSheet[] = [];
            snapshot.forEach((docSnapshot) => {
                sheetsData.push({ id: docSnapshot.id, ...docSnapshot.data() } as WorkoutSheet);
            });
            sheetsData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setSheets(sheetsData);
            setIsLoading(false);
        }, (error) => {
            isResolved = true;
            console.error("Error fetching sheets", error);
            setIsLoading(false);
        });

        const qHistory = query(collection(db, 'workoutHistory'), where("userId", "==", user.uid));
        const unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
            const historyData: WorkoutHistoryLog[] = [];
            snapshot.forEach((docSnapshot) => {
                historyData.push({ id: docSnapshot.id, ...docSnapshot.data() } as WorkoutHistoryLog);
            });
            historyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setHistoryLogs(historyData);
        }, (error) => {
            console.error("Error fetching history", error);
        });

        const timeoutId = setTimeout(() => {
            if (!isResolved) {
                console.warn("Firestore connection is taking too long.");
                setIsLoading(false);
            }
        }, 5000);

        return () => {
            unsubscribeSheets();
            unsubscribeHistory();
            clearTimeout(timeoutId);
        };
    }, [user]);

    const addSheet = async (sheetData: Omit<WorkoutSheet, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean; groupId?: string; pdfUrl?: string; pdfName?: string; }) => {
        if (!user) return;
        try {
            const newSheet = {
                ...sheetData,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                isActive: sheetData.isActive !== undefined ? sheetData.isActive : sheets.length === 0,
            };
            await addDoc(collection(db, 'workoutSheets'), newSheet);
        } catch (error) {
            console.error("Error adding document", error);
        }
    };

    const deleteSheet = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'workoutSheets', id));
        } catch (error) {
            console.error("Error deleting document", error);
        }
    };

    const updateSheet = async (id: string, updates: Partial<WorkoutSheet>) => {
        try {
            await updateDoc(doc(db, 'workoutSheets', id), updates);
        } catch (error) {
            console.error("Error updating document", error);
        }
    };

    const addHistoryLog = async (title: string, pdfUrl?: string, pdfName?: string, groupId?: string) => {
        if (!user) return;
        try {
            const data: any = {
                title,
                userId: user.uid,
                date: new Date().toISOString(),
            };
            if (pdfUrl) data.pdfUrl = pdfUrl;
            if (pdfName) data.pdfName = pdfName;
            if (groupId) data.groupId = groupId;

            await addDoc(collection(db, 'workoutHistory'), data);
        } catch (error) {
            console.error("Error adding history log", error);
        }
    };

    const updateHistoryLog = async (id: string, updates: Partial<WorkoutHistoryLog>) => {
        try {
            await updateDoc(doc(db, 'workoutHistory', id), updates);
        } catch (error) {
            console.error("Error updating history log", error);
        }
    };

    const setActiveSheet = async (id: string) => {
        try {
            // Unset previous active sheet
            const currentActive = sheets.find(s => s.isActive);
            if (currentActive && currentActive.id !== id) {
                await updateDoc(doc(db, 'workoutSheets', currentActive.id), { isActive: false });
            }
            // Set new active sheet
            if (id) {
                await updateDoc(doc(db, 'workoutSheets', id), { isActive: true });
            }
        } catch (error) {
            console.error("Error setting active sheet", error);
        }
    };

    const activeSheet = sheets.find(s => s.isActive);

    return (
        <WorkoutContext.Provider value={{ sheets, historyLogs, addSheet, deleteSheet, setActiveSheet, updateSheet, addHistoryLog, updateHistoryLog, activeSheet, isLoading }}>
            {children}
        </WorkoutContext.Provider>
    );
};

export const useWorkouts = () => {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error("useWorkouts must be used within a WorkoutProvider");
    }
    return context;
};
