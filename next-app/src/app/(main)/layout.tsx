import Footer from "@/ui/Footer";
import Navbar from "@/ui/Navbar";

/**
 * Main layout component
 * @param {React.ReactNode} children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The layout component.
 * @description This component serves as the main layout for the application, including the navbar and footer.
 * By organizing your routes into groups, you can create a layout for the home page that does not include the
 * Navbar and Footer components, while the root layout includes them.
 */
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
