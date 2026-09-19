import { ReactNode } from 'react';
import Typography from '@atoms/Typography/Typography';

export interface SectionProps {
  /**
   * text content of the card
   */
  children: ReactNode;
  /**
   * id of the article card
   * and act as the ey of the root element
   */
  id: string;
  /**
   * section header text
   */
  headerText: string;
  mainContentRef: React.RefObject<Record<string, HTMLElement>>;
  /**
   * additional CSS classes
   */
  className?: string;
}

const Section = (props: SectionProps) => {
  const { id, children, headerText, mainContentRef, className = '' } = props;
  const handleSetupSectionRef = (ref: HTMLElement | null, id: string) => {
    if (mainContentRef.current && ref) {
      mainContentRef.current[id] = ref;
    }
  };
  return (
    <section
      ref={(el) => handleSetupSectionRef(el, id)}
      className={`mb-28 scroll-mt-24 ${className}`.trim()}
      aria-label={id}
      id={id}
    >
      <header className="relative pb-2 mb-6">
        <Typography
          id={`${id}-section-header-text`}
          variant="h2"
          className="text-2xl font-bold after:absolute after:bottom-0 after:left-0 after:h-0.75 after:w-7.5 after:rounded-[3px] after:bg-linear-to-r after:from-primary after:to-primary-deep after:content-['']"
          text={headerText}
        />
      </header>
      {children}
    </section>
  );
};

export default Section;
