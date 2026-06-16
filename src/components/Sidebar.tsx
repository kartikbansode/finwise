"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  IndianRupee,
  Receipt,
  Calculator,
  TrendingUp,
  Settings,
  FileText,
} from "lucide-react";

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Income",
    href: "/income",
    icon: IndianRupee,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    name: "Tax Center",
    href: "/tax",
    icon: Calculator,
  },
  {
    name: "Investments",
    href: "/investments",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding"
  ) {
    return null;
  }

  return (
    <div className="w-64 h-screen bg-white border-r fixed left-0 top-0">
      <div className="p-6 border-b">
        <h1 className="font-bold text-xl">FinWise India</h1>
      </div>

      <div className="p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition ${
                pathname === item.href
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
