"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dbService from '@/lib/supabase/db';
import { CourseSections } from "@/features/lessons/components";
import { useCategory } from "@/features/lessons/hooks";
import Link from 'next/link';
import Image from 'next/image';
import { Category, Subject } from '@/types/database';

// Add this interface
interface CategoryParams {
  category: string;
}

// Define CategoryWithSubjects type to ensure subjects property exists
interface CategoryWithSubjects extends Category {
  subjects: Subject[];
}

// Export all client components from a single file
export const ClientComponents = {
  CategoryContent: function({ params }: { params: CategoryParams }) {
    const { category } = params;
    const router = useRouter();
    const { data: categoryData, isLoading, error } = useCategory(category);
    
    if (isLoading) {
      return <div className="loading loading-spinner loading-lg"></div>;
    }

    if (error) {
      return <div className="alert alert-error">
        <span>{error.message || 'Radās kļūda ielādējot kategoriju'}</span>
      </div>;
    }

    if (!categoryData) {
      return <div className="alert alert-warning">
        <span>Kategorija nav atrasta</span>
      </div>;
    }

    // Ensure we have subjects array even if it's not in the response
    const subjects = categoryData.subjects || [];
    return <CourseSections subjects={subjects} />;
  },
  
  CategoryFilters: function({ activeFilters, onChange }: { 
    activeFilters: string[]; 
    onChange: (filters: string[]) => void 
  }) {
    // Filter component implementation
    return (
      <div className="flex flex-wrap gap-2 my-4">
        {/* Filter UI */}
      </div>
    );
  }
};

interface CategoryClientProps {
  categoryId: string;
}

export function CategoryClient({ categoryId }: CategoryClientProps) {
  const { data: categoryData, isLoading } = useCategory(categoryId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-error/10 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-error">Kategorija nav atrasta</h2>
          <p className="mb-4">Diemžēl šāda kategorija neeksistē vai nav pieejama.</p>
          <Link href="/" className="btn btn-primary">
            Atgriezties uz sākumlapu
          </Link>
        </div>
      </div>
    );
  }

  return <CategoryContent categoryData={categoryData} />;
}

function CategoryContent({ categoryData }: { categoryData: any }) {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{categoryData.name}</h1>
        <p className="text-gray-600">{categoryData.description}</p>
      </div>

      {categoryData.subjects && categoryData.subjects.length > 0 ? (
        <CourseSections subjects={categoryData.subjects} />
      ) : (
        <div className="bg-base-200 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Nav atrasts neviens priekšmets</h3>
          <p>
            Šajā kategorijā pagaidām nav pieejami priekšmeti.
            Lūdzu, apskatiet citas kategorijas vai mēģiniet vēlreiz vēlāk.
          </p>
        </div>
      )}
    </div>
  );
}