/**
 * Certifications section
 */
import { RefObject } from 'react';
import Section from '@molecules/Section/Section';
import CertificationCard from '@molecules/CertificationCard/CertificationCard';

type CertificationsSectionProps = {
  mainContentRef: RefObject<Record<string, HTMLElement>>;
};

const CertificationsSection = ({ mainContentRef }: CertificationsSectionProps) => {
  const certifications = [
    {
      id: 1,
      name: 'AWS Certified Solutions Architect - Associate',
      shortDescription:
        'Validates the ability to design secure, scalable, and cost-effective cloud architectures, balancing reliability and performance across compute, storage, and networking.',
      certificationBadge: '/images/aws_solutions_architect_assoc_badge.png',
      credentialsLink:
        'https://www.credly.com/badges/ccff3010-ada6-4f34-9994-0aca65f08ae5/public_url',
    },
    {
      id: 2,
      name: 'AWS Certified Developer - Associate',
      shortDescription:
        'Demonstrates proficiency in building, deploying, and maintaining cloud-native applications, with a focus on serverless development, automated delivery, and security best practices.',
      certificationBadge: '/images/aws_developer_assoc_badge.png',
      credentialsLink:
        'https://www.credly.com/badges/da3c39e4-0e3a-4ada-8386-2824c1af203a/linked_in_profile',
    },
    {
      id: 3,
      name: 'Stripe Certified Developer - Professional',
      shortDescription:
        'Recognizes advanced expertise in designing and integrating payment systems, including subscriptions, checkout flows, event-driven workflows, and secure transaction handling.',
      certificationBadge: '/images/stripe_dev_prof_badge.png',
      credentialsLink:
        'https://stripecertifications.credential.net/6beca4c1-bfcb-41a4-af6f-c5aa7e09959b#acc.QZ2UxdrH',
    }
  ];

  return (
    <Section id="certifications" headerText="Certifications" mainContentRef={mainContentRef}>
      {certifications.map((certification) => {
        const id = certification.name.split(' ').join('-').toLowerCase();
        return (
          <div key={`${id}-key`} className="not-last:mb-5">
            <CertificationCard
              id={id}
              name={certification.name}
              shortDescription={certification.shortDescription}
              certificationBadge={certification.certificationBadge}
              credentialsLink={certification.credentialsLink}
            />
          </div>
        );
      })}
    </Section>
  );
};

export default CertificationsSection;
