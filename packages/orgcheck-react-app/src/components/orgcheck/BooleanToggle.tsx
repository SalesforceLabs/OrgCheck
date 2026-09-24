import { useId } from 'react';

type BooleanToggleProps = {
  checked: boolean;
  readOnly?: boolean;
  onChange?: (next: boolean) => void;
  title?: string;
};

function ToggleIcon({ checked }: { checked: boolean }) {
  return (
    <svg
      viewBox="0 0 52 32"
      width={22}
      height={14}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="2"
        width="48"
        height="28"
        rx="14"
        fill={checked ? '#2e844a' : '#aeaeae'}
      />
      <circle cx={checked ? 36 : 16} cy="16" r="10" fill="#ffffff" />
    </svg>
  );
}

export default function BooleanToggle({
  checked,
  readOnly = true,
  onChange,
  title,
}: BooleanToggleProps) {
  const label = checked ? 'True' : 'False';
  const caption = title ?? label;
  const interactive = Boolean(onChange) && !readOnly;

  if (!interactive) {
    return (
      <span
        className="orgcheck-boolean-toggle orgcheck-boolean-toggle_readonly"
        title={caption}
        role="img"
        aria-label={label}
      >
        <ToggleIcon checked={checked} />
      </span>
    );
  }

  return (
    <button
      type="button"
      className="slds-button slds-button_icon orgcheck-boolean-toggle"
      title={caption}
      aria-pressed={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
    >
      <ToggleIcon checked={checked} />
    </button>
  );
}

export function FormBooleanToggle({
  label,
  checked,
  readOnly = true,
  onChange,
}: {
  label: string;
  checked: boolean;
  readOnly?: boolean;
  onChange?: (next: boolean) => void;
}) {
  const id = useId();
  const interactive = Boolean(onChange) && !readOnly;

  return (
    <div className="slds-form-element slds-has-divider_bottom">
      <label className="slds-checkbox_toggle slds-grid" htmlFor={id}>
        <span className="slds-form-element__label slds-m-bottom_none">{label}</span>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={!interactive}
          onChange={event => {
            if (interactive) onChange?.(event.target.checked);
          }}
        />
        <span className="slds-checkbox_faux_container">
          <span className="slds-checkbox_faux" />
          <span className="slds-checkbox_off">Off</span>
          <span className="slds-checkbox_on">On</span>
        </span>
      </label>
    </div>
  );
}
