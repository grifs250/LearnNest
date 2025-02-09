"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, Settings, BookOpen, Calendar, 
  ChevronLeft, ChevronRight, Menu, CreditCard 
} from "lucide-react";
import { useNavbar } from '@/contexts/NavbarContext';

interface ProfileSidebarProps {
  userId: string;
  isTeacher: boolean;
}

const NAVBAR_HEIGHT = 64;

export default function ProfileSidebar({ userId, isTeacher }: ProfileSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isNavbarVisible } = useNavbar();

  const navItems = [
    {
      label: "Mans Profils",
      href: `/profile`,
      icon: <User className="w-5 h-5" />,
    },
    {
      label: "Rediģēt Profilu",
      href: "/profile/setup",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: isTeacher ? "Manas Nodarbības" : "Manas Rezervācijas",
      href: "/profile/lessons",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: "Kalendārs",
      href: "/profile/calendar",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: "Maksājumi",
      href: "/profile/payments",
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Background overlay */}
      <div 
        className={`
          fixed left-0 top-0 bottom-0 bg-base-200 border-r border-base-300
          transition-[top,width] duration-300
        `}
        style={{
          width: isCollapsed ? '72px' : '256px',
          zIndex: 1,
          top: isNavbarVisible ? '64px' : '0'
        }}
      />
      
      {/* Actual sidebar content */}
      <div 
        ref={sidebarRef}
        className={`
          fixed left-0 bottom-0
          transition-[top,width] duration-300
          z-20 
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
        `}
        style={{
          top: isNavbarVisible ? '64px' : '0'
        }}
      >
        <div className="flex flex-col h-full">
          <nav className="p-2 flex-1 overflow-y-auto">
            <ul className="menu gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 py-3 px-3 rounded-lg
                      hover:bg-base-300 transition-colors
                      ${pathname === item.href ? 'bg-primary/10 text-primary font-semibold' : ''}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-2 border-t border-base-300">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full btn btn-ghost btn-sm justify-center"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 