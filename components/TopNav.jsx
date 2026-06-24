'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinejoin="round"/>
    <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" strokeLinejoin="round"/>
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
  </svg>
);

const TABS = [
  { href: '/',        label: 'Home',       Icon: HomeIcon },
  { href: '/cheat',   label: 'Cheat Meal', Icon: SparkleIcon },
  { href: '/profile', label: 'Profile',    Icon: PersonIcon },
];

export default function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <span className="top-nav-logo">🍔 CheatDay</span>
        {TABS.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`top-nav-tab${active ? ' active' : ''}`}>
              <Icon /><span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
