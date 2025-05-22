"use client";

import Modal from "@/ui/Modal";

/**
 * EasterEggModal properties
 * @typedef {Object} EasterEggModalProps
 * @property {boolean} showEasterEgg - Determines if the Easter egg modal is visible or not.
 * @property {function} closeModal - Function to close the modal.
 */
type EasterEggModalProps = {
  showEasterEgg: boolean;
  closeModal: () => void;
};

/**
 * EasterEggModal component
 * @param {EasterEggModalProps} props - The properties for the EasterEggModal component.
 * @returns {JSX.Element} The EasterEggModal component.
 * @description This component displays a modal with an Easter egg message and a button to close it.
 */
export default function EasterEggModal({
  showEasterEgg,
  closeModal,
}: EasterEggModalProps) {
  return (
    <Modal showModal={showEasterEgg}>
      <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-800 p-8 text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Make Patrick happy
        </h2>
        <p className="text-md text-gray-300 md:text-lg">
          Do not put your private key into the .env file!
        </p>
        <p className="text-2xl md:text-4xl">&#x1FAF5;</p>
        <button
          className="rounded bg-teal-500 px-4 py-2 font-bold text-white hover:bg-teal-600"
          onClick={closeModal}
        >
          Okay!
        </button>
      </div>
    </Modal>
  );
}
