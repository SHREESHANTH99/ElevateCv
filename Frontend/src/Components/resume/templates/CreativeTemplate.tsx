import React from "react";
import type { ResumeData } from "../../../types/resume";

interface CreativeTemplateProps {
  data: ResumeData;
  className?: string;
  style?: React.CSSProperties;
}

const CreativeTemplate = React.forwardRef<
  HTMLDivElement,
  CreativeTemplateProps
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
      className={`bg-white p-8 font-sans text-gray-800 max-w-4xl mx-auto ${className}`}
      style={style}
    >
      {/* Header Section with Creative Design */}
      <header className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-8 -mx-8 -mt-8 mb-8 rounded-bl-3xl shadow-xl">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-wide">
            {data.personalInfo.fullName}
          </h1>
          {data.personalInfo.headline && (
            <p className="text-2xl text-purple-100 font-light mb-4 italic">
              {data.personalInfo.headline}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-white/90 text-sm">
            <a
              href={`mailto:${data.personalInfo.email}`}
              className="flex items-center hover:text-white transition-colors bg-white/20 px-3 py-1 rounded-full"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              {data.personalInfo.email}
            </a>
            {data.personalInfo.phone && (
              <a
                href={`tel:${data.personalInfo.phone}`}
                className="flex items-center hover:text-white transition-colors bg-white/20 px-3 py-1 rounded-full"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                {data.personalInfo.phone}
              </a>
            )}
            {data.personalInfo.location && (
              <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                <svg
                  className="w-4 h-4 mr-2"
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
        </div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </header>

      {/* Creative Summary */}
      {data.summary && (
        <section className="mb-8">
          <div className="relative">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
              Creative Vision
            </h2>
            <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <p className="text-gray-700 leading-relaxed text-lg pl-6 italic">
              "{data.summary}"
            </p>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Professional Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
                Experience
              </h2>
              <div className="space-y-6">
                {data.experiences.map((exp, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-4 top-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="pl-8 border-l-2 border-purple-200 pb-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {exp.position}
                          </h3>
                          <p className="text-lg text-purple-600 font-semibold">
                            {exp.company}
                          </p>
                          {exp.location && (
                            <p className="text-gray-600">{exp.location}</p>
                          )}
                        </div>
                        <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-bold">
                          {exp.startDate} -{" "}
                          {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="space-y-2 text-gray-700">
                          {exp.description.map((desc, descIndex) => (
                            <li key={descIndex} className="flex items-start">
                              <span className="text-purple-500 mr-3 mt-1">
                                ◆
                              </span>
                              <span className="leading-relaxed">{desc}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Creative Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
                Creative Projects
              </h2>
              <div className="grid gap-6">
                {data.projects.map((project, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {project.name}
                      </h3>
                      <span className="text-purple-600 text-sm font-semibold">
                        {project.startDate} - {project.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-full font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                Skills
              </h2>
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div
                    key={category}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200"
                  >
                    <h3 className="font-bold text-purple-800 mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex items-center">
                          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                          <span className="text-gray-700 text-sm">{skill}</span>
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
            <section>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200"
                  >
                    <h3 className="font-bold text-gray-900 text-lg">
                      {edu.degree}
                    </h3>
                    <p className="text-purple-600 font-semibold">{edu.field}</p>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-gray-600 text-sm">
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                    </p>
                    {edu.gpa && (
                      <p className="text-purple-600 text-sm font-semibold">
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Links */}
          <section className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3">Connect</h3>
            <div className="space-y-2">
              {data.personalInfo.linkedin && (
                <a
                  href={data.personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  LinkedIn
                </a>
              )}
              {data.personalInfo.website && (
                <a
                  href={data.personalInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Portfolio
                </a>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});

CreativeTemplate.displayName = "CreativeTemplate";

export default CreativeTemplate;
