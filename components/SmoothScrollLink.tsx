// components/SmoothScrollLink.tsx
"use client";

import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function SmoothScrollLink({ href, children, className }: Props) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const anchor = href.replace("#", "");
    const el = document.getElementById(anchor);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
