import { describe, it, expect } from 'vitest';
import { scoreResume } from '../utils/resumeScorer.js';

describe('resumeScorer', () => {
  it('should score high for a perfectly aligned resume', () => {
    const resumeData = {
      experiences: [
        {
          title: 'Software Engineer',
          description: ['Developed frontend with React and TypeScript, increasing conversion by 20%']
        }
      ],
      skills: ['React', 'TypeScript', 'Node.js']
    };

    const jobAnalysis = {
      requiredSkills: ['REACT', 'TYPESCRIPT'],
      preferredSkills: ['NODE.JS'],
      keywords: ['react', 'typescript', 'frontend', 'engineer']
    };

    // Note: semanticSimScore is an optional arg, passing 90 to simulate good NLP match
    const result = scoreResume(resumeData, jobAnalysis, 90);
    
    // We expect the score to be good
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.label).toBe('Good Match');
    expect(result.dimensionScores.keywordMatch).toBeGreaterThan(0);
  });

  it('should penalize for lack of quantified impact', () => {
    const resumeData = {
      experiences: [
        {
          title: 'Developer',
          description: ['Did some coding']
        }
      ],
      skills: ['React']
    };

    const jobAnalysis = {
      requiredSkills: ['REACT'],
      keywords: ['react']
    };

    const result = scoreResume(resumeData, jobAnalysis, 50);
    
    // Since there are no numbers (%, k, etc.), quantification score should be low (default is 30)
    expect(result.dimensionScores.quantification).toBe(30);
  });

  it('should score low when required skills are missing', () => {
    const resumeData = {
      experiences: [],
      skills: ['Python']
    };

    const jobAnalysis = {
      requiredSkills: ['REACT', 'NODE'],
      keywords: ['react', 'node']
    };

    const result = scoreResume(resumeData, jobAnalysis, 20);
    
    // Should result in Needs Improvement or Moderate Match
    expect(result.score).toBeLessThan(75);
    // The requiredSkills dimension score should reflect missing skills
    expect(result.dimensionScores.requiredSkills).toBeLessThan(50);
  });

  it('should evaluate project relevance correctly', () => {
    const resumeData = {
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built a scalable e-commerce site',
          technologies: ['React', 'Node.js', 'MongoDB']
        },
        {
          name: 'Portfolio',
          description: 'Personal portfolio',
          technologies: ['HTML', 'CSS']
        }
      ]
    };

    const jobAnalysis = {
      requiredSkills: ['REACT', 'NODE.JS'],
      keywords: ['react', 'node.js', 'ecommerce']
    };

    const result = scoreResume(resumeData, jobAnalysis, 80);
    expect(result.dimensionScores.projects).toBeGreaterThan(60);
  });

  it('should give max score for summary > 100 chars and 0 for missing summary', () => {
    const goodResume = { summary: 'A'.repeat(101) };
    const badResume = {};

    const goodResult = scoreResume(goodResume, { keywords: [] }, 50);
    const badResult = scoreResume(badResume, { keywords: [] }, 50);

    expect(goodResult.dimensionScores.summary).toBe(100);
    expect(badResult.dimensionScores.summary).toBe(0);
  });

  it('should give education points when present', () => {
    const goodResume = { education: [{ institution: 'MIT', degree: 'BS CS' }] };
    const badResume = {};

    const goodResult = scoreResume(goodResume, { keywords: [] }, 50);
    const badResult = scoreResume(badResume, { keywords: [] }, 50);

    expect(goodResult.dimensionScores.education).toBe(100);
    expect(badResult.dimensionScores.education).toBe(40);
  });
});
