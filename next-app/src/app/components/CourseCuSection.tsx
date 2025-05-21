import { Heading2 } from "@/ui/Typography";
import Image from "next/image";
import Link from "next/link";

const certificationsData = [
  {
    id: "cert-itpv",
    src: "/cu-certifications/intro-python-vyper-smart-contract-development-completed.png",
    alt: "Introduction to Python and Vyper",
    link: "https://updraft.cyfrin.io/courses/intro-python-vyper-smart-contract-development",
  },
  {
    id: "cert-ipv",
    src: "/cu-certifications/intermediate-python-vyper-smart-contract-development-completed.png",
    alt: "Intermediate Python and Vyper",
    link: "https://updraft.cyfrin.io/courses/intermediate-python-vyper-smart-contract-development",
  },
  {
    id: "cert-apvsmd",
    src: "/cu-certifications/advanced-python-vyper-smart-contract-development-completed.png",
    alt: "Advanced Python and Vyper Smart Contract Development",
    link: "https://updraft.cyfrin.io/courses/advanced-python-vyper-smart-contract-development",
  },
  {
    id: "cert-fswdcc",
    src: "/cu-certifications/full-stack-web3-development-crash-course-completed.png",
    alt: "Full-Stack Web3 Development Crash Course",
    link: "https://updraft.cyfrin.io/courses/full-stack-web3-development-crash-course",
  },
  {
    id: "cert-sscd",
    src: "/cu-certifications/solidity-completed.png",
    alt: "Solidity Smart Contract Development",
    link: "https://updraft.cyfrin.io/courses/solidity",
  },
  {
    id: "cert-ff",
    src: "/cu-certifications/foundry-completed.png",
    alt: "Foundry Fundamentals",
    link: "https://updraft.cyfrin.io/courses/foundry",
  },
  {
    id: "cert-af",
    src: "/cu-certifications/advanced-foundry-completed.png",
    alt: "Advanced Foundry",
    link: "https://updraft.cyfrin.io/courses/advanced-foundry",
  },
  {
    id: "cert-bb",
    src: "/cu-certifications/blockchain-basics-completed.png",
    alt: "Blockchain Basics",
    link: "https://updraft.cyfrin.io/courses/blockchain-basics",
  },
];

export default function CourseCuSection() {
  return (
    <section className="flex flex-col gap-6 text-center">
      {/* Main title section */}
      <Heading2>Course completion</Heading2>
      <div className="grid grid-cols-1 place-items-center gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Certification images */}
        {certificationsData.map((cert) => (
          <div key={cert.id} className="group relative">
            <Image
              src={cert.src}
              alt={cert.alt}
              width={300}
              height={200}
              className="transition-opacity duration-300"
            />
            <div className="bg-opacity-70 absolute inset-0 flex items-center justify-center rounded-lg bg-gray-900 opacity-0 transition-opacity duration-300 group-hover:border-2 group-hover:border-teal-500 group-hover:opacity-100">
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="font-bold text-white">{cert.alt}</p>
                <Link
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-teal-500 px-4 py-2 font-bold text-white hover:bg-teal-600"
                >
                  Go to Course
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
