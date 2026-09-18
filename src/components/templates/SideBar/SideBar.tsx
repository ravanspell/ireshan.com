/**
 * Left side bar
 */
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import SocialLinks from '@organisms/SoclialLinks/SoclialLinks';
import NavBar from '@organisms/NavBar/NavBar';
import Typography from '@atoms/Typography/Typography';

const SideBar = () => {
  return (
    <aside
      id="sidebar"
      className="flex min-h-60 flex-col justify-between pt-10 lg:sticky lg:top-0 lg:max-h-screen lg:w-[40%] lg:py-24"
      aria-label="Main Navigation"
    >
      <div className="">
        <div className='flex flex-col gap-10'>
          <div>
            <Typography variant="h2" className="text-4xl font-bold mb-1" text="Ireshan Pathirana" />
            <Typography
              as="p"
              className="text-2xl text-muted-foreground font-light"
              text="AI Enginner @ Accenture"
            />
          </div>
          <NavBar />
        </div>
      </div>
      {/* social media links */}
      <div className="flex">
        <SocialLinks
          socialIconsOptions={[
            {
              title: 'gitHub',
              href: 'https://github.com/ravanspell',
              icon: faGithub,
            },
            {
              title: 'linkedin',
              href: 'https://www.linkedin.com/in/ireshan-pathirana',
              icon: faLinkedin,
            },
            {
              title: 'Email to Ireshan',
              href: 'mailto:ireshan.pathirana@outlook.com',
              icon: faEnvelope,
            },
          ]}
        />
      </div>
    </aside>
  );
};

export default SideBar;
