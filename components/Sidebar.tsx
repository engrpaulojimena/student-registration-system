"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard",   icon: "⊞",  label: "Dashboard"   },
  { href: "/students",    icon: "◎",  label: "Students"    },
  { href: "/courses",     icon: "▦",  label: "Courses"     },
  { href: "/subjects",    icon: "≡",  label: "Subjects"    },
  { href: "/enrollments", icon: "✓",  label: "Enrollments" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800/60 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800/60">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">EduTrack</p>
            <p className="text-slate-500 text-xs mt-0.5">Registration System</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-slate-600 text-xs font-medium uppercase tracking-widest px-3 mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            A
          </div>
          <div>
            <p className="text-slate-300 text-xs font-medium">Admin</p>
            <p className="text-slate-600 text-xs">Administrator</p>
          </div>
        </div>
      </div>

    </aside>
  );
}
