import type { SVGProps } from 'react'

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'camera'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'clock'
  | 'gear'
  | 'user'
  | 'minus'
  | 'plus'
  | 'spark'
  | 'trash'
  | 'x'

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {name === 'arrow-left' ? <path d="m15 18-6-6 6-6" /> : null}
      {name === 'arrow-right' ? <path d="m9 18 6-6-6-6" /> : null}
      {name === 'camera' ? (
        <>
          <path d="M4.5 7.5h3l1.25-2h6.5l1.25 2h3A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V9a1.5 1.5 0 0 1 1.5-1.5Z" />
          <circle cx="12" cy="13.5" r="3.25" />
        </>
      ) : null}
      {name === 'calendar' ? (
        <>
          <rect height="17" rx="2.5" width="18" x="3" y="4.5" />
          <path d="M8 2.75v3.5M16 2.75v3.5M3 9.5h18" />
        </>
      ) : null}
      {name === 'check' ? <path d="m5 12 4.25 4.25L19 6.5" /> : null}
      {name === 'chevron-down' ? <path d="m6 9 6 6 6-6" /> : null}
      {name === 'clock' ? (
        <>
          <circle cx="12" cy="12" r="8.75" />
          <path d="M12 7v5l3.25 2" />
        </>
      ) : null}
      {name === 'gear' ? (
        <>
          <path d="m12 3 1.2 1.9 2.25.45.55 2.2 1.9 1.2-.75 2.15.75 2.15-1.9 1.2-.55 2.2-2.25.45L12 21l-1.2-1.9-2.25-.45-.55-2.2-1.9-1.2.75-2.15-.75-2.15 1.9-1.2.55-2.2 2.25-.45L12 3Z" />
          <circle cx="12" cy="12" r="2.75" />
        </>
      ) : null}
      {name === 'user' ? (
        <>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M4.5 20c.8-3.3 3.3-5 7.5-5s6.7 1.7 7.5 5" />
        </>
      ) : null}
      {name === 'minus' ? <path d="M5 12h14" /> : null}
      {name === 'plus' ? <path d="M12 5v14M5 12h14" /> : null}
      {name === 'spark' ? (
        <path d="m12 2 1.45 6.55L20 10l-6.55 1.45L12 18l-1.45-6.55L4 10l6.55-1.45L12 2ZM19 16l.55 2.45L22 19l-2.45.55L19 22l-.55-2.45L16 19l2.45-.55L19 16Z" />
      ) : null}
      {name === 'trash' ? (
        <>
          <path d="M4.5 7.5h15M9 7.5V5.25h6V7.5M7 7.5l.65 12h8.7L17 7.5M10 11v5M14 11v5" />
        </>
      ) : null}
      {name === 'x' ? <path d="m6 6 12 12M18 6 6 18" /> : null}
    </svg>
  )
}
