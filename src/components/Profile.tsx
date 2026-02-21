
import { User, Settings, Award, ChevronRight, Activity, LogOut, Moon, Sun } from 'lucide-react';

const Profile = ({ isDarkMode, toggleTheme }: { isDarkMode: boolean, toggleTheme: () => void }) => {
    return (
        <div className="flex flex-col h-full bg-background text-foreground p-6">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold font-sans">Perfil</h1>
                <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                    <Settings className="w-5 h-5 text-zinc-400" />
                </div>
            </header>

            <div className="flex items-center gap-4 mb-8 bg-card border border-border p-4 rounded-3xl">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand to-brand-light p-1 shadow-lg shadow-brand/20">
                    <div className="w-full h-full bg-card rounded-full overflow-hidden flex items-center justify-center border-2 border-background">
                        <User className="w-10 h-10 text-zinc-300" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold">Gabriel B.</h2>
                    <p className="text-sm text-zinc-500">Membro desde Fev 2026</p>
                    <div className="flex items-center gap-1 text-brand mt-1 bg-brand/10 inline-flex px-2 py-0.5 rounded-full text-xs font-bold">
                        <Award className="w-3 h-3" />
                        <span>Atleta Dedicado</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold">0</span>
                    <span className="text-xs text-zinc-500">Treinos no Mês</span>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold">0</span>
                    <span className="text-xs text-zinc-500">Amigos Conectados</span>
                </div>
            </div>

            <h2 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Ajustes</h2>

            <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
                <div
                    onClick={toggleTheme}
                    className="flex flex-col items-center flex-1 text-zinc-500 hover:text-brand cursor-pointer transition-colors p-4 flex items-center justify-between border-b border-border active:bg-muted"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {isDarkMode ? <Sun className="w-4 h-4 text-zinc-400" /> : <Moon className="w-4 h-4 text-zinc-400" />}
                        </div>
                        <span className="font-medium text-sm">Aparência</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">{isDarkMode ? 'Escuro' : 'Claro'}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-300" />
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-muted transition-colors cursor-pointer border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Award className="w-4 h-4 text-zinc-400" />
                        </div>
                        <span className="font-medium text-sm">Metas e Conquistas</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                </div>

                <div className="p-4 flex flex-col justify-start hover:bg-muted transition-colors cursor-pointer active:bg-red-500/10 active:text-red-500 text-red-500">
                    <div className="flex items-center gap-3 font-medium text-sm">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <LogOut className="w-4 h-4 text-red-500" />
                        </div>
                        Sair da Conta
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-zinc-500 mt-4 mb-12">Antigravity Beta v1.0</p>
            <div className="h-6"></div> {/* Bottom padding */}
        </div>
    );
};

export default Profile;
