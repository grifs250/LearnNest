"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from 'next/link';

export const AuthButtons = () => {
  return (
    <div className="flex gap-4">
      <SignInButton mode="modal">
        <button className="btn btn-primary">Ieiet</button>
      </SignInButton>
      <div className="dropdown dropdown-end">
        <button tabIndex={0} className="btn btn-secondary">Reģistrēties</button>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li>
            <Link href="/register?role=student" className="text-primary">
              Kā students
            </Link>
          </li>
          <li>
            <Link href="/register?role=teacher" className="text-secondary">
              Kā pasniedzējs
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}; 