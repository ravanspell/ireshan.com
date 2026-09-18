import Typography from '@atoms/Typography/Typography';

export interface TagProps {
  id?: string;
  label: string;
}

const Tag = (props: TagProps) => {
  const { label, id = '' } = props;
  const tagId = id || `${label.toLowerCase().split(' ').join('-')}`;
  return (
    <div
      id={tagId}
      className="bg-secondary border border-border w-max px-3 py-1 flex items-center rounded-full"
      data-testid={tagId}
    >
      <Typography
        className="text-xs text-primary font-bold"
        id={`${tagId}-tag-label`}
        text={label}
        variant="label"
      />
    </div>
  );
};

export default Tag;
