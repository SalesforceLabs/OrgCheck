import { X } from 'lucide-react';

type ModalCloseButtonProps = {
  onClick: () => void;
};

export default function ModalCloseButton({ onClick }: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      className="slds-button slds-button_icon slds-modal__close"
      title="Close"
      aria-label="Close"
      onClick={onClick}
    >
      <X width={14} height={14} aria-hidden="true" focusable="false" />
    </button>
  );
}
