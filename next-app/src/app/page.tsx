/**
 * Page component for the portfolio website.
 * @returns {JSX.Element} The main content of the page.
 * @description This component serves as the main entry point for the portfolio website, rendering a simple greeting message.
 */

import Image from "next/image"

export default function Portfolio() {
  return (
    <div className="p-6">
      {/* AvatarContainer */}
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center">
        {/* Avatar */}
        <div className="relative h-60 w-60 lg:h-100 lg:w-100">
          {/* Avatar gradient border */}
          <div className="absolute inset-0 -z-10 animate-spin rounded-full bg-linear-45 from-yellow-500 via-teal-500 to-fuchsia-500 p-1"></div>
          <Image
            src={"/avatar.png"}
            alt="Avatar"
            width={300} // @dev handle quality too
            height={300} // @dev handle quality too
            className="relative h-60 w-60 rounded-full p-1 lg:h-100 lg:w-100"
          />
        </div>
        {/* Avatar descriptions */}
        <div className="flex max-w-sm flex-col gap-1.5 text-center lg:text-left">
          {/* Avatar title */}
          <h1 className="text-6xl font-black text-yellow-300 lg:text-8xl">
            s3bc40
          </h1>
          {/* Avatar subtitle */}
          <p className="text-2xl font-bold text-blue-300 lg:text-4xl">
            Smart Contract Developer & Security Researcher
          </p>
          <p className="text-lg font-medium text-gray-300 lg:text-xl">
            Your open-source developer and security researcher, specializing in
            smart contracts and blockchain technology &#x1F680;
          </p>
        </div>
      </div>
    </div>
  )
}
