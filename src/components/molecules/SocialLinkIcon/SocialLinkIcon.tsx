/**
 * section component for hold section items
 */
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface SocialLinkIconProps {
  /**
   * text content of the card
   */
  icon: IconProp;
  /**
   * id of the social media icon
   * and act as the ey of the root element
   */
  id: string;
  /**
   * descriptive title to show when hover
   */
  title: string;
  /**
   * link to go
   */
  href: string;
}

const SocialLinkIcon = (props: SocialLinkIconProps) => {
  const { id, icon, title, href } = props;

  return (
    <a
      id={id}
      href={href}
      className="text-muted-foreground text-2xl transition-colors duration-700 ease-in-out hover:text-primary focus-visible:text-primary"
      title={title}
      target="_blank"
    >
      <FontAwesomeIcon icon={icon} />
    </a>
  );
};

export default SocialLinkIcon;
