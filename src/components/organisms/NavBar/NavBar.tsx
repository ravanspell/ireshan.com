import MainMenuItems from '@molecules/MainMenuItems/MainMenuItems';

const NavBar = () => {
  return (
    <nav
      className="
            fixed
            lg:relative
            p-5
            lg:p-0
            bottom-0
            left-0 
            backdrop-blur
            lg:backdrop-blur-none
            bg-popover/75
            lg:bg-transparent
            lg:rounded-none
            border
            lg:border-none
            border-border 
            w-full 
            flex 
            flex-wrap
            align-middle 
            z-50"
    >
      <ul className="flex lg:flex-col gap-8 lg:gap-3">
        <MainMenuItems
          menuItems={[
            {
              href: '#aboutme',
              label: 'About Me',
            },
            {
              href: '#experience',
              label: 'Experience',
            },
            {
              href: '#certifications',
              label: 'Certifications',
            },
          ]}
        />
      </ul>
    </nav>
  );
};

export default NavBar;
