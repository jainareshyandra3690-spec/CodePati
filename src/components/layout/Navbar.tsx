"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  label: string;
  href: string;
}

// Primary navigation restricted strictly to major destinations:
// CodePati | Programs | Categories | Search | Authentication
const navItems: NavItem[] = [
  { label: "Programs", href: "/programs" },
  { label: "Categories", href: "/categories" },
  { label: "Search", href: "/search" },
];

export function Navbar({ initialSession }: { initialSession?: Session | null }) {
  const { data: clientSession } = useSession();
  const session = clientSession ?? initialSession;
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  const router = useRouter();
  const pathname = usePathname();
  const [navSearch, setNavSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavbarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = navSearch.trim().replace(/\s+/g, " ");
    const target = normalized
      ? `/search?q=${encodeURIComponent(normalized)}`
      : "/search";
    setMobileMenuOpen(false);
    router.push(target);
  };

  const isNavItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: CodePati Logo & Primary Navigation */}
          <div className="flex items-center gap-5">
            <Logo />

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Main navigation"
              className="hidden md:flex items-center gap-1.5"
            >
              {navItems.map((item) => {
                const active = isNavItemActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      active
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-600/15 dark:text-indigo-300 dark:border-indigo-500/30"
                        : "text-slate-700 hover:text-indigo-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-600/10 hover:bg-indigo-200/70 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Right Controls: Global Search + Theme Toggle + Authentication Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compact Desktop Search Form */}
            <form
              onSubmit={handleNavbarSearch}
              role="search"
              aria-label="Global program search"
              className="hidden lg:flex items-center relative"
            >
              <label htmlFor="navbar-search-input" className="sr-only">
                Search programs
              </label>
              <svg
                className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute left-3 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
                />
              </svg>
              <input
                id="navbar-search-input"
                type="search"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search programs..."
                className="w-48 xl:w-56 h-9 pl-8 pr-3 rounded-xl bg-slate-100 hover:bg-slate-200/60 focus:bg-white dark:bg-slate-900 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 dark:[color-scheme:dark] text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:w-64 transition-all"
              />
            </form>

            {/* Mobile/Tablet Quick Search Icon Link */}
            <Link
              href="/search"
              aria-label="Open search page"
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
                />
              </svg>
            </Link>

            <ThemeToggle />

            {/* Authentication UI Area (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-900/70 dark:hover:border-indigo-500/40 hover:border-indigo-500/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-expanded={userMenuOpen}
                    aria-label="User menu"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                      {user.name || user.email}
                    </span>

                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User Avatar"}
                        width={28}
                        height={28}
                        referrerPolicy="no-referrer"
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800/80 space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {user.name || "CodePati User"}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 truncate font-mono text-[11px]">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                          Role: {user.role}
                        </span>
                      </div>

                      <Link
                        href="/user/submissions"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                      >
                        My Submissions
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors font-semibold"
                        >
                          Administration Console
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full text-left px-4 py-2 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-semibold"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white dark:bg-indigo-600/15 dark:hover:bg-indigo-500/25 dark:text-indigo-300 border border-indigo-700 dark:border-indigo-500/30 transition-all flex items-center gap-1.5 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <span>Sign in</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {/* Mobile Search Form */}
          <form onSubmit={handleNavbarSearch} role="search" className="flex gap-2">
            <label htmlFor="mobile-navbar-search" className="sr-only">
              Search programs
            </label>
            <input
              id="mobile-navbar-search"
              type="search"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search programs..."
              className="flex-1 h-10 px-3.5 rounded-xl bg-slate-100 focus:bg-white dark:bg-slate-900 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 dark:[color-scheme:dark] text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 text-white shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Mobile Nav Links (strictly Programs, Categories, Search) */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isNavItemActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`block px-3.5 py-2 rounded-lg text-base font-semibold transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-600/15 dark:text-indigo-300 dark:border-indigo-500/30"
                      : "text-slate-800 hover:text-indigo-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-indigo-400 dark:hover:bg-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2 rounded-lg text-base font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 transition-colors"
            >
              Admin Console
            </Link>
          )}

          {/* Mobile Auth Area */}
          <div className="pt-3 border-t border-slate-300 dark:border-slate-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User Avatar"}
                      width={36}
                      height={36}
                      referrerPolicy="no-referrer"
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 font-bold text-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="space-y-0.5 truncate">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">
                      {user.name || "CodePati User"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-mono">
                      {user.email}
                    </p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                      {user.role}
                    </span>
                  </div>
                </div>

                <Link
                  href="/user/submissions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  My Submissions
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full text-center py-2.5 px-3 rounded-lg text-sm font-semibold text-red-700 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white dark:bg-indigo-600/15 dark:text-indigo-300 border border-indigo-700 dark:border-indigo-500/30 transition-colors shadow-xs"
              >
                Sign in with Google
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
