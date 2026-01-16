import { useLocation } from 'react-router-dom';
import ChatBot from '../components/ChatBot';
import './Chat.css';

interface TaskContext {
    title: string;
    content: string;
    subject: string;
    instructions?: { text: string }[];
}

export function Chat() {
    const location = useLocation();
    const taskContext = (location.state as { taskContext?: TaskContext })?.taskContext;

    // Create initial message if we have task context
    const getInitialMessage = () => {
        if (!taskContext) return undefined;

        let message = `Hola EDU! 👋 Necesito ayuda con una tarea de ${taskContext.subject || 'la escuela'}.\n\n`;
        message += `📝 **La tarea se llama:** "${taskContext.title}"\n\n`;

        if (taskContext.content) {
            // Get first 300 chars of content
            const cleanContent = taskContext.content.replace(/<[^>]*>/g, '').substring(0, 300);
            message += `📖 **De qué se trata:** ${cleanContent}...\n\n`;
        }

        if (taskContext.instructions && taskContext.instructions.length > 0) {
            message += `📋 **Pasos que debo seguir:**\n`;
            taskContext.instructions.forEach((inst, i) => {
                message += `${i + 1}. ${inst.text}\n`;
            });
            message += '\n';
        }

        message += `¿Me puedes explicar qué debo hacer para completar esta tarea en mi cuaderno? 🙏`;
        return message;
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-info">
                    <h1>💬 Habla con EDU</h1>
                    {taskContext ? (
                        <div className="task-help-context">
                            <h3>📚 Te estoy ayudando con:</h3>
                            <div className="task-preview">
                                <strong>{taskContext.title}</strong>
                                <span className="task-subject">{taskContext.subject}</span>
                            </div>
                            <p className="help-intro">
                                EDU ya sabe cuál es tu tarea y te va a explicar paso a paso
                                qué necesitas hacer. ¡Pregúntale lo que no entiendas!
                            </p>
                        </div>
                    ) : (
                        <>
                            <p>
                                EDU es tu asistente de aprendizaje. Pregúntale sobre cualquier tema
                                de tus materias y te ayudará a entender mejor.
                            </p>

                            <div className="chat-tips">
                                <h3>💡 Tips para aprovechar al máximo:</h3>
                                <ul>
                                    <li>Pregunta sobre lo que no entiendas de tus tareas</li>
                                    <li>Pide ejemplos para entender mejor los conceptos</li>
                                    <li>No tengas miedo de preguntar "¿por qué?"</li>
                                    <li>EDU te guiará para que encuentres las respuestas</li>
                                </ul>
                            </div>

                            <div className="chat-subjects">
                                <h3>📚 Puedo ayudarte con:</h3>
                                <div className="subject-tags">
                                    <span className="tag tag-lenguajes">📚 Lenguajes</span>
                                    <span className="tag tag-saberes">🔬 Ciencias</span>
                                    <span className="tag tag-etica">🌍 Historia</span>
                                    <span className="tag tag-humano">🤝 Convivencia</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="chat-widget">
                    <ChatBot
                        subject={taskContext?.subject || "General"}
                        initialMessage={getInitialMessage()}
                        taskContext={taskContext}
                    />
                </div>
            </div>
        </div>
    );
};

export default Chat;
