/**
 * Navbar component
 * @returns {JSX.Element} Navbar component
 * @description This component is used to display the navbar on the top of the page
 * @example <Navbar />
 */

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import AvatarBrandSvg from "@/ui/svg/AvatarBrandSvg";

export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between gap-4 border-b-2 border-b-gray-500 bg-gray-800 p-4">
      {/* Icon top left */}
      <Link href="/">
        <AvatarBrandSvg />
      </Link>
      {/* Connect button wallet */}
      <ConnectButton />
    </nav>
  );
}
