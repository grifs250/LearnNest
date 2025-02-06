"use client";

import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;  // ✅ Allow onClick
};

export default function SmoothScrollLink({ href, children, className, onClick }: Props) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const anchor = href.replace("#", "");
    const el = document.getElementById(anchor);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
    if (onClick) onClick(); // ✅ Call the onClick function if provided
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
