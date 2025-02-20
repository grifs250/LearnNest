export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Add dashboard navigation/layout here */}
      {children}
    </div>
  );
} 