import Image from "next/image";

/**
 * Props for the AvatarCircle component.
 * @typedef {Object} AvatarCircleProps
 * @property {boolean} [showBorder=true] - Whether to show the gradient border around the avatar.
 * @property {string} [twAvatarWidth="w-60"] - Tailwind CSS class for the avatar width.
 * @property {string} [twAvatarHeight="h-60"] - Tailwind CSS class for the avatar height.
 * @property {string} [twLgAvatarWidth="lg:w-100"] - Tailwind CSS class for the large avatar width.
 * @property {string} [twLgAvatarHeight="lg:h-100"] - Tailwind CSS class for the large avatar height.
 */
type AvatarCircleProps = {
  showBorder?: boolean;
  twAvatarWidth?: string;
  twAvatarHeight?: string;
  twLgAvatarWidth?: string;
  twLgAvatarHeight?: string;
};

/**
 * AvatarCircle component that displays a circular avatar with an optional gradient border.
 * @param {AvatarCircleProps} props - The props for the AvatarCircle component.
 * @returns {JSX.Element} The AvatarCircle component.
 * @description This component displays a circular avatar image with an optional gradient border.
 * The size of the avatar can be customized using Tailwind CSS classes.
 */
export default function AvatarCircle({
  showBorder = true,
  twAvatarWidth = "w-60",
  twAvatarHeight = "h-60",
  twLgAvatarWidth = "lg:w-100",
  twLgAvatarHeight = "lg:h-100",
}: AvatarCircleProps) {
  // Initial values for avatar width and height
  // These values are used to set the size of the avatar image
  const avatarWidth = `${twAvatarWidth} ${twLgAvatarWidth}`;
  const avatarHeight = `${twAvatarHeight} ${twLgAvatarHeight}`;

  return (
    <div className={`relative ${avatarWidth} ${avatarHeight}`}>
      {/* Avatar gradient border */}
      {showBorder && (
        <div className="absolute inset-0 -z-10 animate-spin rounded-full bg-linear-45 from-yellow-500 via-teal-500 to-fuchsia-500 p-1"></div>
      )}
      {/* Avatar image */}
      <Image
        src={"/avatar.png"}
        alt="Avatar"
        width={300} // @dev handle quality too
        height={300} // @dev handle quality too
        priority
        className={`relative rounded-full p-1 ${avatarWidth} ${avatarHeight}`}
      />
    </div>
  );
}
