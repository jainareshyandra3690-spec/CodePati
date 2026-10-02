import Link from "next/link";
import Image from "next/image";

export interface LogoProps {
  /**
   * Path to the actual logo image file once placed in public/images/
   * e.g., "/images/codepati-logo.png"
   */
  imageSrc?: string;
  /**
   * Set to true once the real logo file is added to public/images/
   */
  hasRealLogo?: boolean;
  /**
   * Whether to display the text brand name next to the logo placeholder
   */
  showText?: boolean;
  className?: string;
  placeholderClassName?: string;
}

/**
 * CodePati Brand Logo Component
 *
 * Reserves a dedicated, dimensionally accurate area for the CodePati logo (36x36px on mobile, 40x40px on tablet/desktop).
 * Currently renders a polished, Deep Indigo themed placeholder designed to blend seamlessly
 * into the navbar across desktop, tablet, and mobile layouts in both light and dark modes.
 *
 * Future Logo Replacement:
 * 1. Place the logo image in `public/images/codepati-logo.png` (or pass `imageSrc`).
 * 2. Set `hasRealLogo` to `true` (or pass `hasRealLogo={true}`).
 */
export function Logo({
  imageSrc = "/images/codepati-logo.png",
  hasRealLogo = false,
  showText = true,
  className = "",
  placeholderClassName = "",
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl transition-all ${className}`}
      aria-label="CodePati - Home"
    >
      {/* Logo Container / Placeholder Area */}
      <div
        className={`relative flex items-center justify-center shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden transition-all duration-200 ${
          hasRealLogo
            ? "bg-transparent"
            : "bg-indigo-600/10 dark:bg-indigo-600/15 border border-indigo-500/30 dark:border-indigo-400/35 shadow-sm shadow-indigo-500/10 group-hover:border-indigo-500 group-hover:shadow-indigo-500/20 group-hover:bg-indigo-500/20"
        } ${placeholderClassName}`}
      >
        {hasRealLogo ? (
          <Image
            src={imageSrc}
            alt="CodePati Logo"
            width={40}
            height={40}
            className="w-full h-full object-contain"
            priority
          />
        ) : (
          /* Reserved Logo Placeholder - Polished Deep Indigo brand frame */
          <div
            className="flex items-center justify-center w-full h-full text-indigo-600 dark:text-indigo-400 select-none"
            title="CodePati Logo Placeholder"
          >
            <svg
              className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
        )}
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <span className="flex items-center font-bold text-lg sm:text-xl tracking-tight transition-colors duration-150 select-none">
          <span className="text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white">
            Code
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300">
            Pati
          </span>
        </span>
      )}
    </Link>
  );
}

export default Logo;
