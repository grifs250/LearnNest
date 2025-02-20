"use client";

import React from "react";

interface SmoothScrollLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SmoothScrollLink({ 
  href, 
  children, 
  className, 
  onClick 
}: SmoothScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const anchor = href.replace("#", "");
    const el = document.getElementById(anchor);
    
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
    
    onClick?.();
  };

  return (
    <a 
      href={href} 
      onClick={handleClick} 
      className={className}
      role="button"
      tabIndex={0}
    >
      {children}
    </a>
  );
} 