import { Suspense } from "react";
import LoadingSpinner from "./loading";
import { LessonsProviderWrapper } from "./client-layout";

export default function LessonsLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <LessonsProviderWrapper>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen">
          {children}
        </div>
      </Suspense>
    </LessonsProviderWrapper>
  );
} 