import React from "react";

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export const ChargingBoltIcon: React.FC<IconProps> = ({
  size = 12,
  color = "var(--ok)",
  ariaLabel = "Charging",
}) => (
  <svg
    width={size}
    height={size + 2}
    viewBox="0 0 12 14"
    fill="none"
    aria-label={ariaLabel}
  >
    <path
      d="M7 1L2 8H6L5 13L10 6H6L7 1Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
    />
  </svg>
);

export const NoiseCancellationIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="10"
      cy="12"
      r="5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M17.5 8.5C19 10 19 14 17.5 15.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M16 7L21 17"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const TransparencyModeIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="9.5"
      cy="12"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M16.5 8.5C18.2 10.2 18.2 13.8 16.5 15.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M19.5 6.5C22 9.5 22 14.5 19.5 17.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const AdaptiveModeIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="adaptiveWaveGrad" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="var(--accent)" />
        <stop offset="100%" stopColor="var(--ok)" />
      </linearGradient>
    </defs>
    <path
      d="M4 12V10M8 15V9M12 18V6M16 15V9M20 13V11"
      stroke="url(#adaptiveWaveGrad)"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const OffModeIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="7"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const EarbudsGlyphIcon: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8 9.5C8 7.567 9.567 6 11.5 6H12.5C14.433 6 16 7.567 16 9.5V15.5C16 17.433 14.433 19 12.5 19H11.5C9.567 19 8 17.433 8 15.5V9.5Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 11H16"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle cx="12" cy="15" r="1" fill={color} />
  </svg>
);
