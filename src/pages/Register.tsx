import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, LoaderCircle, AlertCircle } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password);
            navigate('/');
        } catch (err: any) {
            if (err instanceof FirebaseError) {
                if (err.code === 'auth/email-already-in-use') {
                    setError('Este e-mail já está em uso.');
                } else if (err.code === 'auth/invalid-email') {
                    setError('E-mail inválido.');
                } else if (err.code === 'auth/weak-password') {
                    setError('A senha fornecida é muito fraca.');
                } else {
                    setError('Erro ao criar conta.');
                }
            } else {
                setError('Um erro inesperado ocorreu.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-light/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-sm relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-light rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 mb-4 animate-fadeIn">
                        <Dumbbell className="text-white relative z-10 drop-shadow-md" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight animate-fadeIn" style={{ animationDelay: '0.1s' }}>Meu Treino</h1>
                    <p className="text-muted-foreground mt-2 font-medium tracking-wide text-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>CADASTRO DEV</p>
                </div>

                <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-xl animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-xl font-bold text-foreground mb-6 text-center">Crie sua Conta</h2>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl mb-4 flex items-center gap-3">
                            <AlertCircle size={18} className="shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Confirmar Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-light active:scale-[0.98] transition-all shadow-lg shadow-brand/20 mt-6"
                        >
                            {isLoading ? <LoaderCircle className="animate-spin" size={20} /> : 'CRIAR CONTA'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-zinc-500 text-sm">
                            Já tem uma conta?{' '}
                            <button onClick={() => navigate('/login')} className="text-brand font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">
                                Fazer Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
