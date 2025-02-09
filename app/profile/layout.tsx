import ProfileLayout from "@/components/ProfileLayout";

interface LayoutProps {
  readonly children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <ProfileLayout>{children}</ProfileLayout>;
} 