/**
 * About me section
 */
import { RefObject } from 'react';
import Typography from '@atoms/Typography/Typography';
import Section from '@molecules/Section/Section';

type AboutMeSectionProps = {
  mainContentRef: RefObject<Record<string, HTMLElement>>;
};

const AboutMeSection = ({ mainContentRef }: AboutMeSectionProps) => {
  return (
    <Section headerText="About Me" id="aboutme" mainContentRef={mainContentRef}>
      <article>
        <Typography
          variant="body"
          as="p"
          className="text-muted-foreground mb-4"
          text={`I’m a Senior Software Engineer with over six years of experience building modern, scalable applications and delivering high-quality software.
              I love "simplicity", solutions that are easy to use yet powerful enough to solve real problems with clarity and efficiency.`}
        />
        <Typography
          id="this is id"
          variant="body"
          as="p"
          className="text-muted-foreground mb-4"
          text="Curiosity drives me. I'm always exploring new technologies, experimenting with workflows, and refining my skills to approach challenges with fresh perspectives. 
                        For me, great engineering is about more than writing code, it's about crafting solutions that truly work, last, and make an impact. I enjoy bringing ideas to life in ways that are elegant, practical, and easy to use."
        />
        <Typography
          variant="body"
          as="p"
          className="text-muted-foreground mb-4"
          text="I enjoy working closely with teams, exchanging ideas, and collaborating across different disciplines, because it helps me ensure that every project is not only functional but also thoughtfully designed and impactful."
        />

        <Typography
          variant="body"
          as="p"
          className="text-muted-foreground mb-4"
          text="Outside of work, I enjoy traveling the world, seeking new experiences, perspectives, and inspiration that I often bring back into my work and life."
        />
      </article>
    </Section>
  );
};

export default AboutMeSection;
