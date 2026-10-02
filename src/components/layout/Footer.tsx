import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200 dark:border-slate-800/80">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <Logo />
            <p className="text-sm text-slate-700 dark:text-slate-400 max-w-md leading-relaxed">
              Learn programming one program at a time. Explore structured problem
              statements, step-by-step algorithms, complexity analysis, and clean
              implementations across C, C++, Java, and Python.
            </p>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/programs"
                  className="text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  Program Library
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  Search Programs
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages & Levels */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Languages &amp; Tracks
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/programs?language=c"
                  className="text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  C Implementations
                </Link>
              </li>
              <li>
                <Link
                  href="/programs?language=cpp"
                  className="text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  C++ Implementations
                </Link>
              </li>
              <li>
                <Link
                  href="/programs?language=java"
                  className="text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  Java Implementations
                </Link>
              </li>
              <li>
                <Link
                  href="/programs?language=python"
                  className="text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  Python Implementations
                </Link>
              </li>
              <li>
                <Link
                  href="/difficulty/beginner"
                  className="text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  Difficulty Tracks
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <p>&copy; {new Date().getFullYear()} CodePati. All rights reserved.</p>
          <p className="font-mono">C &bull; C++ &bull; Java &bull; Python</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
