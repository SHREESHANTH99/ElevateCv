import React from "react";
import type { ResumeData } from "../../../types/resume";
interface PDFTemplateProps {
  data: ResumeData;
}
const PDFTemplate: React.FC<PDFTemplateProps> = ({ data }) => {
  const skillsByCategory =
    data.skills?.reduce<Record<string, string[]>>((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(
        `${skill.name}${skill.level ? ` (${skill.level})` : ""}`,
      );
      return acc;
    }, {}) || {};
  return (
    <div
      className="p-8 text-gray-800"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <header className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold mb-1">
          {data.personalInfo.fullName}
        </h1>
        {data.personalInfo.headline && (
          <p className="text-lg text-blue-700 font-medium mb-4">
            {data.personalInfo.headline}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <a
            href={`mailto:${data.personalInfo.email}`}
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <span className="mr-1">📧</span>
            {data.personalInfo.email}
          </a>
          <a
            href={`tel:${data.personalInfo.phone}`}
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <span className="mr-1">📱</span>
            {data.personalInfo.phone}
          </a>
          <div className="flex items-center">
            <span className="mr-1">📍</span>
            {data.personalInfo.location}
          </div>
          {data.personalInfo.linkedin && (
            <a
              href={data.personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span className="mr-1">🔗</span>
              LinkedIn
            </a>
          )}
          {data.personalInfo.website && (
            <div className="flex items-center text-blue-600">
              <span className="mr-1">🌐</span>
              Website
            </div>
          )}
        </div>
      </header>

      {data.summary && (
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-3">
            Professional Summary
          </h2>
          <p className="text-gray-700">{data.summary}</p>
        </section>
      )}

      {data.experiences?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-4">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {data.experiences.map((exp, index) => (
              <div key={index} className="pl-4 border-l-2 border-blue-100">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-lg font-semibold">
                    {exp.position || exp.title}
                  </h3>
                  <div className="text-sm bg-blue-50 px-2 py-1 rounded text-blue-700">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </div>
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  {exp.company} • {exp.location}
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="leading-relaxed">
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-4">
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className="pl-4 border-l-2 border-blue-100">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold">{edu.institution}</h3>
                  <div className="text-sm text-gray-500">
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </div>
                </div>
                <p className="text-gray-600 font-medium">
                  {edu.degree}
                  {edu.field && `, ${edu.field}`}
                </p>
                {edu.description && (
                  <p className="text-gray-600 mt-1 text-sm">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(skillsByCategory).length > 0 && (
        <section>
          <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-4">
            Skills & Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(skillsByCategory).map(
              ([category, skills], index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-block bg-white px-2 py-1 rounded text-sm text-gray-700 border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
};
export default PDFTemplate;
