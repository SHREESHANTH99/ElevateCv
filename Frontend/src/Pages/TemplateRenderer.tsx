import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ModernTemplate, ExecutiveTemplate, CreativeTemplate, MinimalistTemplate,
  ATSTemplate, TechTemplate, ClassicTemplate, CorporateTemplate, EngineerTemplate, GraduateTemplate
} from '../Components/resume/templates';
import { generateSampleResumeData } from '../utils/sampleResumeData';

export default function TemplateRenderer() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('t');
  
  const data = generateSampleResumeData();

  if (!data || !templateId) return <div id="status">Loading...</div>;

  const components: Record<string, React.FC<{ data: any }>> = {
    modern: ModernTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate,
    minimalist: MinimalistTemplate, ats: ATSTemplate, tech: TechTemplate,
    classic: ClassicTemplate, corporate: CorporateTemplate, engineer: EngineerTemplate,
    graduate: GraduateTemplate,
  };

  const Component = components[templateId];
  if (!Component) return <div id="status">Invalid Template</div>;
  
  return (
    <div id="status" data-ready="true" className="bg-white p-8" style={{ width: '1000px', minHeight: '1294px' }}>
      <Component data={data} />
    </div>
  );
}
