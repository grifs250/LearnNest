"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import SmoothScrollLink from "@/features/shared/components/ui/SmoothScrollLink";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useSupabase } from '@/lib/providers/SupabaseProvider';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { supabase, user, loading } = useSupabase();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const getProfileData = async () => {
      if (!user) {
        if (mounted) {
          setIsTeacher(null);
          setDisplayName('');
          setIsCheckingProfile(false);
        }
        return;
      }

      if (pathname === '/profile/setup') {
        setIsCheckingProfile(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (mounted) {
          if (!profile) {
            router.push('/profile/setup');
          } else {
            setIsTeacher(profile.role === 'teacher');
            setDisplayName(profile.full_name || '');
          }
          setIsCheckingProfile(false);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (mounted) {
          setIsTeacher(false);
          setDisplayName('');
          setIsCheckingProfile(false);
        }
      }
    };

    getProfileData();

    return () => {
      mounted = false;
    };
  }, [user, supabase, router, pathname]);

  const profileButtonClass = isTeacher === null 
    ? "btn-neutral" 
    : isTeacher 
      ? "btn-secondary hover:btn-secondary-focus" 
      : "btn-accent hover:btn-accent-focus";

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
                className="btn btn-sm border-t-neutral-400 hover:btn-ghost-focus"
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
                  className="btn btn-sm btn-ghost hover:btn-ghost-focus"
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