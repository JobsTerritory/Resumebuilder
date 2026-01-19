export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  profilePicture?: string;
  title?: string;
  dateOfBirth?: string;
  customFields?: { label: string; value: string; }[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string;
  technologies?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  fieldOfStudy?: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  graduationDate?: string;
  gpa?: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface Resume {
  id?: string;
  user_id?: string;
  title: string;
  personal_info: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  interests?: string[];
  internships?: Experience[];
  template: string;
  design?: string;
  industry?: string;
  additional_info?: string;
  showProfilePicture?: boolean;
  section_order?: string[];
  ai_analysis?: {
    overall_score: number;
    detailed_feedback: string[];
  };
  custom_theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: 'serif' | 'sans-serif' | 'mono';
    layout?: 'single-column' | 'two-column-sidebar' | 'timeline' | 'modern' | 'two-column';
    spacing?: 'compact' | 'comfortable' | 'airy';
  };
  detected_design?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  industry: string;
  color: string;
  supportsProfilePic: boolean;
  description: string;
}

export interface DesignConfig {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  layout: 'single-column' | 'two-column-sidebar' | 'timeline' | 'modern' | 'two-column';
  features: string[];
}

export type SectionType = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'internships';
