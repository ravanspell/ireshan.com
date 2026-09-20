export interface CardProps {
  /**
   * text content of the card
   */
  children: React.ReactNode;
  /**
   * id of the text element
   * for unit tests and custom styles
   */
  id: string;
  /**
   * pass the custom styles
   */
  className?: string;
  /**
   * whether the whole card acts as one target
   * `false` drops the pointer cursor, for a card
   * whose only actions are the controls inside it
   */
  interactive?: boolean;
}

const Card = (props: CardProps) => {
  const { children, id, className = '', interactive = true } = props;
  return (
    <div
      id={id}
      className={`${className}
                group/panel
                relative
                p-px
                rounded-lg
                md:rounded-xl
                bg-card
                bg-linear-to-b
                from-border
                to-card
                ${interactive ? 'cursor-pointer' : ''}
                transition-all
                duration-200
                hover:shadow-md
                hover:bg-none
                hover:bg-border-stronger!`}
    >
      <div className="relative z-10 h-full w-full overflow-hidden rounded-[7px] bg-card p-4 sm:py-6 md:rounded-[11px]">
        {children}
      </div>
    </div>
  );
};

export default Card;
