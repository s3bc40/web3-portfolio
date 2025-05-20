import { Card } from "@/ui/Cards";
import {
  FaComputer,
  FaGear,
  FaCircleQuestion,
  FaUserCheck,
} from "react-icons/fa6";

export default function AboutContainer() {
  const aboutItems = [
    {
      id: "whoami",
      title: "Who am I?",
      description:
        "I am a passionate developer with a focus on smart contracts and security research. I love exploring new technologies and contributing to open-source projects.",
      icon: (
        <FaCircleQuestion className="fill-gray-300 text-4xl transition-transform group-hover:rotate-45 group-active:rotate-45" />
      ),
    },
    {
      id: "whatido",
      title: "What do I do?",
      description:
        "Proficient in Solidity, JavaScript, and Python. Experienced in smart contract development, security audits, and blockchain technology.",
      icon: (
        <FaComputer className="fill-gray-300 text-4xl transition-transform group-hover:scale-110 group-active:scale-110" />
      ),
    },
    {
      id: "howdoi",
      title: "How do I work?",
      description:
        "Blockchain technology, decentralized finance (DeFi), and security research.",
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {aboutItems.map((item) => (
        <Card
          key={item.id}
          title={item.title}
          description={item.description}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
