import CourseCU from "@/app/components/CourseCU";
import { Heading2 } from "@/ui/Typography";
import Image from "next/image";
import Link from "next/link";

const certificationsData = [
  {
    id: "cert-itpv",
    src: "/cu-certifications/intro-python-vyper-smart-contract-development-completed.png",
    alt: "Introduction to Python and Vyper",
    link: "https://updraft.cyfrin.io/courses/intro-python-vyper-smart-contract-development",
    descriptionList: [
      "Learn the basics of Python and Vyper.",
      "Understand the fundamentals of smart contract development.",
      "Read and write simple smart contracts.",
      "Get familiar with Vyper syntax and features.",
      "Use Remix IDE to deploy to ZkSync.",
    ],
  },
  {
    id: "cert-ipv",
    src: "/cu-certifications/intermediate-python-vyper-smart-contract-development-completed.png",
    alt: "Intermediate Python and Vyper",
    link: "https://updraft.cyfrin.io/courses/intermediate-python-vyper-smart-contract-development",
    descriptionList: [
      "Deepen the knowledge of Python and Vyper.",
      "Implement complex smart contracts.",
      "Introduction to Web3.py and Titanoboa.",
      "Learn about testing Python and Vyper smart contracts.",
      "Deploy to ZkSync using Moccasin.",
    ],
  },
  {
    id: "cert-apvsmd",
    src: "/cu-certifications/advanced-python-vyper-smart-contract-development-completed.png",
    alt: "Advanced Python and Vyper Smart Contract Development",
    link: "https://updraft.cyfrin.io/courses/advanced-python-vyper-smart-contract-development",
    descriptionList: [
      "Build DeFi stablecoins and NFT.",
      "Learn about advanced testing techniques like fuzzing.",
      "Hashing signatures, upgrading contracts etc...",
      "Python algorithimic trading.",
      "Avanced use of Moccasin and Titanoboa.",
    ],
  },
  {
    id: "cert-fswdcc",
    src: "/cu-certifications/full-stack-web3-development-crash-course-completed.png",
    alt: "Full-Stack Web3 Development Crash Course",
    link: "https://updraft.cyfrin.io/courses/full-stack-web3-development-crash-course",
    descriptionList: [
      "Learn full-stack web3 development.",
      "Create a simple DApp using Next.js.",
      "Interact between frontend and contracts.",
      "Learn RainbowKit, Wagmi, Viem, and Tailwind.",
      "Create a NFT marketplace with rindexer and GraphQL.",
    ],
  },
  {
    id: "cert-sscd",
    src: "/cu-certifications/solidity-completed.png",
    alt: "Solidity Smart Contract Development",
    link: "https://updraft.cyfrin.io/courses/solidity",
    descriptionList: [
      "Learn the basics of Solidity.",
      "Understand the fundamentals of smart contract development.",
      "Read and write simple smart contracts.",
      "Get familiar with Solidity syntax and features.",
      "Use Remix IDE to deploy to ZkSync.",
    ],
  },
  {
    id: "cert-ff",
    src: "/cu-certifications/foundry-completed.png",
    alt: "Foundry Fundamentals",
    link: "https://updraft.cyfrin.io/courses/foundry",
    descriptionList: [
      "Learn the basics of Foundry.",
      "Test smart contracts using Foundry.",
      "Foundryup, Foundry Forge, and Anvil",
      "Get familiar with Foundry syntax and features.",
      "Learn about Chainlink oracle.",
    ],
  },
  {
    id: "cert-af",
    src: "/cu-certifications/advanced-foundry-completed.png",
    alt: "Advanced Foundry",
    link: "https://updraft.cyfrin.io/courses/advanced-foundry",
    descriptionList: [
      "Learn the advanced features of Foundry.",
      "Explore Fuzz testing with Foundry.",
      "Develop a stablecoin, a Defi, and a DAO",
      "Contract verification using Foundry.",
      "Introduction to security research.",
    ],
  },
  {
    id: "cert-bb",
    src: "/cu-certifications/blockchain-basics-completed.png",
    alt: "Blockchain Basics",
    link: "https://updraft.cyfrin.io/courses/blockchain-basics",
    descriptionList: [
      "Learn the basics of blockchain technology.",
      "Introduction to wallets, transactions, and blocks.",
      "Introduction to smart contracts, gas",
      "Introduction to signatures.",
      "Explore block explorers like Etherscan.",
    ],
  },
];

export default function CourseCuSection() {
  return (
    <section className="flex flex-col gap-6 text-center" data-testid="course">
      {/* Main title section */}
      <Heading2>Course completion</Heading2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Certification images */}
        {certificationsData.map(({ id, src, alt, link, descriptionList }) => (
          <CourseCU
            id={id}
            src={src}
            alt={alt}
            link={link}
            descriptionList={descriptionList}
            key={id}
          />
        ))}
      </div>
    </section>
  );
}
