/**
 * Typography component for rendering text with semantic HTML and consistent styling
 */
import { ElementType, JSX, ReactNode } from 'react';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'label';

type TypographyElement = keyof Pick<
  JSX.IntrinsicElements,
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'strong'
  | 'em'
  | 'mark'
  | 'small'
  | 'code'
  | 'kbd'
  | 'time'
  | 'abbr'
  | 'cite'
  | 'del'
  | 'ins'
  | 'q'
  | 'blockquote'
  | 'figcaption'
>;

interface TypographyProps {
  variant?: TypographyVariant;
  as?: TypographyElement;
  text?: string;
  children?: ReactNode;
  className?: string;
  id?: string;
  dateTime?: string;
  title?: string;
  cite?: string;
  role?: string;
}

const getDefaultElement = (variant: TypographyVariant): TypographyElement => {
  const map: Record<TypographyVariant, TypographyElement> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body: 'p',
    caption: 'figcaption',
    label: 'span',
  };
  return map[variant] || 'div';
};

const Typography = ({
  variant,
  as,
  text,
  children,
  className = '',
  id,
  dateTime,
  title,
  cite,
  role,
  ...rest
}: TypographyProps) => {
  // Determine effective variant (support legacy type)
  const effectiveVariant = variant || 'body';
  // Determine HTML element to render
  const element = as || getDefaultElement(effectiveVariant);
  const Component = element as ElementType;

  // Combine text and children
  const content = children || text;

  // Semantic attributes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const semanticProps: Record<string, any> = {};
  if (element.startsWith('h')) {
    const level = parseInt(element[1]);
    if (!isNaN(level)) semanticProps['aria-level'] = level;
  }
  if (element === 'time' && dateTime) semanticProps.dateTime = dateTime;
  if (title) semanticProps.title = title;
  if (cite && ['q', 'blockquote', 'cite'].includes(element)) semanticProps.cite = cite;
  if (role) semanticProps.role = role;

  // Build className
  const finalClassName = ['typography-' + (variant || 'body'), className]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <Component {...rest} {...semanticProps} className={finalClassName} id={id}>
      {content}
    </Component>
  );
};

export default Typography;
