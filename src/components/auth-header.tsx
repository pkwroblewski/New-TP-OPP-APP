"use client";

import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  History,
  LogIn,
  FileUp,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Table,
  PieChart,
  AlertTriangle,
  Building2,
  Download,
  Home,
  ScrollText,
} from "lucide-react";
import Logo from "./logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function AuthHeader() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract extraction ID from pathname if we're on an extraction page
  const extractionMatch = pathname.match(/\/extraction\/([^/]+)/);
  const extractionId = extractionMatch ? extractionMatch[1] : null;

  // Navigation items for extraction pages
  const extractionNavItems: NavItem[] = extractionId
    ? [
        {
          label: "Summary",
          href: `/extraction/${extractionId}/summary`,
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          label: "Balance Sheet",
          href: `/extraction/${extractionId}/balance-sheet`,
          icon: <Table className="w-4 h-4" />,
        },
        {
          label: "P&L",
          href: `/extraction/${extractionId}/pnl`,
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: "IC Details",
          href: `/extraction/${extractionId}/ic-details`,
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: "Analysis",
          href: `/extraction/${extractionId}/analysis`,
          icon: <PieChart className="w-4 h-4" />,
        },
        {
          label: "Flags",
          href: `/extraction/${extractionId}/flags`,
          icon: <AlertTriangle className="w-4 h-4" />,
        },
        {
          label: "Company Details",
          href: `/extraction/${extractionId}/entity`,
          icon: <Building2 className="w-4 h-4" />,
        },
        {
          label: "Company Profile",
          href: `/extraction/${extractionId}/profile`,
          icon: <ScrollText className="w-4 h-4" />,
        },
        {
          label: "Export",
          href: `/extraction/${extractionId}/export`,
          icon: <Download className="w-4 h-4" />,
        },
      ]
    : [];

  // Get current section name
  const getCurrentSection = () => {
    if (!extractionId) return null;
    const section = pathname.split("/").pop();
    const item = extractionNavItems.find((nav) =>
      nav.href.endsWith(`/${section}`)
    );
    return item?.label || "Summary";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Logo href="/dashboard" size="sm" />

          {/* Section Navigation Dropdown (only on extraction pages) */}
          {extractionId && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span>{getCurrentSection()}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                  {extractionNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        pathname === item.href
                          ? "text-blue-400 bg-slate-700/50"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Navigation + User */}
        <div className="flex items-center gap-3">
          <SignedIn>
            {/* Dashboard link */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                pathname === "/dashboard"
                  ? "text-blue-400 bg-slate-800"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {/* New Extraction button */}
            <Link
              href="/analyze"
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                pathname === "/analyze"
                  ? "text-blue-400 bg-slate-800"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </Link>

            {/* History link */}
            <Link
              href="/history"
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                pathname === "/history"
                  ? "text-blue-400 bg-slate-800"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Link>

            <div className="w-px h-6 bg-slate-700" />

            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
