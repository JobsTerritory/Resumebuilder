import { Resume } from '../types';
import { apiCall } from './api';

export async function saveResume(resume: Resume): Promise<Resume | null> {
  try {
    const isUpdate = !!resume.id && resume.id.length > 20; // Basic check for MongoDB ObjectId length vs UUID
    const endpoint = isUpdate ? `/resumes/${resume.id}` : '/resumes';
    const method = isUpdate ? 'PUT' : 'POST';

    // Deep clone to ensure no non-serializable data
    const cleanData = JSON.parse(JSON.stringify(resume));
    delete cleanData._id; // Remove _id if it exists to avoid MongoDB conflicts on update/create

    const data = await apiCall(endpoint, {
      method,
      body: JSON.stringify(cleanData),
    });

    return {
      ...data,
      id: data._id // Map MongoDB _id to frontend id
    };
  } catch (error) {
    console.error('Error saving resume:', error);
    return null;
  }
}

export async function loadResume(id: string): Promise<Resume | null> {
  try {
    const data = await apiCall(`/resumes/${id}`);
    return {
      ...data,
      id: data._id
    };
  } catch (error) {
    console.error('Error loading resume:', error);
    return null;
  }
}

export async function loadAllResumes(): Promise<Resume[]> {
  try {
    const data = await apiCall('/resumes');
    return data.map((r: any) => ({
      ...r,
      id: r._id
    }));
  } catch (error) {
    console.error('Error loading resumes:', error);
    return [];
  }
}

export async function deleteResume(id: string): Promise<boolean> {
  try {
    await apiCall(`/resumes/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    return false;
  }
}
