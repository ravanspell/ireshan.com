export interface MenuItemProps {
  label: string;
  href: string;
}

const MenuItem = (props: MenuItemProps) => {
  const { label, href } = props;

  return (
    <li>
      <a
        href={href}
        className="
                text-foreground
                text-lg
                font-medium 
                transition-colors 
                transform 
                hover:text-primary 
                hover:scale-110 
                active:text-primary 
                mb-6"
      >
        {label}
      </a>
    </li>
  );
};

export default MenuItem;
