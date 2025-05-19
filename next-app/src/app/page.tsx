/**
 * Page component for the portfolio website.
 * @returns {JSX.Element} The main content of the page.
 * @description This component serves as the main entry point for the portfolio website, rendering a simple greeting message.
 */

import ProfileContainer from "@/app/components/ProfileContainer";

export default function Portfolio() {
  return (
    <div className="flex flex-col gap-2 p-6">
      {/* ProfileContainer */}
      <ProfileContainer />
    </div>
  );
}
