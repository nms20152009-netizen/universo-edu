export interface Task {
    _id: string;
    type: 'task' | 'notice';
    title: string;
    content: string;
    description?: string;
    subject?: string;
    learningObjective?: string;
    instructions?: {
        step: number;
        text: string;
    }[];
    materials?: string[];
    duration?: number;
    difficulty?: 'básico' | 'intermedio';
    isCollaborative?: boolean;
    publishDate: string;
    isPublished: boolean;
    status: 'draft' | 'scheduled' | 'published';
    weekNumber?: number;
    multimedia?: {
        type: 'youtube' | 'image' | 'file';
        url: string;
        title?: string;
    }[];
    createdBy?: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'student' | 'teacher';
}
