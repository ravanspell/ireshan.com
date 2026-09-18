import Image from 'next/image';

export interface ProfileImageProps {
  /**
   * link to the profile image
   */
  src: string;
  id: string;
}

const ProfileImage = (props: ProfileImageProps) => {
  const { src, id } = props;
  return (
    <div
      id={id}
      className="relative bg-secondary border border-border p-3 rounded-full h-9 w-9"
    >
      <Image
        fill
        src={src}
        alt="Profile Avatar"
        className="rounded-full h-full w-full object-cover grayscale-25 hover:grayscale-0 transition-grayscale duration-300"
      />
    </div>
  );
};

export default ProfileImage;
