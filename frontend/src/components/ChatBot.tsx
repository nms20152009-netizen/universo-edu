import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { chatService } from '../services/api';
import './ChatBot.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface TaskContext {
    title: string;
    content: string;
    subject: string;
    instructions?: { text: string }[];
}

interface ChatBotProps {
    subject?: string;
    onClose?: () => void;
    initialMessage?: string;
    taskContext?: TaskContext;
}

export function ChatBot({ subject = 'General', onClose, initialMessage, taskContext }: ChatBotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasAutoSent, setHasAutoSent] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize chat session
    useEffect(() => {
        const initSession = async () => {
            try {
                // If we have task context, always start fresh to avoid confusion
                if (taskContext) {
                    const response = await chatService.createSession(subject);
                    setSessionId(response.sessionId);
                    setMessages([{
                        role: 'assistant',
                        content: `¡Hola! 👋 Veo que necesitas ayuda con **"${taskContext.title}"**. ¡Con gusto te explico paso a paso lo que debes hacer! 📚`
                    }]);
                    localStorage.setItem('universo_chat_session', JSON.stringify({ sessionId: response.sessionId }));
                    return;
                }

                const existingSession = localStorage.getItem('universo_chat_session');
                if (existingSession) {
                    const { sessionId: storedId } = JSON.parse(existingSession);
                    const history = await chatService.getHistory(storedId);
                    if (history.success) {
                        setSessionId(storedId);
                        setMessages(history.messages || []);
                        return;
                    }
                }

                // Create new session
                const response = await chatService.createSession(subject);
                setSessionId(response.sessionId);
                setMessages(response.messages || []);
                localStorage.setItem('universo_chat_session', JSON.stringify({ sessionId: response.sessionId }));
            } catch (err) {
                console.error('Failed to initialize session:', err);
                setMessages([{
                    role: 'assistant',
                    content: taskContext
                        ? `¡Hola! 👋 Veo que necesitas ayuda con tu tarea "${taskContext.title}". ¡Pregúntame lo que no entiendas!`
                        : '¡Hola! 👋 Soy EDU, tu compañero de aprendizaje. ¿En qué te puedo ayudar hoy?'
                }]);
            }
        };

        initSession();
    }, [subject, taskContext]);

    // Auto-send initial message when we have task context
    useEffect(() => {
        const autoSendTaskQuestion = async () => {
            if (initialMessage && sessionId && !hasAutoSent && messages.length > 0) {
                setHasAutoSent(true);

                // Add a small delay so user sees the flow
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Add the auto-generated question as user message
                setMessages(prev => [...prev, { role: 'user', content: initialMessage }]);
                setIsLoading(true);

                try {
                    // Create enhanced message with task context for the AI
                    let enhancedMessage = initialMessage;
                    if (taskContext) {
                        enhancedMessage = `[CONTEXTO DE TAREA PARA EL ASISTENTE - Ayuda a un niño de 12 años de 6to grado a entender esta tarea para hacer en su cuaderno]

Título de la tarea: ${taskContext.title}
Materia: ${taskContext.subject}
Contenido: ${taskContext.content?.replace(/<[^>]*>/g, '').substring(0, 500)}
${taskContext.instructions ? `Pasos: ${taskContext.instructions.map((i, idx) => `${idx + 1}. ${i.text}`).join(' | ')}` : ''}

Explica de forma clara y sencilla qué debe hacer el estudiante en su cuaderno para completar esta tarea. Usa lenguaje apropiado para un niño de 12 años.`;
                    }

                    const response = await chatService.sendMessage(sessionId, enhancedMessage, subject);

                    if (response.success) {
                        setSessionId(response.sessionId);
                        setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
                    }
                } catch (err) {
                    console.error('Auto-send failed:', err);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: '¡Claro que te ayudo! 📝 Primero cuéntame, ¿qué parte de la tarea te confunde más?'
                    }]);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        autoSendTaskQuestion();
    }, [initialMessage, sessionId, hasAutoSent, messages.length, taskContext, subject]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setError(null);

        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatService.sendMessage(sessionId || '', userMessage, subject);

            if (response.success) {
                setSessionId(response.sessionId);
                setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
                localStorage.setItem('universo_chat_session', JSON.stringify({ sessionId: response.sessionId }));
            } else {
                throw new Error(response.error || 'Error al enviar mensaje');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor';
            setError(errorMessage);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '😔 Lo siento, tuve un problema. ¿Puedes intentar de nuevo?'
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleNewChat = () => {
        localStorage.removeItem('universo_chat_session');
        setSessionId(null);
        setHasAutoSent(false);
        setMessages([{
            role: 'assistant',
            content: '¡Hola! 👋 Soy EDU, tu compañero de aprendizaje. ¿En qué te puedo ayudar hoy?'
        }]);
    };

    return (
        <div className="chatbot">
            <div className="chatbot-header">
                <div className="chatbot-header-info">
                    <span className="chatbot-avatar">🤖</span>
                    <div>
                        <h3 className="chatbot-title">EDU - Tu Asistente</h3>
                        <span className="chatbot-status">
                            <span className="status-dot"></span>
                            {taskContext ? `Ayudándote con: ${taskContext.title.substring(0, 20)}...` : 'En línea'}
                        </span>
                    </div>
                </div>
                <div className="chatbot-header-actions">
                    <button className="btn-icon" onClick={handleNewChat} title="Nueva conversación">
                        🔄
                    </button>
                    {onClose && (
                        <button className="btn-icon" onClick={onClose} title="Cerrar">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="chatbot-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
                    >
                        {message.role === 'assistant' && <span className="bubble-avatar">🤖</span>}
                        <div className="bubble-content">
                            {message.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="chat-bubble chat-bubble-assistant">
                        <span className="bubble-avatar">🤖</span>
                        <div className="bubble-content typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="chat-error">
                        ⚠️ {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form className="chatbot-input-area" onSubmit={handleSubmit}>
                <textarea
                    ref={inputRef}
                    className="chatbot-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={taskContext ? "Pregunta lo que no entiendas de la tarea..." : "Escribe tu pregunta aquí..."}
                    disabled={isLoading}
                    rows={1}
                />
                <button
                    type="submit"
                    className="chatbot-send-btn"
                    disabled={!inputValue.trim() || isLoading}
                >
                    {isLoading ? '⏳' : '📤'}
                </button>
            </form>
        </div>
    );
};

export default ChatBot;
