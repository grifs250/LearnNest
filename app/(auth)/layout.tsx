export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full p-6 bg-base-100 rounded-lg shadow-xl">
        {children}
      </div>
    </div>
  );
} 