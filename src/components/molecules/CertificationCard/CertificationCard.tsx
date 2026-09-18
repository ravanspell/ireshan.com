import Image from 'next/image';
import Card from '@atoms/Card/Card';
import Typography from '@atoms/Typography/Typography';
import CustomLink from '../CustomLink/CustomLink';

export interface CertificationCardProps {
  id: string;
  name: string;
  shortDescription: string;
  certificationBadge: string;
  credentialsLink: string;
}

const CertificationCard = (props: CertificationCardProps) => {
  const { id, name, shortDescription, certificationBadge, credentialsLink } = props;
  return (
    <Card className="relative" id={`experience-card-${id}`}>
      <article
        key={`${id}-key`}
        id={id}
        className="grid grid-flow-row sm:grid-flow-col gap-x-10 gap-y-2 group"
      >
        <Image
          src={certificationBadge}
          alt="alt"
          width={95}
          height={95}
          className="grayscale-40 group-hover:grayscale-0 transition-grayscale duration-300"
        />
        <div className="flex flex-col gap-y-2 ">
          <h1>
            <CustomLink href={credentialsLink} name={name} useGroup external>
              <span className="absolute top-0 bottom-0 left-0 right-0" />
            </CustomLink>
          </h1>
          <Typography
            id="experience-description-3"
            className="text-muted-foreground text-md"
            as="p"
            text={shortDescription}
          />
        </div>
      </article>
    </Card>
  );
};

export default CertificationCard;
