'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content">
      <div>
        <p className="font-bold">
          LearnNest <br />
          Providing reliable online education since 2024
        </p>
        <p>Copyright © 2024 - All rights reserved</p>
      </div>
      <div>
        <div className="grid grid-flow-col gap-4">
          <Link href="/privacy-policy" className="link link-hover">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="link link-hover">
            Terms of Service
          </Link>
          <Link href="/buj" className="link link-hover">
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
} 