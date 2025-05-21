import ProfileButtons from "@/app/components/ProfileButtons";
import AvatarCircle from "@/ui/AvatarCircle";
import { Heading1, Heading3, Body1 } from "@/ui/Typography";

/**
 * Container for the avatar and its description.
 * @returns {JSX.Element} The AvatarContainer component.
 * @description This component displays the avatar image with a gradient border and its description, including the title, subtitle, and a brief introduction.
 */
export default function ProfileSection() {
  return (
    <section className="flex flex-col items-center gap-4 md:flex-row md:items-center">
      {/* Avatar */}
      <AvatarCircle />
      {/* Avatar details */}
      <div className="flex max-w-sm flex-col gap-2 text-center lg:text-left">
        {/* Profile title */}
        <Heading1>s3bc40</Heading1>
        {/* Profile subtitle */}
        <Heading3>Smart Contract Developer & Security Researcher</Heading3>
        {/* Profile description */}
        <Body1>
          Your open-source developer and security researcher, specializing in
          smart contracts and blockchain technology &#x1F680;
        </Body1>
        {/* Profile btns */}
        <ProfileButtons />
      </div>
    </section>
  );
}
