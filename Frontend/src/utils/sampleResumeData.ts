import type { ResumeData } from "../types/resume";

export const generateSampleResumeData = (): ResumeData => {
  return {
    title: "John Doe Resume",
    personalInfo: {
      fullName: "John Doe",
      email: "john.doe@email.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/johndoe",
      website: "https://johndoe.com",
      github: "johndoe",
      twitter: "johndoe",
      headline: "Senior Software Engineer",
      photo: "",
    },
    summary:
      "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers. Passionate about emerging technologies and agile methodologies.",
    experiences: [
      {
        id: "1",
        company: "TechCorp Solutions",
        title: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "2021-03",
        endDate: "",
        current: true,
        description: [
          "Led development of microservices architecture serving 10M+ users daily",
          "Mentored team of 5 junior developers and improved code quality by 40%",
          "Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes",
          "Collaborated with product managers to define technical requirements for new features",
        ],
      },
      {
        id: "2",
        company: "InnovateTech",
        title: "Full Stack Developer",
        location: "San Francisco, CA",
        startDate: "2019-01",
        endDate: "2021-02",
        current: false,
        description: [
          "Developed and maintained React-based web applications with Node.js backends",
          "Optimized database queries resulting in 50% performance improvement",
          "Integrated third-party APIs and payment systems for e-commerce platform",
          "Participated in agile ceremonies and contributed to sprint planning",
        ],
      },
      {
        id: "3",
        company: "StartupXYZ",
        title: "Software Developer",
        location: "San Francisco, CA",
        startDate: "2017-06",
        endDate: "2018-12",
        current: false,
        description: [
          "Built responsive web applications using JavaScript, HTML5, and CSS3",
          "Created REST APIs using Python Flask and integrated with PostgreSQL",
          "Implemented automated testing resulting in 30% reduction in bugs",
          "Collaborated with UI/UX designers to implement pixel-perfect designs",
        ],
      },
    ],
    education: [
      {
        id: "1",
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Science",
        location: "Berkeley, CA",
        startDate: "2013-08",
        endDate: "2017-05",
        current: false,
        gpa: "3.8",
        description:
          "Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems",
      },
    ],
    skills: [
      {
        id: "1",
        name: "JavaScript",
        level: "Expert",
        category: "Programming Languages",
      },
      {
        id: "2",
        name: "Python",
        level: "Advanced",
        category: "Programming Languages",
      },
      {
        id: "3",
        name: "React",
        level: "Expert",
        category: "Frontend",
      },
      {
        id: "4",
        name: "Node.js",
        level: "Advanced",
        category: "Backend",
      },
      {
        id: "5",
        name: "AWS",
        level: "Advanced",
        category: "Cloud",
      },
      {
        id: "6",
        name: "Docker",
        level: "Intermediate",
        category: "DevOps",
      },
      {
        id: "7",
        name: "PostgreSQL",
        level: "Advanced",
        category: "Database",
      },
      {
        id: "8",
        name: "Git",
        level: "Expert",
        category: "Tools",
      },
    ],
    projects: [
      {
        id: "1",
        name: "E-Commerce Platform",
        description:
          "Built a full-stack e-commerce platform with React frontend, Node.js backend, and PostgreSQL database. Implemented features like user authentication, payment processing, and inventory management.",
        technologies: ["React", "Node.js", "PostgreSQL", "Stripe API", "AWS"],
        startDate: "2022-01",
        endDate: "2022-06",
        url: "https://github.com/johndoe/ecommerce-platform",
        github: "https://github.com/johndoe/ecommerce-platform",
      },
      {
        id: "2",
        name: "Task Management App",
        description:
          "Developed a collaborative task management application with real-time updates using WebSocket technology. Features include team collaboration, deadline tracking, and progress visualization.",
        technologies: ["Vue.js", "Express.js", "MongoDB", "Socket.io"],
        startDate: "2021-08",
        endDate: "2021-12",
        url: "https://taskmanager-demo.com",
        github: "https://github.com/johndoe/task-manager",
      },
    ],
    certifications: [
      {
        id: "1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        issueDate: "2022-03",
        expiryDate: "2025-03",
        credentialId: "AWS-SAA-12345",
        credentialUrl: "https://aws.amazon.com/certification/",
      },
      {
        id: "2",
        name: "Certified Kubernetes Administrator",
        issuer: "Cloud Native Computing Foundation",
        issueDate: "2021-11",
        expiryDate: "2024-11",
        credentialId: "CKA-67890",
        credentialUrl: "https://www.cncf.io/certification/",
      },
    ],
    awards: [
      {
        id: "1",
        title: "Employee of the Year",
        issuer: "TechCorp Solutions",
        date: "2022-12",
        description:
          "Recognized for outstanding performance and leadership in delivering critical projects",
      },
    ],
    languages: [
      {
        id: "1",
        name: "English",
        proficiency: "Native",
      },
      {
        id: "2",
        name: "Spanish",
        proficiency: "Conversational",
      },
    ],
    publications: [
      {
        id: "1",
        title: "Scaling Microservices Architecture",
        publisher: "Tech Journal",
        publishDate: "2023-03",
        url: "https://techjournal.com/scaling-microservices",
        description:
          "An in-depth article about best practices for scaling microservices in production environments",
      },
    ],
    volunteerExperience: [
      {
        id: "1",
        organization: "Code for Good",
        role: "Volunteer Developer",
        startDate: "2020-01",
        endDate: "",
        current: true,
        description: [
          "Contribute to open-source projects that benefit non-profit organizations",
          "Mentor new volunteers in software development best practices",
        ],
      },
    ],
    references: [
      {
        id: "1",
        name: "Sarah Johnson",
        title: "Engineering Manager",
        company: "TechCorp Solutions",
        email: "sarah.johnson@techcorp.com",
        phone: "(555) 987-6543",
        relationship: "Direct Manager",
      },
    ],
    template: "modern",
    lastUpdated: new Date(),
  };
};
