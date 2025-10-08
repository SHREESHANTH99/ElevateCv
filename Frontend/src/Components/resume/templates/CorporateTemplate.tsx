import React from "react";
import type { ResumeData } from "../../../types/resume";
interface CorporateTemplateProps {
  data: ResumeData;
  className?: string;
  style?: React.CSSProperties;
}
const CorporateTemplate = React.forwardRef<
  HTMLDivElement,
  CorporateTemplateProps
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
      <header className="bg-slate-800 text-white p-8 -mx-8 -mt-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              {data.personalInfo.fullName}
            </h1>
            {data.personalInfo.headline && (
              <p className="text-xl text-slate-200 mb-4">
                {data.personalInfo.headline}
              </p>
            )}
          </div>
          <div className="text-right text-slate-200 space-y-1">
            <p>{data.personalInfo.email}</p>
            {data.personalInfo.phone && <p>{data.personalInfo.phone}</p>}
            {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {data.summary && (
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                EXECUTIVE SUMMARY
              </h2>
              <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-600">
                <p className="text-gray-800 leading-relaxed text-lg">
                  {data.summary}
                </p>
              </div>
            </section>
          )}

          {data.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-slate-300">
                PROFESSIONAL EXPERIENCE
              </h2>
              <div className="space-y-8">
                {data.experiences.map((exp, index) => (
                  <div key={index} className="relative">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {exp.position || exp.title}
                          </h3>
                          <p className="text-lg text-slate-700 font-semibold">
                            {exp.company}
                          </p>
                          {exp.location && (
                            <p className="text-slate-600">{exp.location}</p>
                          )}
                        </div>
                        <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-semibold text-right">
                          <p>{exp.startDate}</p>
                          <p>to</p>
                          <p>{exp.current ? "Present" : exp.endDate}</p>
                        </div>
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <div className="space-y-3">
                          {exp.description.map((desc, descIndex) => (
                            <div key={descIndex} className="flex items-start">
                              <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                              <p className="text-gray-800 leading-relaxed">
                                {desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.projects && data.projects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-slate-300">
                KEY PROJECTS
              </h2>
              <div className="grid gap-6">
                {data.projects.map((project, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900">
                        {project.name}
                      </h3>
                      <span className="bg-slate-100 px-3 py-1 rounded text-slate-700 text-sm font-semibold">
                        {project.startDate} - {project.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-800 mb-2 block">
                            Technologies Used:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-3 py-1 bg-slate-600 text-white text-sm rounded-full"
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
        </div>

        <div className="space-y-6">
          {Object.keys(skillsByCategory).length > 0 && (
            <section className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-600">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                CORE SKILLS
              </h2>
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex items-center">
                          <div className="w-2 h-2 bg-slate-600 rounded-full mr-3"></div>
                          <span className="text-gray-700">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.education && data.education.length > 0 && (
            <section className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-600">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                EDUCATION
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                    <p className="text-slate-700 font-semibold">{edu.field}</p>
                    <p className="text-slate-600">{edu.institution}</p>
                    <p className="text-slate-600 text-sm">
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                    </p>
                    {edu.gpa && (
                      <p className="text-slate-700 font-semibold text-sm">
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <section className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-600">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                CERTIFICATIONS
              </h2>
              <div className="space-y-3">
                {data.certifications.map((cert, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-slate-800">{cert.name}</h3>
                    <p className="text-slate-700">{cert.issuer}</p>
                    {(cert.date || cert.issueDate) && (
                      <p className="text-slate-600 text-sm">
                        Issued: {cert.date || cert.issueDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-600">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              PROFESSIONAL LINKS
            </h2>
            <div className="space-y-3">
              {data.personalInfo.linkedin && (
                <div>
                  <span className="font-semibold text-slate-700">
                    LinkedIn:
                  </span>
                  <a
                    href={data.personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-slate-600 hover:text-slate-800 transition-colors break-all"
                  >
                    {data.personalInfo.linkedin}
                  </a>
                </div>
              )}
              {data.personalInfo.website && (
                <div>
                  <span className="font-semibold text-slate-700">
                    Portfolio:
                  </span>
                  <a
                    href={data.personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-slate-600 hover:text-slate-800 transition-colors break-all"
                  >
                    {data.personalInfo.website}
                  </a>
                </div>
              )}
            </div>
          </section>

          {data.languages && data.languages.length > 0 && (
            <section className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-600">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                LANGUAGES
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-slate-700">{lang.name}</span>
                    <span className="text-slate-600 font-semibold">
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
});
CorporateTemplate.displayName = "CorporateTemplate";
export default CorporateTemplate;
