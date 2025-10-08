import React from "react";
import type { ResumeData } from "../../../types/resume";
interface GraduateTemplateProps {
  data: ResumeData;
  className?: string;
  style?: React.CSSProperties;
}
const GraduateTemplate = React.forwardRef<
  HTMLDivElement,
  GraduateTemplateProps
>(({ data, className = "", style = {} }, ref) => {
  const skillsByCategory =
    data.skills?.reduce<Record<string, string[]>>((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(
        `${skill.name}${skill.level ? ` (${skill.level})` : ""}`
      );
      return acc;
    }, {}) || {};
  return (
    <div
      ref={ref}
      className={`bg-white p-8 font-sans text-gray-900 max-w-4xl mx-auto ${className}`}
      style={style}
    >

      <header className="text-center mb-8 pb-6 border-b-2 border-teal-600">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {data.personalInfo.fullName}
        </h1>
        {data.personalInfo.headline && (
          <p className="text-xl text-teal-600 mb-4 font-medium">
            {data.personalInfo.headline}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4 text-gray-700">
          <span className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-teal-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            {data.personalInfo.email}
          </span>
          {data.personalInfo.phone && (
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              {data.personalInfo.phone}
            </span>
          )}
          {data.personalInfo.location && (
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              {data.personalInfo.location}
            </span>
          )}
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">

          {data.summary && (
            <section>
              <h2 className="text-2xl font-bold text-teal-700 mb-4 pb-2 border-b border-teal-200">
                OBJECTIVE
              </h2>
              <p className="text-gray-800 leading-relaxed">{data.summary}</p>
            </section>
          )}

          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-teal-700 mb-6 pb-2 border-b border-teal-200">
                EDUCATION
              </h2>
              <div className="space-y-6">
                {data.education.map((edu, index) => (
                  <div
                    key={index}
                    className="bg-teal-50 p-6 rounded-lg border-l-4 border-teal-600"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {edu.degree}
                        </h3>
                        <p className="text-lg text-teal-700 font-semibold">
                          {edu.field}
                        </p>
                        <p className="text-gray-700">{edu.institution}</p>
                        {edu.location && (
                          <p className="text-gray-600">{edu.location}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 font-medium">
                          {edu.startDate} -{" "}
                          {edu.current ? "Present" : edu.endDate}
                        </p>
                        {edu.gpa && (
                          <p className="text-teal-600 font-bold">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                    {edu.description && (
                      <p className="text-gray-700 italic">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.projects && data.projects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-teal-700 mb-6 pb-2 border-b border-teal-200">
                ACADEMIC PROJECTS
              </h2>
              <div className="space-y-6">
                {data.projects.map((project, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {project.name}
                      </h3>
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                        {project.startDate} - {project.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div>
                          <span className="font-semibold text-gray-900 mb-2 block">
                            Technologies:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full border border-teal-200"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-teal-700 mb-6 pb-2 border-b border-teal-200">
                EXPERIENCE
              </h2>
              <div className="space-y-6">
                {data.experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {exp.title}
                        </h3>
                        <p className="text-lg text-teal-700 font-semibold">
                          {exp.company}
                        </p>
                        {exp.location && (
                          <p className="text-gray-600">{exp.location}</p>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                        {exp.startDate} -{" "}
                        {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    {exp.description && exp.description.length > 0 && (
                      <ul className="space-y-2 text-gray-800">
                        {exp.description.map((desc, descIndex) => (
                          <li key={descIndex} className="flex items-start">
                            <span className="text-teal-600 mr-3 mt-1">•</span>
                            <span className="leading-relaxed">{desc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">

          {Object.keys(skillsByCategory).length > 0 && (
            <section className="bg-teal-50 p-6 rounded-lg border border-teal-200">
              <h2 className="text-xl font-bold text-teal-700 mb-4">SKILLS</h2>
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="font-bold text-teal-600 mb-2 text-sm uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="text-gray-700 text-sm">
                          • {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <section className="bg-teal-50 p-6 rounded-lg border border-teal-200">
              <h2 className="text-xl font-bold text-teal-700 mb-4">
                CERTIFICATIONS
              </h2>
              <div className="space-y-3">
                {data.certifications.map((cert, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-900">{cert.name}</h3>
                    <p className="text-gray-700 text-sm">{cert.issuer}</p>
                    {cert.issueDate && (
                      <p className="text-gray-600 text-xs">
                        Issued: {cert.issueDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.languages && data.languages.length > 0 && (
            <section className="bg-teal-50 p-6 rounded-lg border border-teal-200">
              <h2 className="text-xl font-bold text-teal-700 mb-4">
                LANGUAGES
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-700">{lang.name}</span>
                    <span className="text-teal-600 font-semibold text-sm">
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-teal-50 p-6 rounded-lg border border-teal-200">
            <h2 className="text-xl font-bold text-teal-700 mb-4">CONNECT</h2>
            <div className="space-y-3">
              {data.personalInfo.linkedin && (
                <div>
                  <span className="font-semibold text-gray-700 text-sm">
                    LinkedIn:
                  </span>
                  <a
                    href={data.personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-teal-600 hover:text-teal-800 transition-colors text-sm break-all"
                  >
                    {data.personalInfo.linkedin.replace("https://", "")}
                  </a>
                </div>
              )}
              {data.personalInfo.github && (
                <div>
                  <span className="font-semibold text-gray-700 text-sm">
                    GitHub:
                  </span>
                  <a
                    href={`https://github.com/${data.personalInfo.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-teal-600 hover:text-teal-800 transition-colors text-sm"
                  >
                    github.com/{data.personalInfo.github}
                  </a>
                </div>
              )}
              {data.personalInfo.website && (
                <div>
                  <span className="font-semibold text-gray-700 text-sm">
                    Portfolio:
                  </span>
                  <a
                    href={data.personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-teal-600 hover:text-teal-800 transition-colors text-sm break-all"
                  >
                    {data.personalInfo.website.replace("https://", "")}
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});
GraduateTemplate.displayName = "GraduateTemplate";
export default GraduateTemplate;
