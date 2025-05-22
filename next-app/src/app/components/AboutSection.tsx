import { Card } from "@/ui/Cards";
import {
  FaComputer,
  FaGear,
  FaCircleQuestion,
  FaUserCheck,
} from "react-icons/fa6";

/**
 * AboutSection component
 * @description A component that displays a section of information about the developer.
 * It includes cards with icons, titles, and descriptions.
 * @returns {JSX.Element} The rendered AboutSection component.
 */
export default function AboutSection() {
  const aboutItems = [
    {
      id: "whoami",
      title: "Who am I?",
      description:
        "I am a developer with a focus on smart contracts and security research. I love exploring new technologies and contributing to open-source projects.",
      icon: (
        <FaCircleQuestion className="fill-gray-300 text-4xl transition-transform group-hover:rotate-45 group-active:rotate-45" />
      ),
    },
    {
      id: "whatido",
      title: "What do I do?",
      description:
        "I specialize in smart contract development, security audits, and building decentralized applications (dApps). I also have experience with web development.",
      icon: (
        <FaComputer className="fill-gray-300 text-4xl transition-transform group-hover:scale-110 group-active:scale-110" />
      ),
    },
    {
      id: "howdoi",
      title: "How do I work?",
      description:
        "I follow best practices in software development, including version control and code reviews. I prioritize security and readability in my projects.",
      icon: (
        <FaGear className="fill-gray-300 text-4xl transition-transform group-hover:rotate-360 group-active:rotate-360" />
      ),
    },
    {
      id: "whychooseme",
      title: "Why choose me?",
      description:
        "I am dedicated to delivering high-quality work and ensuring the security of your projects. I am always eager to learn and adapt to new challenges.",
      icon: (
        <FaUserCheck className="fill-gray-300 text-4xl transition-transform group-hover:scale-x-[-1] group-active:scale-x-[-1]" />
      ),
    },
  ];
  return (
    <section
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      data-testid="about"
    >
      {aboutItems.map((item) => (
        <Card
          key={item.id}
          title={item.title}
          description={item.description}
          icon={item.icon}
        />
      ))}
    </section>
  );
}
