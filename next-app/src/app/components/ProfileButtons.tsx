"use client";

import { ButtonIcon } from "@/ui/Buttons";
import { SOCIAL_MEDIA_LINKS } from "@/utils/constants";
import {
  FaGithub,
  FaHeartCircleBolt,
  FaTelegram,
  FaXTwitter,
} from "react-icons/fa6";
import { useAccount } from "wagmi";

/**
 * ProfileButtons component
 * @description This component renders a set of social media buttons for a user profile.
 * It includes buttons for GitHub, Twitter, Telegram, and a donation button.
 * The buttons are displayed in a flex container and are styled with Tailwind CSS.
 * The donation button is disabled unless the user is connected to a wallet.
 * @returns {JSX.Element} The ProfileButtons component.
 */
export default function ProfileButtons() {
  const { isConnected } = useAccount();
  const { github, xTwitter, telegram } = SOCIAL_MEDIA_LINKS;

  const btnLinkList = [
    {
      icon: <FaGithub className="h-8 w-8 fill-white" />,
      link: github,
      name: "Github",
    },
    {
      icon: <FaXTwitter className="h-8 w-8 fill-white" />,
      link: xTwitter,
      name: "Twitter",
    },
    {
      icon: <FaTelegram className="h-8 w-8 fill-white" />,
      link: telegram,
      name: "Telegram",
    },
    {
      icon: <FaHeartCircleBolt className="h-8 w-8 fill-white" />,
      link: "/donate",
      name: "Donate",
    },
  ];

  return (
    <div className="mt-2 flex items-center justify-around">
      {btnLinkList.map((item) => (
        <ButtonIcon
          key={item.name}
          item={item}
          disabled={item.name == "Donate" ? !isConnected : false}
          target={item.name == "Donate" ? "_self" : "_blank"}
        />
      ))}
    </div>
  );
}
