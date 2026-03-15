import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { chatWithTrainer } from '../lib/aiInsightsService';

export type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Fala guerreiro(a)! Sou seu Personal AI. Como posso ajustar seu treino ou te ajudar hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Keep the last 10 messages for context so the token limit isn't exhausted quickly
            const contextMessages = newMessages.slice(-10);
            const aiResponse = await chatWithTrainer(contextMessages);
            
            if (aiResponse) {
                setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
            }
        } catch (error) {
            console.error("Chat error", error);
            setMessages([...newMessages, { role: 'assistant', content: 'Ops, deu ruim na conexão. Tenta de novo!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed z-[100] bottom-24 right-4 sm:right-6 lg:right-auto lg:left-[calc(50%+160px)] flex flex-col items-end">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="w-[85vw] max-w-[350px] bg-card border border-border shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-3xl mb-4 overflow-hidden flex flex-col origin-bottom-right transition-all duration-300 ease-out h-[450px] max-h-[60vh]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand to-brand-light p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight">Personal Trainer AI</h3>
                                <p className="text-[10px] text-white/70">Online agora</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                            <X size={20} className="text-white" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 hide-scrollbar scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-6 h-6 rounded-full flex shrink-0 items-center justify-center mt-auto ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-brand/20'}`}>
                                        {msg.role === 'user' ? <User size={12} className="text-zinc-400" /> : <Bot size={12} className="text-brand" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-brand text-white rounded-br-sm' 
                                            : 'bg-card border border-border/50 text-foreground rounded-bl-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="flex gap-2 max-w-[85%] flex-row">
                                    <div className="w-6 h-6 rounded-full bg-brand/20 flex shrink-0 items-center justify-center mt-auto">
                                        <Bot size={12} className="text-brand" />
                                    </div>
                                    <div className="p-3 bg-card border border-border/50 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-brand/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-brand/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-brand/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-card border-t border-border shrink-0">
                        <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1 pl-4 border border-border/50 focus-within:border-brand/50 transition-colors">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pergunte ao Treinador..."
                                className="flex-1 bg-transparent border-none text-[13px] text-foreground focus:outline-none placeholder:text-muted-foreground"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-8 h-8 rounded-full bg-brand disabled:bg-brand/50 text-white flex shrink-0 items-center justify-center transition-colors shadow-md"
                            >
                                <Send size={14} className="ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-[0_0_20px_rgba(37,95,245,0.3)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50
                    ${isOpen ? 'bg-zinc-800 text-white rotate-90 scale-90 opacity-0 pointer-events-none' : 'bg-brand text-white rotate-0 opacity-100'}`}
            >
                <div className="relative">
                    <MessageCircle size={24} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
            </button>
        </div>
    );
}
