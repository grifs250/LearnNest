"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import Link from "next/link";
import SmoothScrollLink from "@/features/shared/components/ui/SmoothScrollLink";
import { Menu, X, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session) {
        setUser(session.user);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error.message || error);
          if (error.message?.includes('no rows')) {
            router.push('/profile/setup');
          }
          setIsTeacher(false);
          setDisplayName('');
        } else {
          setIsTeacher(profile.role === 'teacher');
          setDisplayName(profile.display_name || profile.full_name || '');
        }
      } else {
        setUser(null);
        setIsTeacher(null);
        setDisplayName('');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const profileButtonClass = isTeacher === null 
    ? "btn-neutral" 
    : isTeacher 
      ? "btn-secondary" 
      : "btn-accent";

  const navItems = [
    { label: "Kā tas strādā?", href: "#how-it-works" },
    { label: "Mācību priekšmeti", href: "#subjects" },
    { label: "Valodu kursi", href: "#languages" },
    { label: "IT kursi", href: "#it" },
    { label: "BUJ", href: "#buj" },
    { label: "Kontakti", href: "#contact" },
  ];

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  return (
    <div>
      <nav className="navbar bg-primary text-primary-content">
        <div className="flex-1 mr-10">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            📚 MāciesTe
          </Link>
        </div>

        <div className="md:hidden">
          <button
            className="btn btn-square btn-ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex gap-4 mr-4 items-center">
          {navItems.map((item) => (
            <SmoothScrollLink
              key={item.href}
              href={pathname === "/" ? item.href : `/${item.href}`}
              className="hover:underline"
            >
              {item.label}
            </SmoothScrollLink>
          ))}
          {!loading && (
            user ? (
              <Link 
                href="/profile" 
                onClick={handleProfileClick}
                className={`btn btn-sm flex items-center gap-1 ${profileButtonClass}`}
              >
                <UserIcon size={16} />
                {displayName || 'Profils'}
              </Link>
            ) : (
              <Link 
                href="/login"
                className="btn btn-sm"
              >
                Pieslēgties
              </Link>
            )
          )}
        </div>
      </nav>

      {mobileOpen && (
        <div className="bg-primary text-primary-content p-4 flex flex-col gap-2 md:hidden">
          {navItems.map((item) => (
            <SmoothScrollLink
              key={item.href}
              href={pathname === "/" ? item.href : `/${item.href}`}
              onClick={() => setMobileOpen(false)}
              className="hover:underline text-center"
            >
              {item.label}
            </SmoothScrollLink>
          ))}
          <div className="flex justify-center">
            {!loading && (
              user ? (
                <Link 
                  href="/profile" 
                  onClick={(e) => {
                    handleProfileClick(e);
                    setMobileOpen(false);
                  }}
                  className={`btn btn-sm flex items-center gap-1 ${profileButtonClass}`}
                >
                  <UserIcon size={16} />
                  {displayName || 'Profils'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-sm"
                >
                  Pieslēgties
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}