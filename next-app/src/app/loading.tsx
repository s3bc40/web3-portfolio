/**
 * Loading component for the Next.js application.
 * @description This component is displayed while the page is loading.
 * It includes a spinner and a loading message.
 * @returns {JSX.Element} The rendered Loading component.
 */
export default function Loading() {
  return (
    <div className="z-50 flex h-screen w-full items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center justify-center gap-4 text-white">
        <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-teal-500"></div>
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    </div>
  );
}
