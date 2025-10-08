import React from "react";
import type { ResumeData } from "../../../types/resume";
interface TechTemplateProps {
  data: ResumeData;
  className?: string;
  style?: React.CSSProperties;
}
const TechTemplate = React.forwardRef<HTMLDivElement, TechTemplateProps>(
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
        className={`bg-gray-900 text-green-400 p-8 font-mono max-w-4xl mx-auto ${className}`}
        style={style}
      >
        <header className="border border-green-400 p-6 mb-8 bg-black">
          <div className="flex items-center mb-4">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-300 text-sm">user@resume:~$</span>
          </div>
          <div className="text-green-400">
            <h1 className="text-3xl font-bold mb-2">
              {`> ${data.personalInfo.fullName}`}
            </h1>
            {data.personalInfo.headline && (
              <p className="text-xl text-green-300 mb-4">
                {data.personalInfo.headline}
              </p>
            )}
            <div className="space-y-1 text-sm">
              <p>{`email: "${data.personalInfo.email}"`}</p>
              {data.personalInfo.phone && (
                <p>{`phone: "${data.personalInfo.phone}"`}</p>
              )}
              {data.personalInfo.location && (
                <p>{`location: "${data.personalInfo.location}"`}</p>
              )}
              {data.personalInfo.linkedin && (
                <p>
                  {`linkedin: "`}
                  <a
                    href={data.personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {data.personalInfo.linkedin}
                  </a>
                  {`"`}
                </p>
              )}
              {data.personalInfo.website && (
                <p>
                  {`website: "`}
                  <a
                    href={data.personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {data.personalInfo.website}
                  </a>
                  {`"`}
                </p>
              )}
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {data.summary && (
              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
                  <span className="text-green-400 mr-2">const</span>
                  <span>summary</span>
                  <span className="text-white ml-2">=</span>
                </h2>
                <div className="bg-black border border-green-400 p-4 rounded">
                  <p className="text-green-300">{`"${data.summary}"`}</p>
                </div>
              </section>
            )}

            {data.experiences && data.experiences.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
                  <span className="text-green-400 mr-2">const</span>
                  <span>experience</span>
                  <span className="text-white ml-2">=</span>
                  <span className="text-yellow-400 ml-2">[</span>
                </h2>
                <div className="space-y-4 ml-4">
                  {data.experiences.map((exp, index) => (
                    <div
                      key={index}
                      className="bg-black border border-green-400 p-4 rounded"
                    >
                      <div className="text-yellow-400 mb-2">{`{`}</div>
                      <div className="ml-4 space-y-2">
                        <p>
                          <span className="text-cyan-300">position:</span>
                          <span className="text-green-300 ml-2">
                            "{exp.position || exp.title}"
                          </span>
                        </p>
                        <p>
                          <span className="text-cyan-300">company:</span>
                          <span className="text-green-300 ml-2">
                            "{exp.company}"
                          </span>
                        </p>
                        {exp.location && (
                          <p>
                            <span className="text-cyan-300">location:</span>
                            <span className="text-green-300 ml-2">
                              "{exp.location}"
                            </span>
                          </p>
                        )}
                        <p>
                          <span className="text-cyan-300">duration:</span>
                          <span className="text-green-300 ml-2">
                            "{exp.startDate} -{" "}
                            {exp.current ? "Present" : exp.endDate}"
                          </span>
                        </p>
                        {exp.description && exp.description.length > 0 && (
                          <div>
                            <span className="text-cyan-300">achievements:</span>
                            <span className="text-yellow-400 ml-2">[</span>
                            <div className="ml-6 mt-2 space-y-1">
                              {exp.description.map((desc, descIndex) => (
                                <p key={descIndex} className="text-green-300">
                                  "{desc}"
                                  {descIndex < exp.description!.length - 1
                                    ? ","
                                    : ""}
                                </p>
                              ))}
                            </div>
                            <span className="text-yellow-400">]</span>
                          </div>
                        )}
                      </div>
                      <div className="text-yellow-400">
                        {`}${index < data.experiences!.length - 1 ? "," : ""}`}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-yellow-400">]</div>
              </section>
            )}

            {data.projects && data.projects.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
                  <span className="text-green-400 mr-2">const</span>
                  <span>projects</span>
                  <span className="text-white ml-2">=</span>
                  <span className="text-yellow-400 ml-2">[</span>
                </h2>
                <div className="space-y-4 ml-4">
                  {data.projects.map((project, index) => (
                    <div
                      key={index}
                      className="bg-black border border-green-400 p-4 rounded"
                    >
                      <div className="text-yellow-400 mb-2">{`{`}</div>
                      <div className="ml-4 space-y-2">
                        <p>
                          <span className="text-cyan-300">name:</span>
                          <span className="text-green-300 ml-2">
                            "{project.name}"
                          </span>
                        </p>
                        <p>
                          <span className="text-cyan-300">description:</span>
                          <span className="text-green-300 ml-2">
                            "{project.description}"
                          </span>
                        </p>
                        <p>
                          <span className="text-cyan-300">timeline:</span>
                          <span className="text-green-300 ml-2">
                            "{project.startDate} -{" "}
                            {project.endDate || "Present"}"
                          </span>
                        </p>
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div>
                              <span className="text-cyan-300">
                                technologies:
                              </span>
                              <span className="text-yellow-400 ml-2">[</span>
                              <div className="ml-6 mt-1">
                                {project.technologies.map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    className="text-green-300"
                                  >
                                    "{tech}"
                                    {techIndex <
                                    project.technologies!.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                ))}
                              </div>
                              <span className="text-yellow-400">]</span>
                            </div>
                          )}
                      </div>
                      <div className="text-yellow-400">
                        {`}${index < data.projects!.length - 1 ? "," : ""}`}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-yellow-400">]</div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            {Object.keys(skillsByCategory).length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
                  <span className="text-green-400 mr-2">const</span>
                  <span>skills</span>
                  <span className="text-white ml-2">=</span>
                </h2>
                <div className="bg-black border border-green-400 p-4 rounded">
                  <div className="text-yellow-400 mb-2">{`{`}</div>
                  <div className="ml-4 space-y-3">
                    {Object.entries(skillsByCategory).map(
                      ([category, skills], index) => (
                        <div key={category}>
                          <span className="text-cyan-300">
                            {category.toLowerCase()}:
                          </span>
                          <span className="text-yellow-400 ml-2">[</span>
                          <div className="ml-6 mt-1">
                            {skills.map((skill, skillIndex) => (
                              <div key={skillIndex} className="text-green-300">
                                "{skill}"
                                {skillIndex < skills.length - 1 ? "," : ""}
                              </div>
                            ))}
                          </div>
                          <span className="text-yellow-400">]</span>
                          {index < Object.keys(skillsByCategory).length - 1 && (
                            <span className="text-white">,</span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                  <div className="text-yellow-400">{`}`}</div>
                </div>
              </section>
            )}

            {data.education && data.education.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
                  <span className="text-green-400 mr-2">const</span>
                  <span>education</span>
                  <span className="text-white ml-2">=</span>
                </h2>
                <div className="bg-black border border-green-400 p-4 rounded">
                  <div className="text-yellow-400 mb-2">[</div>
                  <div className="ml-4 space-y-3">
                    {data.education.map((edu, index) => (
                      <div key={index}>
                        <div className="text-yellow-400 mb-2">{`{`}</div>
                        <div className="ml-4 space-y-1">
                          <p>
                            <span className="text-cyan-300">degree:</span>
                            <span className="text-green-300 ml-2">
                              "{edu.degree}"
                            </span>
                          </p>
                          <p>
                            <span className="text-cyan-300">field:</span>
                            <span className="text-green-300 ml-2">
                              "{edu.field}"
                            </span>
                          </p>
                          <p>
                            <span className="text-cyan-300">institution:</span>
                            <span className="text-green-300 ml-2">
                              "{edu.institution}"
                            </span>
                          </p>
                          <p>
                            <span className="text-cyan-300">period:</span>
                            <span className="text-green-300 ml-2">
                              "{edu.startDate} -{" "}
                              {edu.current ? "Present" : edu.endDate}"
                            </span>
                          </p>
                          {edu.gpa && (
                            <p>
                              <span className="text-cyan-300">gpa:</span>
                              <span className="text-green-300 ml-2">
                                "{edu.gpa}"
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="text-yellow-400">
                          {`}${index < data.education!.length - 1 ? "," : ""}`}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-yellow-400">]</div>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold text-cyan-400 mb-4">
                ~/terminal
              </h2>
              <div className="bg-black border border-green-400 p-4 rounded text-sm">
                <p className="text-green-400">$ whoami</p>
                <p className="text-green-300">{data.personalInfo.fullName}</p>
                <p className="text-green-400 mt-2">$ pwd</p>
                <p className="text-green-300">~/professional/developer</p>
                <p className="text-green-400 mt-2">$ status</p>
                <p className="text-green-300">Ready for new challenges</p>
                <p className="text-green-400 mt-2">$ contact --info</p>
                <p className="text-green-300">{data.personalInfo.email}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
);
TechTemplate.displayName = "TechTemplate";
export default TechTemplate;
