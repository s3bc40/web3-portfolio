/**
 * Footer component for the application.
 * Displays copyright information and social media links.
 * @returns {JSX.Element} The footer component.
 */
import { Body2 } from "@/ui/Typography";
import { SOCIAL_MEDIA_LINKS } from "@/utils/constants";
import Link from "next/link";
import { FaGithub, FaSquareXTwitter, FaTelegram } from "react-icons/fa6";

export default function Footer() {
  const { github, xTwitter, telegram } = SOCIAL_MEDIA_LINKS;
  return (
    <footer className="bg-gray-800 py-4 text-gray-300">
      <div className="text-center">
        <Body2>
          &copy; {new Date().getFullYear()} s3bc40. All rights reserved.
        </Body2>
        <div className="mt-2 flex justify-center space-x-4">
          <Link href={github} target="_blank" rel="noopener noreferrer">
            <FaGithub className="h-6 w-6" />
          </Link>
          <Link href={xTwitter} target="_blank" rel="noopener noreferrer">
            <FaSquareXTwitter className="h-6 w-6" />
          </Link>
          <Link href={telegram} target="_blank" rel="noopener noreferrer">
            <FaTelegram className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
