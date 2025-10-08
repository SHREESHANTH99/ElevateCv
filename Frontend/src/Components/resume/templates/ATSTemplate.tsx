import React from "react";
import type { ResumeData } from "../../../types/resume";
interface ATSTemplateProps {
  data: ResumeData;
  className?: string;
  style?: React.CSSProperties;
}
const ATSTemplate = React.forwardRef<HTMLDivElement, ATSTemplateProps>(
  ({ data, className = "", style = {} }, ref) => {
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
        className={`bg-white p-8 font-sans text-black max-w-4xl mx-auto leading-normal ${className}`}
        style={style}
      >
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">
            {data.personalInfo.fullName}
          </h1>
          {data.personalInfo.headline && (
            <p className="text-lg text-black mb-3">
              {data.personalInfo.headline}
            </p>
          )}
          <div className="text-black">
            <p>{data.personalInfo.email}</p>
            {data.personalInfo.phone && <p>{data.personalInfo.phone}</p>}
            {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
            {data.personalInfo.linkedin && (
              <p>LinkedIn: {data.personalInfo.linkedin}</p>
            )}
            {data.personalInfo.website && (
              <p>Website: {data.personalInfo.website}</p>
            )}
          </div>
        </header>

        {data.summary && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3 uppercase">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-black">{data.summary}</p>
          </section>
        )}

        {Object.keys(skillsByCategory).length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3 uppercase">
              CORE SKILLS
            </h2>
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category} className="mb-3">
                <h3 className="font-bold text-black mb-2">{category}:</h3>
                <p className="text-black">{skills.join(", ")}</p>
              </div>
            ))}
          </section>
        )}

        {data.experiences && data.experiences.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3 uppercase">
              PROFESSIONAL EXPERIENCE
            </h2>
            {data.experiences.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="mb-2">
                  <h3 className="font-bold text-black text-base">
                    {exp.position || exp.title}
                  </h3>
                  <p className="text-black font-semibold">{exp.company}</p>
                  {exp.location && <p className="text-black">{exp.location}</p>}
                  <p className="text-black">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </p>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="text-black">
                    {exp.description.map((desc, descIndex) => (
                      <li key={descIndex} className="mb-1">
                        • {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {data.projects && data.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3 uppercase">
              PROJECTS
            </h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <div className="mb-2">
                  <h3 className="font-bold text-black text-base">
                    {project.name}
                  </h3>
                  <p className="text-black">
                    {project.startDate} - {project.endDate || "Present"}
                  </p>
                </div>
                <p className="text-black mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-black">
                    <strong>Technologies:</strong>{" "}
                    {project.technologies.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {data.education && data.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3 uppercase">
              EDUCATION
            </h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <h3 className="font-bold text-black text-base">
                  {edu.degree} in {edu.field}
                </h3>
                <p className="text-black">{edu.institution}</p>
                <p className="text-black">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </p>
                {edu.gpa && <p className="text-black">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </section>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3 uppercase">
              CERTIFICATIONS
            </h2>
            {data.certifications.map((cert, index) => (
              <div key={index} className="mb-2">
                <h3 className="font-bold text-black">{cert.name}</h3>
                <p className="text-black">{cert.issuer}</p>
                {(cert.date || cert.issueDate) && (
                  <p className="text-black">
                    Issued: {cert.date || cert.issueDate}
                  </p>
                )}
                {cert.expiryDate && (
                  <p className="text-black">Expires: {cert.expiryDate}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {data.awards && data.awards.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3 uppercase">
              AWARDS & ACHIEVEMENTS
            </h2>
            {data.awards.map((award, index) => (
              <div key={index} className="mb-2">
                <h3 className="font-bold text-black">{award.title}</h3>
                <p className="text-black">{award.issuer}</p>
                {award.date && <p className="text-black">{award.date}</p>}
                {award.description && (
                  <p className="text-black">{award.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {data.languages && data.languages.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-black mb-3 uppercase">
              LANGUAGES
            </h2>
            <div className="text-black">
              {data.languages.map((lang, index) => (
                <p key={index}>
                  {lang.name}: {lang.proficiency}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }
);
ATSTemplate.displayName = "ATSTemplate";
export default ATSTemplate;
