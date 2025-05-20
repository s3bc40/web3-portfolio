/**
 * Page component for the portfolio website.
 * @returns {JSX.Element} The main content of the page.
 * @description This component serves as the main entry point for the portfolio website, rendering a simple greeting message.
 */

import AboutContainer from "@/app/components/AboutContainer";
import ProfileContainer from "@/app/components/ProfileContainer";

export default function Portfolio() {
  return (
    <div className="flex flex-col items-center gap-12 p-6">
      {/* ProfileContainer */}
      <ProfileContainer />
      {/* About section */}
      <AboutContainer />
    </div>
  );
}
