import * as React from "react";

export function YoutubeIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function BehanceIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M22 7h-7v2h7V7zm1.726 10c-.442 1.297-2.029 3-4.726 3-3.033 0-5-2.062-5-5.234 0-3.084 1.942-5.266 4.908-5.266 3.078 0 4.793 2.181 4.793 5.437v.864h-7.669c.123 1.834 1.346 2.8 2.968 2.8 1.488 0 2.375-.705 2.726-1.601h2zm-4.726-5.5c-1.579 0-2.482.973-2.634 2.344h5.275c-.139-1.428-1.074-2.344-2.641-2.344zM8.008 13.5c1.439 0 2.492-.686 2.492-2.193 0-1.283-.872-1.907-2.128-1.907H4v4.1h4.008zm.244 5.5c1.691 0 2.748-.77 2.748-2.396 0-1.464-.997-2.204-2.527-2.204H4V19h4.252zM1 6h7.457c3.167 0 5.176 1.425 5.176 3.864 0 1.547-.796 2.754-2.146 3.393 1.761.642 2.763 2.101 2.763 3.99 0 2.812-2.192 4.253-5.462 4.253H1V6z" />
    </svg>
  );
}

export function LinkedinIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m1.37 9.74v-8.37H5.1v8.37h2.73z" />
    </svg>
  );
}

export function GithubIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function DribbbleIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7.93 9.07c-2.45-.44-4.82-.41-7.07.08-.18-.43-.38-.85-.59-1.27 2.87-1.37 5.25-1.46 7.66-1.19zM12 3.93c2.05 0 3.93.76 5.37 2.01-2.18-.2-4.32-.08-6.9 1.15-1.36-2.45-2.61-4.04-3.72-5.11 1.54-.76 3.34-1.19 5.25-1.19zm-7.09 3.2c.98.92 2.16 2.42 3.49 4.75C6.18 12.63 4.1 13.06 2.18 13.1c.14-2.28 1.06-4.33 2.73-5.97zm-1.04 7.84c1.9-.03 3.97-.44 6.22-1.22.48.97.94 1.94 1.37 2.9-3.21 1.77-5.96 1.45-7.59 1.14v-2.82zm8.13 5.1c-1.9 0-3.64-.66-5.02-1.78 1.44.22 3.86.37 6.74-1.24.81 2.09 1.44 3.91 1.87 5.24-1.13.5-2.37.78-3.59.78zm5.4-2.07c-.41-1.26-1.01-3.02-1.78-5.03 1.97-.47 4.09-.54 6.32-.17-.46 2.37-1.97 4.35-3.96 5.48z" />
    </svg>
  );
}

export function MailIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function TiktokIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function NaverIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
    </svg>
  );
}

/* Tool Icons for Designer Proficiency Progress Bars */
export function FigmaIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" fill="#F24E1E" />
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" fill="#FF7262" />
      <path d="M12 9H8.5a3.5 3.5 0 1 0 0 7H12V9z" fill="#A259FF" />
      <path d="M5 19.5A3.5 3.5 0 0 0 8.5 23a3.5 3.5 0 0 0 3.5-3.5V16H8.5A3.5 3.5 0 0 0 5 19.5z" fill="#0ACF83" />
      <path d="M12 12.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0z" fill="#1ABCFE" />
    </svg>
  );
}

export function ProtopieIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <circle cx="12" cy="12" r="10" fill="#FF4156" />
      <path d="M12 6v6l4.5 4.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function AdobeCcIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <rect width="20" height="20" x="2" y="2" rx="4" fill="#FF0000" />
      <path d="M7 6h3.5l4.5 12h-2.5l-1-2.8H8.5L7.5 18H5.2L7 6zm3.9 7-1.4-4-1.4 4h2.8z" fill="#FFFFFF" />
      <path d="M15 11c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5c-.8 0-1.5-.4-1.8-1h1.5c.2.2.4.3.7.3.7 0 1.1-.5 1.1-1.3 0-.8-.4-1.3-1.1-1.3-.4 0-.7.2-.9.5h-1.1c.3-1 1-1.7 2.1-1.7z" fill="#FFFFFF" />
    </svg>
  );
}

export function BlenderIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12.5 10.2c-2.4 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3-1.9-4.3-4.3-4.3zm0 6.2c-1 0-1.9-.8-1.9-1.9s.8-1.9 1.9-1.9 1.9.8 1.9 1.9-.8 1.9-1.9 1.9z" fill="#EA7600" />
      <path d="M12.5 5.5c-4.9 0-8.9 4-8.9 8.9 0 1.2.2 2.3.7 3.3L1.5 19l1.6 1.6 4.2-2.1c1.5 1 3.3 1.6 5.2 1.6 4.9 0 8.9-4 8.9-8.9s-4-5.7-8.9-5.7zm0 13c-1.3 0-2.6-.4-3.7-1l-.5-.3-2.3 1.2 1.2-2.3-.3-.5c-.7-1.1-1-2.4-1-3.7 0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5-2.9 6.3-6.4 6.3z" fill="#265787" />
    </svg>
  );
}

export function ReactIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} {...props}>
      <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="#00D8FF" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)" stroke="#00D8FF" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)" stroke="#00D8FF" />
      <circle cx="12" cy="12" r="1.8" fill="#00D8FF" />
    </svg>
  );
}
