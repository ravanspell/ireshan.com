/**
 * Main content container
 *
 * consolidate all the sections into the single page
 */
import { RefObject } from 'react';
import AboutMeSection from '@organisms/AboutMeSection/AboutMeSection';
import ExperienceSection from '@organisms/ExperienceSection/ExperienceSection';
import CertificationsSection from '@organisms/Certifications/CertificationsSection';

type MainContentProps = {
  mainContentRef: RefObject<Record<string, HTMLElement>>;
};

const MainContent = ({ mainContentRef }: MainContentProps) => {
  return (
    <main>
      <AboutMeSection mainContentRef={mainContentRef} />
      <ExperienceSection mainContentRef={mainContentRef} />
      <CertificationsSection mainContentRef={mainContentRef} />
    </main>
  );
};

export default MainContent;
