/**
 * Buttons component
 */

"use client";

import Link from "next/link";

/**
 * ButtonIcon props
 * @typedef {Object} ButtonProps
 * @property {Object} item - The button item object
 * @property {React.ReactNode} item.icon - The icon to be displayed in the button
 * @property {string} item.link - The link to be navigated to when the button is clicked
 * @property {string} item.name - The name of the button
 * @property {boolean} [showPing] - Flag to show ping animation
 * @property {boolean} [disabled] - Flag to disable the button
 * @property {string} [disabledText] - The text to be displayed when the button is disabled
 * @property {string} [twWidth] - The width of the button
 * @property {string} [twHeight] - The height of the button
 */
type ButtonProps = {
  item: {
    icon: React.ReactNode;
    link: string;
    name: string;
  };
  disabled?: boolean;
  disabledText?: string;
  twWidth?: string;
  twHeight?: string;
};

/**
 * ButtonIcon component
 * @param {ButtonProps} props - The props for the ButtonIcon component
 * @returns {JSX.Element} The ButtonIcon component
 * @description This component renders a button with an icon and a link. It also handles the disabled state and tooltip.
 */
export function ButtonIcon({
  item,
  disabled = false,
  disabledText = "Connect your wallet to donate",
  twWidth = "w-16",
  twHeight = "h-16",
}: ButtonProps) {
  return (
    <div
      key={item.name}
      className="group relative"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Button link */}
      <Link
        href={disabled ? "" : item.link}
        target="_blank"
        className={`flex ${twWidth} ${twHeight} items-center justify-center rounded-full transition duration-300 ease-in-out hover:scale-110 active:scale-110 ${
          disabled ? "cursor-not-allowed bg-gray-500" : "bg-teal-500"
        }`}
        style={{
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        {item.icon}
      </Link>
      {/* Tooltip for disabled button */}
      {disabled && (
        <div className="absolute bottom-0 left-1/2 mb-[-50px] w-max translate-x-[-50%] rounded bg-gray-800 p-2 text-white opacity-0 transition select-none group-hover:opacity-100 group-active:opacity-100">
          {disabledText}
        </div>
      )}
    </div>
  );
}
