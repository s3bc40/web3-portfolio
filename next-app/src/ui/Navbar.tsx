"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import AvatarBrandSvg from "@/ui/svg/AvatarBrandSvg";
import { useEffect, useRef, useState } from "react";
import EasterEggModal from "@/app/components/modal/EasterEggModal";
import Link from "next/link";

/**
 * Navbar component
 * @returns {JSX.Element} Navbar component
 * @description This component is used to display the navbar on the top of the page
 * @example <Navbar />
 */
export default function Navbar() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function startTimer(): void {
    timerRef.current = setTimeout(() => {
      setShowEasterEgg(true);
    }, 800);
  }

  function clearTimer(): void {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }

  function closeModal(): void {
    setShowEasterEgg(false);
  }

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <>
      <nav className="fixed z-20 flex w-full items-center justify-between gap-4 border-b-2 border-b-gray-500 bg-gray-800 p-4 select-none">
        {/* Icon top left */}
        <Link href={"/"} rel="noopener noreferrer">
          <AvatarBrandSvg
            onTouchStart={startTimer}
            onTouchEnd={clearTimer}
            onMouseDown={startTimer}
            onMouseUp={clearTimer}
            onMouseLeave={clearTimer}
          />
        </Link>
        {/* Connect button wallet */}
        <ConnectButton />
      </nav>
      {/* Easter egg Modal */}
      <EasterEggModal showEasterEgg={showEasterEgg} closeModal={closeModal} />
    </>
  );
}
