export const jobDescriptions: Record<string, string[]> = {
  'software engineer': [
    'Developed and maintained scalable web applications using React, Node.js, and PostgreSQL, serving 500K+ users',
    'Implemented CI/CD pipelines using Jenkins and Docker, reducing deployment time by 60%',
    'Collaborated with cross-functional teams to design and implement new features',
    'Optimized database queries and API endpoints, improving application performance by 45%',
    'Mentored junior developers and conducted code reviews to maintain code quality',
    'Wrote comprehensive unit and integration tests achieving 90% code coverage'
  ],
  'senior software engineer': [
    'Led architecture design and implementation of microservices-based platform serving 2M+ users',
    'Managed team of 5 engineers, conducting sprint planning, code reviews, and performance evaluations',
    'Spearheaded migration from monolithic to microservices architecture, improving scalability by 300%',
    'Established coding standards and best practices, reducing technical debt by 40%',
    'Collaborated with stakeholders to define technical requirements and product roadmap',
    'Implemented monitoring and alerting systems, reducing production incidents by 70%'
  ],
  'frontend developer': [
    'Built responsive and accessible user interfaces using React, TypeScript, and Tailwind CSS',
    'Implemented state management solutions using Redux and Context API',
    'Optimized web performance achieving 95+ Lighthouse scores across all metrics',
    'Collaborated with UX designers to translate wireframes into pixel-perfect implementations',
    'Integrated RESTful APIs and GraphQL endpoints for seamless data flow',
    'Conducted A/B testing and user research to improve user experience'
  ],
  'backend developer': [
    'Designed and implemented RESTful APIs using Node.js/Express serving 1M+ requests daily',
    'Architected scalable database schemas in PostgreSQL and MongoDB',
    'Implemented authentication and authorization using JWT and OAuth 2.0',
    'Optimized database queries and implemented caching strategies, reducing response time by 50%',
    'Integrated third-party APIs and payment gateways (Stripe, PayPal)',
    'Implemented automated testing and monitoring for 99.9% uptime'
  ],
  'full stack developer': [
    'Developed end-to-end web applications using MERN stack (MongoDB, Express, React, Node.js)',
    'Designed and implemented RESTful APIs and real-time features using WebSockets',
    'Built responsive frontends with React, Redux, and Material-UI/Tailwind CSS',
    'Managed cloud infrastructure on AWS (EC2, S3, RDS, Lambda)',
    'Implemented CI/CD pipelines and automated testing strategies',
    'Collaborated with product managers and designers throughout development lifecycle'
  ],
  'data scientist': [
    'Developed machine learning models achieving 92% accuracy for predictive analytics',
    'Analyzed large datasets using Python, Pandas, NumPy, and SQL to extract actionable insights',
    'Built data pipelines and ETL processes to automate data collection and preprocessing',
    'Created interactive dashboards using Tableau and Power BI for stakeholder reporting',
    'Implemented A/B testing frameworks to measure impact of product changes',
    'Collaborated with engineering teams to deploy ML models into production'
  ],
  'data analyst': [
    'Analyzed business metrics and KPIs to identify trends and growth opportunities',
    'Created comprehensive reports and dashboards using SQL, Python, and Tableau',
    'Conducted statistical analysis and hypothesis testing to support business decisions',
    'Collaborated with stakeholders to define metrics and tracking requirements',
    'Automated data collection and reporting processes, saving 20 hours per week',
    'Presented findings to executive leadership, influencing strategic initiatives'
  ],
  'product manager': [
    'Defined product vision and roadmap for B2B SaaS platform serving 10K+ customers',
    'Conducted user research and competitive analysis to identify market opportunities',
    'Prioritized features and managed backlog using agile methodologies (Scrum/Kanban)',
    'Collaborated with engineering, design, and marketing teams to launch 15+ features',
    'Analyzed product metrics and user feedback to iterate and improve user experience',
    'Led cross-functional teams through complete product development lifecycle'
  ],
  'project manager': [
    'Managed multiple concurrent projects with budgets up to $2M and teams of 20+ members',
    'Developed project plans, timelines, and resource allocations using Jira and MS Project',
    'Conducted risk assessments and implemented mitigation strategies',
    'Facilitated daily standups, sprint planning, and retrospectives',
    'Maintained stakeholder communication and provided regular status updates',
    'Delivered 95% of projects on time and within budget'
  ],
  'ux designer': [
    'Designed user-centered interfaces for web and mobile applications',
    'Conducted user research, usability testing, and stakeholder interviews',
    'Created wireframes, prototypes, and high-fidelity mockups using Figma',
    'Established and maintained design systems ensuring brand consistency',
    'Collaborated with developers to ensure proper implementation of designs',
    'Improved user satisfaction scores by 35% through iterative design improvements'
  ],
  'ui designer': [
    'Designed visually compelling interfaces for web and mobile platforms',
    'Created design systems and component libraries in Figma/Sketch',
    'Ensured designs met WCAG accessibility standards',
    'Collaborated with UX researchers to incorporate user feedback',
    'Produced marketing materials, icons, and illustrations',
    'Maintained brand guidelines across all digital touchpoints'
  ],
  'devops engineer': [
    'Managed AWS infrastructure supporting applications with 99.99% uptime',
    'Implemented CI/CD pipelines using Jenkins, GitLab CI, and GitHub Actions',
    'Automated infrastructure provisioning using Terraform and Ansible',
    'Configured monitoring and alerting systems using Prometheus, Grafana, and ELK stack',
    'Implemented security best practices and conducted regular security audits',
    'Reduced infrastructure costs by 40% through optimization and right-sizing'
  ],
  'marketing manager': [
    'Developed and executed marketing strategies resulting in 150% increase in leads',
    'Managed marketing budget of $500K+ across digital and traditional channels',
    'Led content marketing initiatives including blog, social media, and email campaigns',
    'Analyzed campaign performance using Google Analytics and marketing automation tools',
    'Managed team of 5 marketing specialists and external agencies',
    'Increased brand awareness by 200% through integrated marketing campaigns'
  ],
  'content writer': [
    'Created engaging content for blogs, websites, and social media platforms',
    'Researched industry trends and topics to produce relevant, SEO-optimized articles',
    'Collaborated with marketing team to align content with brand voice and strategy',
    'Edited and proofread content to ensure accuracy and quality',
    'Increased organic traffic by 120% through strategic content creation',
    'Managed content calendar and met tight deadlines consistently'
  ],
  'sales manager': [
    'Led sales team of 10 representatives, achieving 125% of annual quota',
    'Developed sales strategies and training programs to improve team performance',
    'Managed key client relationships and enterprise-level negotiations',
    'Analyzed sales metrics and forecasts to inform strategic decisions',
    'Implemented CRM system (Salesforce) improving pipeline visibility',
    'Expanded customer base by 45% through strategic prospecting and networking'
  ],
  'business analyst': [
    'Gathered and analyzed business requirements for software development projects',
    'Created detailed documentation including BRDs, user stories, and process flows',
    'Facilitated workshops with stakeholders to elicit requirements',
    'Performed gap analysis and recommended process improvements',
    'Collaborated with development teams to ensure requirements were properly implemented',
    'Conducted UAT and provided training to end users'
  ],
  'default': [
    'Collaborated with cross-functional teams to achieve organizational goals',
    'Implemented process improvements that increased efficiency and productivity',
    'Contributed to strategic planning and decision-making processes',
    'Maintained high-quality standards in all deliverables',
    'Provided training and mentorship to team members',
    'Consistently met or exceeded performance targets and KPIs'
  ]
};

export function getJobDescription(position: string): string[] {
  const normalizedPosition = position.toLowerCase().trim();

  for (const [key, descriptions] of Object.entries(jobDescriptions)) {
    if (normalizedPosition.includes(key) || key.includes(normalizedPosition)) {
      return descriptions;
    }
  }

  return jobDescriptions['default'];
}

export function generateJobDescription(position: string, _company?: string): string {
  const descriptions = getJobDescription(position);
  const selectedDescriptions = descriptions.slice(0, 4);
  return selectedDescriptions.map(desc => `• ${desc}`).join('\n');
}
