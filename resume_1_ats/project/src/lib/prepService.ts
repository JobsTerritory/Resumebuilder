import { apiCall } from './api';
import { InterviewQuestion } from './gemini';

export interface InterviewPrepData {
    _id?: string;
    user?: string;
    resume: string;
    industry: string;
    role: string;
    questions: InterviewQuestion[];
    createdAt?: string;
    updatedAt?: string;
}

export async function saveInterviewPrep(resumeId: string, industry: string, role: string, questions: InterviewQuestion[]): Promise<InterviewPrepData | null> {
    try {
        const data = await apiCall('/prep', {
            method: 'POST',
            body: JSON.stringify({
                resumeId,
                industry,
                role,
                questions
            }),
        });
        return data;
    } catch (error) {
        console.error('Error saving interview prep:', error);
        return null;
    }
}

export async function getInterviewPrep(resumeId: string): Promise<InterviewPrepData | null> {
    try {
        const data = await apiCall(`/prep/${resumeId}`);
        return data;
    } catch (error) {
        console.error('Error loading interview prep:', error);
        return null;
    }
}
