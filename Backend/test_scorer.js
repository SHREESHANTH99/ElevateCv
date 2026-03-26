const { scoreResume } = require("./utils/resumeScorer");

const testResume = {
  personalInfo: { fullName: "Jane Doe", email: "jane@example.com", phone: "123", location: "Mumbai" },
  summary: "Software Engineer with 5 years experience in React and Node.js. Optimized performance by 40%.",
  experiences: [
    {
      company: "Tech Corp",
      position: "Senior Dev",
      description: ["Led a team of 5", "Implemented cloud-based scaling", "Reduced latency by 20%"]
    }
  ],
  education: [{ institution: "IIT", degree: "B.Tech", field: "CS" }],
  skills: [{ name: "React", level: "Expert", category: "Technical" }]
};

const jobDesc = "We are looking for a React developer who can lead projects and improve system performance by optimizing existing codebase.";

console.log("Testing Resume Scoring Engine...");
const results = scoreResume(testResume, jobDesc);
console.log(JSON.stringify(results, null, 2));
