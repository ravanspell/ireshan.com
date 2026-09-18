import Card from '@atoms/Card/Card';
import Typography from '@atoms/Typography/Typography';
import TagListContainer from '@molecules/TagListContainer/TagLIstContainer';
import CustomLink from '../CustomLink/CustomLink';

export interface ExperienceCardProps {
  /**
   * text content of the card
   */
  date: string;
  /**
   * id of the article card
   * and act as the ey of the root element
   */
  id: string;
  /**
   * Used technology tag labels
   */
  technologiesTagLabels: string[];
  companyName: string;
  designation: string;
  shortDescription: string;
  companyWebsiteLink: string;
}

const ExperienceCard = (props: ExperienceCardProps) => {
  const {
    date,
    id,
    technologiesTagLabels,
    companyName,
    shortDescription,
    designation,
    companyWebsiteLink,
  } = props;
  return (
    <Card className="group relative" id={`experience-card-${id}`}>
      <article
        key={`${id}-key`}
        id={id}
        className="grid grid-flow-row sm:grid-flow-col gap-x-10 gap-y-2"
      >
        <span>{date}</span>
        <div className="flex flex-col gap-y-2 ">
          <h1>
            <CustomLink
              href={companyWebsiteLink}
              name={companyName}
              useGroup external
            >
              <span className="absolute top-0 bottom-0 left-0 right-0" />
            </CustomLink>
          </h1>
          <h5 className="h5 timeline-item-title">
            {designation}
          </h5>
          <Typography
            id="experience-description-3"
            className="text-muted-foreground text-md"
            as="p"
            text={shortDescription}
          />
          <TagListContainer
            areaLabel={`technologies used in ${companyName}`}
            tagLabels={technologiesTagLabels}
          />
        </div>
      </article>
    </Card>
  );
};

export default ExperienceCard;
