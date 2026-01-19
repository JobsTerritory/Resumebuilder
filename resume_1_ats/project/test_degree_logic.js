
const ACADEMIC_EXPANSION_MAP = {
  'MBA': 'Master of Business Administration',
  'PGDM': 'Post Graduate Diploma in Management',
  'PGPM': 'Post Graduate Program in Management',
  'BMS': 'Bachelor of Management Studies',
  'BBA': 'Bachelor of Business Administration',
  'BCA': 'Bachelor of Computer Applications',
  'MCA': 'Master of Computer Applications',
  'BCOM': 'Bachelor of Commerce',
  'MCOM': 'Master of Commerce',
  'BSC': 'Bachelor of Science',
  'MSC': 'Master of Science',
  'BE': 'Bachelor of Engineering',
  'ME': 'Master of Engineering',
  'BTECH': 'Bachelor of Technology',
  'MTECH': 'Master of Technology',
  'HSC': 'Higher Secondary Certificate (12th)',
  'SSC': 'Secondary School Certificate (10th)',
  'PHD': 'Doctor of Philosophy',
  'BDS': 'Bachelor of Dental Surgery',
  'MBBS': 'Bachelor of Medicine, Bachelor of Surgery',
  'MS': 'Master of Science',
  'MA': 'Master of Arts',
  'BS': 'Bachelor of Science',
  'BA': 'Bachelor of Arts',
  'BFA': 'Bachelor of Fine Arts',
  'MFA': 'Master of Fine Arts',
  'LLB': 'Bachelor of Laws',
  'LLM': 'Master of Laws'
};

function expandDegree(degree) {
  if (!degree) return '';
  
  // Handle specializations like PGPM(HR) or BMS(HR)
  const specMatch = degree.match(/^([^(]+)\(([^)]+)\)$/);
  if (specMatch) {
    const base = specMatch[1].trim();
    const spec = specMatch[2].trim();
    const normalizedBase = base.toUpperCase().replace(/\./g, '');
    const expandedBase = ACADEMIC_EXPANSION_MAP[normalizedBase] || base;
    return `${expandedBase} (${spec})`;
  }

  const normalized = degree.toUpperCase().replace(/\./g, '');
  return ACADEMIC_EXPANSION_MAP[normalized] || degree;
}

const testCases = [
  'PGPM(HR)',
  'BMS(HR)',
  'MBA',
  'HSC',
  'SSC',
  'B.Tech(CSE)',
  'M.S.',
  'B.Com',
  'M.A.',
  'B.E. (Mechanical)',
  'Some Random Degree'
];

testCases.forEach(tc => {
  console.log(`${tc} => ${expandDegree(tc)}`);
});
