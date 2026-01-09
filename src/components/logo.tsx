"use client";

import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ href = "/dashboard", size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-sm" },
    md: { icon: "w-8 h-8", text: "text-lg" },
    lg: { icon: "w-10 h-10", text: "text-xl" },
  };

  const logoContent = (
    <div className="flex items-center gap-2">
      {/* Logo Icon - Transfer Pricing stylized "TP" */}
      <div className={`${sizes[size].icon} relative`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background circle */}
          <circle cx="20" cy="20" r="18" className="fill-blue-600" />

          {/* T letter */}
          <path
            d="M10 12H22V15H18V28H14V15H10V12Z"
            className="fill-white"
          />

          {/* P letter */}
          <path
            d="M24 12H30C32.5 12 34 13.5 34 16C34 18.5 32.5 20 30 20H28V28H24V12ZM28 17H29C29.5 17 30 16.5 30 16C30 15.5 29.5 15 29 15H28V17Z"
            className="fill-white"
          />

          {/* Accent arrow (representing transfer) */}
          <path
            d="M32 24L36 28L32 32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-300"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold text-slate-100 ${sizes[size].text}`}>
            TP Extractor
          </span>
          <span className="text-[10px] text-slate-400 tracking-wide uppercase">
            Luxembourg
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center hover:opacity-90 transition-opacity"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
