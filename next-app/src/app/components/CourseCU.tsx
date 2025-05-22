"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaCheck } from "react-icons/fa";

type CourseCUProps = {
  id: string;
  src: string;
  alt: string;
  link: string;
  descriptionList?: string[];
};

/**
 * CourseCU component displays a course completion image with a link.
 * @param {CourseCUProps} props - The properties for the CourseCU component.
 * @returns {JSX.Element} The CourseCU component.
 * @description This component displays an image representing a course completion badge. When hovered, it shows a link to the course.
 */
export default function CourseCU({
  id,
  src,
  alt,
  link,
  descriptionList,
}: CourseCUProps) {
  const [isActive, setIsActive] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  function handleTouch() {
    setIsActive((prev) => !prev);
  }

  useEffect(() => {
    function handleTouchOutside(e: TouchEvent) {
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setIsActive(false);
      }
    }

    document.addEventListener("touchstart", handleTouchOutside);
    return () => {
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, [divRef]);

  return (
    <div key={id} className="group relative" ref={divRef}>
      <Image
        src={src}
        alt={alt}
        width={300}
        height={200}
        className="h-auto w-auto transition-opacity duration-300"
        priority
        onTouchStart={handleTouch}
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-around gap-1.5 rounded-lg border-2 border-teal-500 bg-gray-900 transition-opacity duration-300 select-none ${isActive ? "opacity-100" : "opacity-0"} p-3 group-hover:opacity-100`}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleTouch}
      >
        {/* Description list */}
        <div className="flex flex-col gap-3.5" role="list">
          {descriptionList?.map((item, index) => (
            <div key={index} className="flex gap-2">
              <FaCheck className="h-4 w-4 shrink-0 text-teal-500" />
              <p className="text-start text-sm text-white">{item}</p>
            </div>
          ))}
        </div>
        {/* Course link */}
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-teal-500 px-4 py-2 font-bold text-white hover:bg-teal-600"
          onTouchEnd={(e) => isActive && e.preventDefault()}
        >
          Go to Course
        </Link>
      </div>
    </div>
  );
}
