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
  ariaLabel = "Cargando",
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
  size = 16,
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
      d="M7.5 8.5C7.5 6.843 8.843 5.5 10.5 5.5C12.157 5.5 13.5 6.843 13.5 8.5C13.5 10.157 12.157 11.5 10.5 11.5H9.5V17.5C9.5 18.328 8.828 19 8 19C7.172 19 6.5 18.328 6.5 17.5V9.5"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 8.5C16.5 6.843 15.157 5.5 13.5 5.5M16.5 8.5V17.5C16.5 18.328 15.828 19 15 19C14.172 19 13.5 18.328 13.5 17.5V13"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HeadbandGlyphIcon: React.FC<IconProps> = ({
  size = 16,
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
      d="M4 14V12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12V14"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="3"
      y="13"
      width="4"
      height="7"
      rx="2"
      stroke={color}
      strokeWidth="1.75"
    />
    <rect
      x="17"
      y="13"
      width="4"
      height="7"
      rx="2"
      stroke={color}
      strokeWidth="1.75"
    />
  </svg>
);

export const MinimizeIcon: React.FC<IconProps> = ({
  size = 14,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <line
      x1="3"
      y1="8"
      x2="13"
      y2="8"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({
  size = 14,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 4L12 12M12 4L4 12"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export interface SignalBarsIconProps extends IconProps {
  rssi?: number;
}

export const SignalBarsIcon: React.FC<SignalBarsIconProps> = ({
  size = 14,
  rssi = -60,
  className,
}) => {
  const bars =
    rssi >= -55 ? 4 : rssi >= -68 ? 3 : rssi >= -80 ? 2 : rssi >= -92 ? 1 : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="11"
        width="2"
        height="3"
        rx="0.5"
        fill={bars >= 1 ? "currentColor" : "var(--surface-border)"}
      />
      <rect
        x="5.5"
        y="8.5"
        width="2"
        height="5.5"
        rx="0.5"
        fill={bars >= 2 ? "currentColor" : "var(--surface-border)"}
      />
      <rect
        x="9"
        y="6"
        width="2"
        height="8"
        rx="0.5"
        fill={bars >= 3 ? "currentColor" : "var(--surface-border)"}
      />
      <rect
        x="12.5"
        y="3"
        width="2"
        height="11"
        rx="0.5"
        fill={bars >= 4 ? "currentColor" : "var(--surface-border)"}
      />
    </svg>
  );
};
