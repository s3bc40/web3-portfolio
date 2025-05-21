"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import AvatarBrandSvg from "@/ui/svg/AvatarBrandSvg";
import { useEffect, useRef, useState } from "react";

/**
 * Navbar component
 * @returns {JSX.Element} Navbar component
 * @description This component is used to display the navbar on the top of the page
 * @example <Navbar />
 */
export default function Navbar() {
  const [showMessage, setShowMessage] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      setShowMessage(true);
    }, 1500);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const closeModal = () => {
    setShowMessage(false);
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <>
      <nav className="fixed z-20 flex w-full items-center justify-between gap-4 border-b-2 border-b-gray-500 bg-gray-800 p-4 select-none">
        {/* Icon top left */}
        <AvatarBrandSvg
          onTouchStart={startTimer}
          onTouchEnd={clearTimer}
          onMouseDown={startTimer}
          onMouseUp={clearTimer}
          onMouseLeave={clearTimer}
        />
        {/* Connect button wallet */}
        <ConnectButton />
      </nav>
      {/* Modal */}
      <div
        className={`${showMessage ? "z-50" : "-z-10 opacity-0"} fixed top-0 left-0 flex h-full w-full items-center justify-center bg-gray-600/90 transition-all`}
      >
        <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-800 p-8 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Make Patrick happy
          </h2>
          <p className="text-md text-gray-300 md:text-lg">
            Do not put your private key into the .env file!
          </p>
          <p className="text-2xl md:text-4xl">&#x1FAF5;</p>
          <button
            className="rounded bg-teal-500 px-4 py-2 font-bold text-white hover:bg-teal-600"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
