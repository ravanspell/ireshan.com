/**
 * Experience section
 */
import { RefObject } from 'react';
import Section from '@molecules/Section/Section';
import ExperienceCard from '@molecules/ExperienceCard/ExperienceCard';

type ExperienceSectionProps = {
  mainContentRef: RefObject<Record<string, HTMLElement>>;
};

const ExperienceSection = ({ mainContentRef }: ExperienceSectionProps) => {
  return (
    <Section
      headerText="Experience"
      mainContentRef={mainContentRef}
      id="experience"
    >
      <div className="flex flex-col gap-5">
        <ExperienceCard
          id="accenture"
          date="2023 - Present"
          companyName="Accenture"
          designation="Senior Full Stack AI Engineer"
          companyWebsiteLink="https://www.accenture.com/sg-en"
          shortDescription="Build AI-powered, full-stack applications for global enterprise clients, taking features from prototype to production. Integrate large language models through RAG pipelines and agentic workflows, exposed via Node.js and Python APIs, and craft the React interfaces that bring them to users. Evaluate model quality, cost and latency, mentor engineers, and partner with product and design teams."
          technologiesTagLabels={[
            'Node.js',
            'TypeScript',
            'React.js',
            'Python',
            'LangGraph',
            'LangChain',
          ]}
        />
        <ExperienceCard
          id="eyepax-it"
          date="2021 - 2023"
          companyName="Eyepax IT Consultants"
          designation="Software Engineer"
          companyWebsiteLink="https://eyepax.com"
          shortDescription="Built and maintained full-stack web applications for international clients. Developed customer-facing frontends with React, Next.js and TypeScript, built REST APIs and backend services with Nest.js and Laravel, and deployed serverless workloads on AWS. Wrote automated tests with Jest and React Testing Library, and collaborated with clients and cross-functional teams to scope, estimate and deliver features in agile sprints."
          technologiesTagLabels={[
            'Node.js',
            'TypeScript',
            'React.js',
            'Jest',
            'Next.js',
            'AWS',
            'Serverless',
            'Nest.js',
            'Redux',
          ]}
        />
        <ExperienceCard
          id="axiata-digital-labs"
          date="2019 - 2021"
          companyName="Axiata Digital Labs"
          designation="Software Engineer"
          companyWebsiteLink="https://www.axiatadigitallabs.com"
          shortDescription="Contributed to digital products for the telecommunications sector used by a large customer base across the region. Implemented React frontends with Redux and Redux Saga for complex asynchronous flows, developed backend services and APIs with PHP, Laravel and Node.js, and built serverless integrations on Microsoft Azure. Wrote unit tests, documented UI components in Storybook, and took part in code reviews and production support."
          technologiesTagLabels={[
            'JavaScript',
            'Node.js',
            'TypeScript',
            'Serverless',
            'Azure',
            'Redux',
            'React.js',
            'Jest',
            'React Testing Library',
            'Storybook',
          ]}
        />
      </div>
    </Section>
  );
};

export default ExperienceSection;
