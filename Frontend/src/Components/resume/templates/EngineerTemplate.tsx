import React from "react";
import type { ResumeData } from "../../../types/resume";

interface EngineerTemplateProps {
  data: ResumeData;
  className?: string;
  style?: React.CSSProperties;
}

const EngineerTemplate = React.forwardRef<
  HTMLDivElement,
  EngineerTemplateProps
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
      className={`bg-gray-50 p-8 font-mono text-gray-900 max-w-4xl mx-auto ${className}`}
      style={style}
    >
      {/* Technical Header */}
      <header className="bg-gray-900 text-green-400 p-6 -mx-8 -mt-8 mb-8 border-l-8 border-green-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <span className="text-green-300 mr-2">$</span>
              <h1 className="text-3xl font-bold">
                {data.personalInfo.fullName.toLowerCase().replace(/\s+/g, "_")}
              </h1>
            </div>
            {data.personalInfo.headline && (
              <p className="text-gray-300 text-lg mb-4">
                # {data.personalInfo.headline}
              </p>
            )}
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">
                <span className="text-green-400">email:</span>{" "}
                {data.personalInfo.email}
              </p>
              {data.personalInfo.phone && (
                <p className="text-gray-300">
                  <span className="text-green-400">phone:</span>{" "}
                  {data.personalInfo.phone}
                </p>
              )}
              {data.personalInfo.location && (
                <p className="text-gray-300">
                  <span className="text-green-400">location:</span>{" "}
                  {data.personalInfo.location}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="bg-green-500 text-gray-900 px-4 py-2 rounded font-bold">
              ENGINEER
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* System Overview */}
          {data.summary && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-green-600 mr-2">//</span>
                <span>SYSTEM_OVERVIEW</span>
              </h2>
              <div className="bg-white border-l-4 border-green-500 p-6 rounded-r shadow-sm">
                <p className="text-gray-800 font-mono text-sm leading-relaxed">
                  {data.summary}
                </p>
              </div>
            </section>
          )}

          {/* Professional Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-green-600 mr-2">//</span>
                <span>WORK_HISTORY</span>
              </h2>
              <div className="space-y-6">
                {data.experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded p-6 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 font-mono">
                          {exp.position.toLowerCase().replace(/\s+/g, "_")}()
                        </h3>
                        <p className="text-gray-700 font-semibold">
                          {exp.company}
                        </p>
                        {exp.location && (
                          <p className="text-gray-600 text-sm">
                            {exp.location}
                          </p>
                        )}
                      </div>
                      <div className="bg-gray-100 px-3 py-2 rounded font-mono text-sm text-gray-700">
                        <span className="text-green-600">from:</span>{" "}
                        {exp.startDate}
                        <br />
                        <span className="text-green-600">to:</span>{" "}
                        {exp.current ? "active" : exp.endDate}
                      </div>
                    </div>
                    {exp.description && exp.description.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded border-l-4 border-green-400">
                        <div className="space-y-2">
                          {exp.description.map((desc, descIndex) => (
                            <div key={descIndex} className="flex items-start">
                              <span className="text-green-600 mr-3 font-mono">
                                →
                              </span>
                              <span className="text-gray-800 text-sm font-mono leading-relaxed">
                                {desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Engineering Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-green-600 mr-2">//</span>
                <span>PROJECTS</span>
              </h2>
              <div className="space-y-6">
                {data.projects.map((project, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded p-6 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900 font-mono">
                        {project.name.toLowerCase().replace(/\s+/g, "_")}
                      </h3>
                      <span className="bg-gray-100 px-3 py-1 rounded font-mono text-sm text-gray-700">
                        v{project.startDate.replace(/\D/g, "")}.
                        {project.endDate?.replace(/\D/g, "") || "0"}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-4 font-mono text-sm leading-relaxed">
                      {project.description}
                    </p>
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center mb-2">
                            <span className="text-green-600 font-mono text-sm mr-2">
                              stack:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded border border-green-300"
                              >
                                {tech.toLowerCase()}
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

        {/* Technical Sidebar */}
        <div className="space-y-6">
          {/* Technical Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <section className="bg-gray-900 text-green-400 p-6 rounded border-l-4 border-green-500">
              <h2 className="text-lg font-bold text-green-300 mb-4 flex items-center">
                <span className="mr-2">$</span>
                <span>cat skills.txt</span>
              </h2>
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category} className="text-sm">
                    <h3 className="text-green-300 font-bold mb-2 font-mono">
                      # {category.toLowerCase().replace(/\s+/g, "_")}
                    </h3>
                    <div className="space-y-1 text-gray-300">
                      {skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="font-mono">
                          <span className="text-green-500">-</span>{" "}
                          {skill.toLowerCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section className="bg-white border border-gray-300 rounded p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-green-600 mr-2">//</span>
                <span className="font-mono">EDUCATION</span>
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded border-l-4 border-green-400"
                  >
                    <h3 className="font-bold text-gray-900 font-mono text-sm">
                      {edu.degree.toLowerCase().replace(/\s+/g, "_")}
                    </h3>
                    <p className="text-gray-700 font-mono text-sm">
                      {edu.field}
                    </p>
                    <p className="text-gray-600 font-mono text-xs">
                      {edu.institution}
                    </p>
                    <p className="text-gray-600 font-mono text-xs">
                      {edu.startDate} → {edu.current ? "ongoing" : edu.endDate}
                    </p>
                    {edu.gpa && (
                      <p className="text-green-600 font-mono text-xs">
                        gpa: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* System Info */}
          <section className="bg-gray-900 text-green-400 p-6 rounded border-l-4 border-green-500">
            <h2 className="text-lg font-bold text-green-300 mb-4 flex items-center">
              <span className="mr-2">$</span>
              <span>system --info</span>
            </h2>
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-green-300">user:</span>
                <span className="text-gray-300 ml-2">
                  {data.personalInfo.fullName
                    .toLowerCase()
                    .replace(/\s+/g, "_")}
                </span>
              </div>
              <div>
                <span className="text-green-300">status:</span>
                <span className="text-gray-300 ml-2">available_for_hire</span>
              </div>
              {data.personalInfo.linkedin && (
                <div>
                  <span className="text-green-300">linkedin:</span>
                  <a
                    href={data.personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 ml-2 hover:text-cyan-300 break-all"
                  >
                    {data.personalInfo.linkedin.replace("https://", "")}
                  </a>
                </div>
              )}
              {data.personalInfo.website && (
                <div>
                  <span className="text-green-300">portfolio:</span>
                  <a
                    href={data.personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 ml-2 hover:text-cyan-300 break-all"
                  >
                    {data.personalInfo.website.replace("https://", "")}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section className="bg-white border border-gray-300 rounded p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-green-600 mr-2">//</span>
                <span className="font-mono">LANGUAGES</span>
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex justify-between font-mono text-sm"
                  >
                    <span className="text-gray-700">
                      {lang.name.toLowerCase()}
                    </span>
                    <span className="text-green-600">
                      {lang.proficiency.toLowerCase()}
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

EngineerTemplate.displayName = "EngineerTemplate";

export default EngineerTemplate;
