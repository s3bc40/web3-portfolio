import MoccasinBrandSvg from "@/ui/svg/MoccasinBrandSvg";
import VyperBrandSvg from "@/ui/svg/VyperBrandSvg";
import PythonBrandSvg from "@/ui/svg/PythonBrandSvg";
import FoundryBrandSvg from "@/ui/svg/FoundryBrandSvg";
import {
  SiLinux,
  SiNextdotjs,
  SiReact,
  SiSolidity,
  SiTailwindcss,
  SiTypescript,
  SiGit,
  SiGithub,
  SiZsh,
  SiRust,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import TechStackItem from "@/app/components/TechStackItem";
import { Heading2 } from "@/ui/Typography";

/**
 * TechStackSection component
 * @description A component that displays a section of technology stacks with icons and labels.
 * @returns {JSX.Element} The rendered TechStackSection component.
 */
export default function TechStackSection() {
  const twIconSize = "h-12 w-12";
  // List of technologies I have worked with.
  const techStackList = [
    { label: "Python", icon: <PythonBrandSvg className={twIconSize} /> },
    {
      label: "Vyper",
      icon: <VyperBrandSvg className={twIconSize} />,
    },
    {
      label: "Moccasin",
      icon: <MoccasinBrandSvg className={twIconSize} />,
    },
    {
      label: "Solidity",
      icon: <SiSolidity className={`${twIconSize} fill-gray-300`} />,
    },
    {
      label: "Foundry",
      icon: <FoundryBrandSvg className={`${twIconSize} fill-teal-500`} />,
    },
    {
      label: "Typescript",
      icon: <SiTypescript className={`${twIconSize} fill-blue-600`} />,
    },
    {
      label: "React",
      icon: <SiReact className={`${twIconSize} fill-blue-400`} />,
    },
    {
      label: "Next.js",
      icon: <SiNextdotjs className={twIconSize} />,
    },
    {
      label: "Tailwind CSS",
      icon: <SiTailwindcss className={`${twIconSize} fill-blue-400`} />,
    },
    {
      label: "Zsh",
      icon: <SiZsh className={`${twIconSize} fill-gray-300`} />,
    },
    {
      label: "Linux",
      icon: <SiLinux className={`${twIconSize} fill-yellow-500`} />,
    },
    {
      label: "Git",
      icon: <SiGit className={`${twIconSize} fill-orange-500`} />,
    },
    {
      label: "GitHub",
      icon: <SiGithub className={twIconSize} />,
    },
    {
      label: "Rust",
      icon: <SiRust className={twIconSize} />,
    },
    {
      label: "VsCode",
      icon: <VscVscode className={`${twIconSize} fill-blue-600`} />,
    },
  ];

  return (
    <section
      className="flex flex-col gap-6 text-center"
      data-testid="tech-stack"
    >
      <Heading2>Tech Stack</Heading2>
      <div className="grid max-w-5xl grid-cols-3 gap-6 md:grid-cols-5">
        {techStackList.map(({ label, icon }) => (
          <TechStackItem label={label} icon={icon} key={label} />
        ))}
      </div>
    </section>
  );
}
