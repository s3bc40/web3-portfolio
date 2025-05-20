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

export default function TechStackSection() {
  const updatedTechStack = [
    { name: "Python", icon: <PythonBrandSvg className="h-12 w-12" /> },
    {
      name: "Vyper",
      icon: <VyperBrandSvg className="h-12 w-12" />,
    },
    {
      name: "Moccasin",
      icon: <MoccasinBrandSvg className="h-12 w-12" />,
    },
    {
      name: "Solidity",
      icon: <SiSolidity className="h-12 w-12 fill-gray-300" />,
    },
    {
      name: "Foundry",
      icon: <FoundryBrandSvg className="h-12 w-12 fill-teal-500" />,
    },
    {
      name: "Typescript",
      icon: <SiTypescript className="h-12 w-12 fill-blue-600" />,
    },
    {
      name: "React",
      icon: <SiReact className="h-12 w-12 fill-blue-400" />,
    },
    {
      name: "Next.js",
      icon: <SiNextdotjs className="h-12 w-12" />,
    },
    {
      name: "Tailwind CSS",
      icon: <SiTailwindcss className="h-12 w-12 fill-blue-400" />,
    },
    {
      name: "Zsh",
      icon: <SiZsh className="h-12 w-12 fill-gray-300" />,
    },
    {
      name: "Linux",
      icon: <SiLinux className="h-12 w-12 fill-yellow-500" />,
    },
    {
      name: "Git",
      icon: <SiGit className="h-12 w-12 fill-orange-500" />,
    },
    {
      name: "GitHub",
      icon: <SiGithub className="h-12 w-12" />,
    },
    {
      name: "Rust",
      icon: <SiRust className="h-12 w-12" />,
    },
    {
      name: "VsCode",
      icon: <VscVscode className="h-12 w-12 fill-blue-600" />,
    },
  ];

  return (
    <section>
      <h2 className="mb-8 text-center text-4xl font-black text-yellow-400 md:text-6xl">
        Tech Stack
      </h2>
      <div className="grid max-w-5xl grid-cols-3 gap-6 md:grid-cols-5">
        {updatedTechStack.map((tech) => (
          <div
            key={tech.name}
            className="group relative flex cursor-pointer flex-col items-center transition-all duration-200 hover:scale-110"
          >
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 blur transition-opacity duration-200 group-hover:opacity-100"></div>
            <span className="relative flex h-20 w-20 items-center justify-center rounded-lg bg-gray-800 p-4 shadow-inner">
              {tech.icon}
            </span>
            <span className="relative mt-2 text-lg font-medium text-gray-300">
              {tech.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
