// This component is a Server Component by default in the App Router.
import DonateClient from "@/app/donate/components/DonateClient";

/**
 * Donate page (Server Component)
 * @description Serves as the main page for the donation section. It handles the overall
 * static layout and renders the interactive DonateClient component.
 * @returns {JSX.Element} The rendered Donate page with its client-side interactions.
 */
export default function Donate() {
  return (
    <div className="font-inter flex min-h-screen w-full flex-col items-center justify-center bg-gray-900 p-4 text-white">
      {/* The DonateClient component contains all client-side logic and UI */}
      <DonateClient />
    </div>
  );
}
