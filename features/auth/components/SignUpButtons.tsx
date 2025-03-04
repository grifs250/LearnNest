"use client";

import Link from 'next/link';

export const SignUpButtons = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <Link href="/register?role=student">
        <button className="btn btn-accent btn-lg w-48 md:w-auto">
          👨‍🎓 Reģistrēties kā students
        </button>
      </Link>
      
      <Link href="/register?role=teacher">
        <button className="btn btn-secondary btn-lg w-48 md:w-auto">
          👨‍🏫 Reģistrēties kā pasniedzējs
        </button>
      </Link>
    </div>
  );
}; 