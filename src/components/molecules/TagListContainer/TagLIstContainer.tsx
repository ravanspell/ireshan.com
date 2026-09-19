import Tag from '@atoms/Tag/Tag';
import { cn } from '@/lib/utils';

export interface TagListContainerProps {
  areaLabel: string;
  tagLabels: string[];
  /** Merged over the defaults, so a caller can drop the leading margin. */
  className?: string;
}

const TagListContainer = (props: TagListContainerProps) => {
  const { areaLabel, tagLabels, className } = props;
  const listId = `${areaLabel.toLowerCase().split(' ').join('-')}`;
  return (
    <ul id={listId} className={cn('mt-2 flex flex-wrap', className)} aria-label={areaLabel}>
      {tagLabels.map((label) => (
        <li key={`${listId}}-${label}`} className="mr-1.5 mt-2">
          <Tag label={label} />
        </li>
      ))}
    </ul>
  );
};

export default TagListContainer;
