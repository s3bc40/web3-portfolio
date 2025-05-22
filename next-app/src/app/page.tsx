/**
 * Page component for the portfolio website.
 * @returns {JSX.Element} The main content of the page.
 * @description This component serves as the main entry point for the portfolio website, rendering a simple greeting message.
 */

import AboutSection from "@/app/components/AboutSection";
import CourseCUSection from "@/app/components/CourseCuSection";
import ProfileSection from "@/app/components/ProfileSection";
import TechStackSection from "@/app/components/TechStackSection";

export default function Portfolio() {
  return (
    <div className="flex flex-col items-center gap-12 px-8 pt-32 pb-16">
      {/* ProfileContainer */}
      <ProfileSection />
      {/* About section */}
      <AboutSection />
      {/* TechStack section */}
      <TechStackSection />
      {/* Certfication CU section */}
      <CourseCUSection />
    </div>
  );
}
