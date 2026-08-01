interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

export function InstagramIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
      <path d="M14 9.5V7.8c0-.7.5-.9 1-.9h1.6V4h-2.4c-2.6 0-3.7 1.7-3.7 3.6v1.9H8.7v3H10.5V20h3.5v-7.5h2.3l.4-3h-2.7Z" />
    </svg>
  );
}
