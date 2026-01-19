import { DesignConfig } from '../types';

export const designs: DesignConfig[] = [
    {
        id: 'sidebar-left',
        name: 'Sidebar Professional',
        description: 'Two-column layout with dark sidebar for contact, education, and skills',
        thumbnail: 'design_sidebar_left.jpg',
        layout: 'two-column-sidebar',
        features: ['Profile Picture', 'Sidebar Contact', 'Skills Section', 'Certifications']
    },
    {
        id: 'professional-clean',
        name: 'Professional Clean',
        description: 'Single column minimal design with clear sections and good spacing',
        thumbnail: 'design_professional_v2.jpg',
        layout: 'single-column',
        features: ['Profile Picture', 'Clean Layout', 'Professional', 'ATS-Friendly']
    },
    {
        id: 'sidebar-contact',
        name: 'Modern Sidebar',
        description: 'Left sidebar with personal information and core competencies',
        thumbnail: 'design_sidebar_contact.jpg',
        layout: 'two-column-sidebar',
        features: ['Circular Profile', 'Personal Info', 'Competencies', 'Technical Skills']
    },
    {
        id: 'geometric-modern',
        name: 'Geometric Modern',
        description: 'Timeline-style layout with geometric shapes and skill ratings',
        thumbnail: 'design_geometric.jpg',
        layout: 'timeline',
        features: ['Timeline View', 'Skill Ratings', 'Modern Design', 'Geometric Shapes']
    },

    {
        id: 'harvard-classic',
        name: 'Harvard Classic',
        description: 'Traditional academic layout with serif fonts and centered header',
        thumbnail: 'design_harvard.jpg',
        layout: 'single-column',
        features: ['Serif Fonts', 'Academic Style', 'Centered Header', 'Maximum Readability']
    },
    {
        id: 'modern-compact',
        name: 'Modern Compact',
        description: 'Efficient single-column layout emphasizing skills and density',
        thumbnail: 'design_compact.jpg',
        layout: 'single-column',
        features: ['High Density', 'Skills Top', 'Clean Lines', 'Tech Focused']
    },
    {
        id: 'corporate-bold',
        name: 'Corporate Bold',
        description: 'Professional layout with bold headers and clear hierarchy',
        thumbnail: 'design_corporate.jpg',
        layout: 'single-column',
        features: ['Bold Typography', 'Clear Hierarchy', 'Standard Format', 'Corporate']
    },
    {
        id: 'timeline-sidebar',
        name: 'Timeline Sidebar',
        description: 'Modern two-column layout with a visual timeline for experience',
        thumbnail: 'design_timeline.jpg',
        layout: 'two-column-sidebar',
        features: ['Visual Timeline', 'Dark Sidebar', 'Modern Icons', 'Structured']
    },
    {
        id: 'elegant-maroon',
        name: 'Elegant Maroon',
        description: 'Distinctive two-column design with rich color accents',
        thumbnail: 'design_maroon.jpg',
        layout: 'two-column-sidebar',
        features: ['Rich Colors', 'Photo Header', 'Elegant Spacing', 'Distinctive']
    }
];

export function getDesign(id: string): DesignConfig | undefined {
    return designs.find(design => design.id === id);
}

export function getDefaultDesign(): DesignConfig {
    return designs[0];
}
