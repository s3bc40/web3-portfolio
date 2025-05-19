/**
 * This file contains the typography components used in the application.
 * Each component is a styled heading or paragraph element with default Tailwind CSS classes.
 * The components are designed to be reusable and customizable with optional text color props.
 */

export function Heading1({
  children,
  twTextColor = "text-yellow-300",
}: {
  children: React.ReactNode;
  twTextColor?: string;
}) {
  return (
    <h1 className={`text-6xl font-black lg:text-8xl ${twTextColor}`}>
      {children}
    </h1>
  );
}

export function Heading2({
  children,
  twTextColor = "text-blue-300",
}: {
  children: React.ReactNode;
  twTextColor?: string;
}) {
  return (
    <h2 className={`text-2xl font-bold lg:text-4xl ${twTextColor}`}>
      {children}
    </h2>
  );
}

export function Body1({
  children,
  twTextColor = "text-gray-300",
}: {
  children: React.ReactNode;
  twTextColor?: string;
}) {
  return (
    <p className={`text-lg font-medium lg:text-xl ${twTextColor}`}>
      {children}
    </p>
  );
}
