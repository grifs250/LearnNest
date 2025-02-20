"use client";

import { useParams } from "next/navigation";
import { CourseSections } from "@/features/lessons/components";
import { useCategory } from "@/features/lessons/hooks";

export default function CategoryPage() {
  const { category } = useParams();
  const { data, loading } = useCategory(category as string);

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (!data) {
    return <div>Category not found</div>;
  }

  return <CourseSections categories={[data]} />;
} 