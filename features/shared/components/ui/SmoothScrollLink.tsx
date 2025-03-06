'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface SmoothScrollLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  offset?: number;
}

export default function SmoothScrollLink({ 
  href, 
  children, 
  className = '', 
  onClick,
  offset = 0
}: SmoothScrollLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (onClick) {
      onClick();
    }

    // Check if the href is a hash link
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        // Get the element's position
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        
        // Apply the offset
        const offsetPosition = elementPosition + offset;
        
        // Scroll to the adjusted position
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // If it's not a hash link, use the router
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
} 