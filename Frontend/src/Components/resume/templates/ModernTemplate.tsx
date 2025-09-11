import React from 'react';
interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    headline?: string;
  };
  summary: string;
  experiences: Array<{
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description?: string;
  }>;
  skills: Array<{
    name: string;
    level: string;
    category: string;
  }>;
}
interface ModernTemplateProps {
  data: ResumeData;
}
const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  const skillsByCategory = data.skills?.reduce<Record<string, string[]>>((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(`${skill.name}${skill.level ? ` (${skill.level})` : ''}`);
    return acc;
  }, {}) || {};
  return (
    <div className="bg-white p-10 font-sans text-gray-800 max-w-4xl mx-auto">
      {}
      <header className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 -mx-8 -mt-8 mb-8 rounded-b-lg shadow-sm">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-tight">{data.personalInfo.fullName}</h1>
        {data.personalInfo.headline && (
          <p className="text-xl text-blue-700 font-medium mb-4">{data.personalInfo.headline}</p>
        )}
        <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
          <a href={`mailto:${data.personalInfo.email}`} className="flex items-center hover:text-blue-600 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            {data.personalInfo.email}
          </a>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
            </svg>
            {data.personalInfo.phone}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            {data.personalInfo.location}
          </span>
          {data.personalInfo.linkedin && (
            <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          )}
          {data.personalInfo.website && (
            <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path>
              </svg>
              Website
            </a>
          )}
        </div>
      </header>
      {}
      {data.summary && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center">
            <span className="bg-blue-600 w-1 h-6 mr-2 rounded-full"></span>
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </section>
      )}
      {}
      {data.experiences?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-6 flex items-center">
            <span className="bg-blue-600 w-1 h-6 mr-2 rounded-full"></span>
            Professional Experience
          </h2>
          <div className="space-y-8">
            {data.experiences.map((exp, index) => (
              <div key={index} className="relative pl-6 border-l-2 border-blue-100">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 top-1"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                  <h3 className="text-lg font-semibold text-gray-800">{exp.position}</h3>
                  <div className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                <p className="text-md text-gray-600 font-medium mb-3">{exp.company} • {exp.location}</p>
                <ul className="space-y-2 text-gray-700">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="leading-relaxed">{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
      {}
      {data.education?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-6 flex items-center">
            <span className="bg-blue-600 w-1 h-6 mr-2 rounded-full"></span>
            Education
          </h2>
          <div className="space-y-6">
            {data.education.map((edu, index) => (
              <div key={index} className="relative pl-6 border-l-2 border-blue-100">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 top-1"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                  <h3 className="text-lg font-semibold text-gray-800">{edu.institution}</h3>
                  <div className="text-sm text-gray-500">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </div>
                </div>
                <p className="text-md text-gray-600 font-medium">{edu.degree}{edu.field && `, ${edu.field}`}</p>
                {edu.description && (
                  <p className="text-gray-600 mt-1 text-sm">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {}
      {Object.keys(skillsByCategory).length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-6 flex items-center">
            <span className="bg-blue-600 w-1 h-6 mr-2 rounded-full"></span>
            Skills & Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(skillsByCategory).map(([category, skills], index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span 
                      key={i}
                      className="inline-block bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200 shadow-sm hover:bg-blue-50 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
export default ModernTemplate;