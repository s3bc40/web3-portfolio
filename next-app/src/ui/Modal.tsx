/**
 * Modal properties
 * @typedef {Object} ModalProps
 * @property {boolean} showModal - Determines if the modal is visible or not.
 * @property {React.ReactNode} [children] - The content to be displayed inside the modal.
 */
type ModalProps = {
  showModal: boolean;
  children?: React.ReactNode;
};

/**
 * Modal component
 * @param {ModalProps} props - The properties for the Modal component.
 * @returns {JSX.Element} The Modal component.
 * @description This component displays a modal with a background overlay and content inside.
 */
export default function Modal({ showModal, children }: ModalProps) {
  return (
    <div
      className={`${showModal ? "z-50" : "-z-10 opacity-0"} fixed top-0 left-0 flex h-full w-full items-center justify-center bg-gray-600/90 transition-all`}
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-800 p-8">
        {children}
      </div>
    </div>
  );
}
