import { TemplateConfig } from '../types';

export const templates: TemplateConfig[] = [
  // Technology Templates (5+)
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    industry: 'technology',
    color: 'from-blue-500 to-cyan-500',
    supportsProfilePic: true,
    description: 'Clean, modern template perfect for software engineers and tech professionals'
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    industry: 'technology',
    color: 'from-gray-700 to-gray-900',
    supportsProfilePic: false,
    description: 'Minimalist ATS-friendly template for tech roles'
  },
  {
    id: 'tech-developer',
    name: 'Developer Pro',
    industry: 'technology',
    color: 'from-indigo-600 to-blue-600',
    supportsProfilePic: true,
    description: 'Optimized for developers and programmers with project showcase'
  },
  {
    id: 'tech-startup',
    name: 'Startup Tech',
    industry: 'technology',
    color: 'from-cyan-500 to-teal-500',
    supportsProfilePic: false,
    description: 'Dynamic template for startup and fast-paced tech environments'
  },
  {
    id: 'tech-senior',
    name: 'Senior Engineer',
    industry: 'technology',
    color: 'from-slate-700 to-blue-800',
    supportsProfilePic: true,
    description: 'Professional template emphasizing technical leadership and experience'
  },
  {
    id: 'tech-dark-mode',
    name: 'Dark Mode',
    industry: 'technology',
    color: 'from-slate-900 to-slate-800',
    supportsProfilePic: false,
    description: 'Sleek dark theme for modern developers and night owls'
  },
  {
    id: 'tech-nature',
    name: 'Eco Tech',
    industry: 'technology',
    color: 'from-emerald-600 to-teal-500',
    supportsProfilePic: true,
    description: 'Fresh, nature-inspired palette for sustainable tech roles'
  },

  // Creative Templates (5+)
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    industry: 'creative',
    color: 'from-purple-500 to-pink-500',
    supportsProfilePic: true,
    description: 'Eye-catching template for designers, marketers, and creative professionals'
  },
  {
    id: 'creative-elegant',
    name: 'Creative Elegant',
    industry: 'creative',
    color: 'from-rose-400 to-orange-400',
    supportsProfilePic: true,
    description: 'Sophisticated template with modern aesthetics'
  },
  {
    id: 'creative-portfolio',
    name: 'Portfolio Showcase',
    industry: 'creative',
    color: 'from-fuchsia-500 to-purple-600',
    supportsProfilePic: true,
    description: 'Perfect for showcasing creative work and design projects'
  },
  {
    id: 'creative-artistic',
    name: 'Artistic Vision',
    industry: 'creative',
    color: 'from-pink-400 to-rose-500',
    supportsProfilePic: true,
    description: 'Expressive template for artists and visual designers'
  },
  {
    id: 'creative-minimalist',
    name: 'Creative Minimalist',
    industry: 'creative',
    color: 'from-amber-500 to-pink-400',
    supportsProfilePic: false,
    description: 'Clean design letting your creative work speak for itself'
  },

  // Business Templates (5+)
  {
    id: 'business-professional',
    name: 'Business Professional',
    industry: 'business',
    color: 'from-slate-600 to-slate-800',
    supportsProfilePic: true,
    description: 'Classic professional template for business roles'
  },
  {
    id: 'business-executive',
    name: 'Business Executive',
    industry: 'business',
    color: 'from-blue-800 to-indigo-900',
    supportsProfilePic: false,
    description: 'Executive-level template emphasizing experience'
  },
  {
    id: 'business-corporate',
    name: 'Corporate Elite',
    industry: 'business',
    color: 'from-gray-800 to-slate-900',
    supportsProfilePic: true,
    description: 'Premium corporate template for senior management'
  },
  {
    id: 'business-consultant',
    name: 'Consultant Pro',
    industry: 'business',
    color: 'from-blue-700 to-slate-700',
    supportsProfilePic: false,
    description: 'Strategic template for consultants and business advisors'
  },
  {
    id: 'business-manager',
    name: 'Modern Manager',
    industry: 'business',
    color: 'from-indigo-700 to-blue-700',
    supportsProfilePic: true,
    description: 'Contemporary template for business managers and team leads'
  },

  // Healthcare Templates (5+)
  {
    id: 'healthcare-clean',
    name: 'Healthcare Clean',
    industry: 'healthcare',
    color: 'from-teal-500 to-emerald-500',
    supportsProfilePic: true,
    description: 'Professional template for healthcare professionals'
  },
  {
    id: 'healthcare-modern',
    name: 'Healthcare Modern',
    industry: 'healthcare',
    color: 'from-green-600 to-teal-600',
    supportsProfilePic: false,
    description: 'Modern, clean layout for medical professionals'
  },
  {
    id: 'healthcare-medical',
    name: 'Medical Professional',
    industry: 'healthcare',
    color: 'from-blue-600 to-teal-600',
    supportsProfilePic: true,
    description: 'Trusted template for doctors and medical specialists'
  },
  {
    id: 'healthcare-nurse',
    name: 'Nursing Care',
    industry: 'healthcare',
    color: 'from-emerald-500 to-green-500',
    supportsProfilePic: true,
    description: 'Caring template designed for nursing professionals'
  },
  {
    id: 'healthcare-clinical',
    name: 'Clinical Excellence',
    industry: 'healthcare',
    color: 'from-teal-600 to-cyan-600',
    supportsProfilePic: false,
    description: 'Professional template for clinical and research roles'
  },

  // Education Templates (5+)
  {
    id: 'education-academic',
    name: 'Academic',
    industry: 'education',
    color: 'from-amber-600 to-orange-600',
    supportsProfilePic: true,
    description: 'Traditional academic template for educators and researchers'
  },
  {
    id: 'education-modern',
    name: 'Education Modern',
    industry: 'education',
    color: 'from-yellow-500 to-amber-500',
    supportsProfilePic: false,
    description: 'Contemporary template for teaching professionals'
  },
  {
    id: 'education-professor',
    name: 'Professor',
    industry: 'education',
    color: 'from-orange-600 to-red-600',
    supportsProfilePic: true,
    description: 'Distinguished template for university professors and lecturers'
  },
  {
    id: 'education-teacher',
    name: 'Inspiring Teacher',
    industry: 'education',
    color: 'from-amber-500 to-yellow-600',
    supportsProfilePic: true,
    description: 'Warm template for K-12 and primary educators'
  },
  {
    id: 'education-administrator',
    name: 'Education Leader',
    industry: 'education',
    color: 'from-orange-700 to-amber-700',
    supportsProfilePic: false,
    description: 'Professional template for school administrators and principals'
  },

  // Sales Templates (5+)
  {
    id: 'sales-dynamic',
    name: 'Sales Dynamic',
    industry: 'sales',
    color: 'from-red-500 to-rose-500',
    supportsProfilePic: true,
    description: 'Energetic template for sales and business development roles'
  },
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    industry: 'sales',
    color: 'from-rose-600 to-red-600',
    supportsProfilePic: true,
    description: 'High-impact template for sales leaders and executives'
  },
  {
    id: 'sales-marketing',
    name: 'Marketing Pro',
    industry: 'sales',
    color: 'from-pink-500 to-rose-500',
    supportsProfilePic: false,
    description: 'Strategic template for marketing and growth professionals'
  },
  {
    id: 'sales-account',
    name: 'Account Manager',
    industry: 'sales',
    color: 'from-red-600 to-orange-600',
    supportsProfilePic: true,
    description: 'Relationship-focused template for account management'
  },
  {
    id: 'sales-business-dev',
    name: 'Business Development',
    industry: 'sales',
    color: 'from-orange-500 to-red-500',
    supportsProfilePic: false,
    description: 'Growth-oriented template for BD and partnership roles'
  },

  // Finance Templates (5+)
  {
    id: 'finance-corporate',
    name: 'Finance Corporate',
    industry: 'finance',
    color: 'from-emerald-700 to-teal-700',
    supportsProfilePic: false,
    description: 'Conservative template for finance and banking professionals'
  },
  {
    id: 'finance-analyst',
    name: 'Financial Analyst',
    industry: 'finance',
    color: 'from-green-700 to-emerald-700',
    supportsProfilePic: true,
    description: 'Professional template for financial analysts and planners'
  },
  {
    id: 'finance-investment',
    name: 'Investment Banking',
    industry: 'finance',
    color: 'from-slate-800 to-emerald-800',
    supportsProfilePic: false,
    description: 'Premium template for investment banking professionals'
  },
  {
    id: 'finance-accounting',
    name: 'Accounting Professional',
    industry: 'finance',
    color: 'from-teal-700 to-green-700',
    supportsProfilePic: true,
    description: 'Trusted template for accountants and auditors'
  },
  {
    id: 'finance-wealth',
    name: 'Wealth Management',
    industry: 'finance',
    color: 'from-emerald-800 to-teal-800',
    supportsProfilePic: true,
    description: 'Sophisticated template for wealth advisors and portfolio managers'
  },
  {
    id: 'custom',
    name: 'Preserved Original',
    industry: 'all',
    color: 'from-gray-600 to-gray-800',
    supportsProfilePic: true,
    description: 'This layout preserves the estimated colors and styling of your original resume.'
  }
];

export const industries = [
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'creative', name: 'Creative & Design', icon: '🎨' },
  { id: 'business', name: 'Business & Management', icon: '💼' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'sales', name: 'Sales & Marketing', icon: '📈' },
  { id: 'finance', name: 'Finance & Banking', icon: '💰' },
  { id: 'all', name: 'All Templates', icon: '📄' }
];

export function getTemplatesByIndustry(industry: string): TemplateConfig[] {
  if (industry === 'all') {
    return templates;
  }
  return templates.filter(t => t.industry === industry);
}

export function getTemplate(id: string): TemplateConfig | undefined {
  return templates.find(t => t.id === id);
}
