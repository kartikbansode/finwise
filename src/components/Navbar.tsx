'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/income', label: 'Income' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 sticky top-0 z-10">
      <span className="font-bold text-emerald-700 mr-4">FinWise India</span>
      {links.map((link) => (
        <Link key={link.href} href={link.href}
          className={`text-sm font-medium ${pathname === link.href ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-900'}`}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}