/**
 * Container for the avatar and its description.
 * @returns {JSX.Element} The AvatarContainer component.
 * @description This component displays the avatar image with a gradient border and its description, including the title, subtitle, and a brief introduction.
 */
import AvatarCircle from "@/ui/AvatarCircle";
import { Heading1, Heading2, Body1 } from "@/ui/Typography";
import Link from "next/link";
import {
  FaXTwitter,
  FaGithub,
  FaTelegram,
  FaHeartCircleBolt,
} from "react-icons/fa6";

export default function AvatarContainer() {
  const btnLinkList = [
    {
      icon: <FaXTwitter className="h-8 w-8 fill-white" />,
      link: "https://twitter.com/s3bc40",
      name: "Twitter",
    },
    {
      icon: <FaTelegram className="h-8 w-8 fill-white" />,
      link: "https://t.me/s3bc40",
      name: "Telegram",
    },
    {
      icon: <FaGithub className="h-8 w-8 fill-white" />,
      link: "https://github.com/s3bc40",
      name: "Github",
    },
    // @dev temporary we should add specific btn for this
    {
      icon: <FaHeartCircleBolt className="h-8 w-8 fill-white" />,
      link: "/",
      name: "Donate",
      disabled: true,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center">
      {/* Avatar */}
      <AvatarCircle />
      {/* Avatar details */}
      <div className="flex max-w-sm flex-col gap-2 text-center lg:text-left">
        {/* Avatar title */}
        <Heading1>s3bc40</Heading1>
        {/* Avatar subtitle */}
        <Heading2>Smart Contract Developer & Security Researcher</Heading2>
        {/* Avatar description */}
        <Body1>
          Your open-source developer and security researcher, specializing in
          smart contracts and blockchain technology &#x1F680;
        </Body1>
        {/* Avatar links */}
        {/* Button group socials */}
        <div className="mt-2 flex items-center justify-around">
          {/* Button link */}
          {btnLinkList.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              target="_blank"
              className={
                "flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 transition duration-300 ease-in-out hover:scale-110"
              }
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
