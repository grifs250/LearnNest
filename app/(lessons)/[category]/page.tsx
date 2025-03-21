import { Metadata } from 'next';
import { dbService } from '@/lib/supabase/db';
import CategoryDetail from './client';
import { notFound } from 'next/navigation';
import { Category, Subject } from '@/types/database';

export const revalidate = 3600; // Revalidate this page every hour

/**
 * Generate metadata for the category page
 */
export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  try {
    // Get the category name in a more readable format
    const categoryName = decodeURIComponent(params.category);
    const formattedCategoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    
    return {
      title: `${formattedCategoryName} nodarbības | MāciesTe`,
      description: `Izpēti labākās ${formattedCategoryName.toLowerCase()} nodarbības platformā MāciesTe.`,
    };
  } catch (error) {
    return {
      title: 'Nodarbības | MāciesTe',
      description: 'Atklāj priekšmetus un nodarbības platformā MāciesTe.',
    };
  }
}

/**
 * Category page component
 */
export default async function CategoryPage({ params }: { params: { category: string } }) {
  try {
    // Get the category name from the URL
    const categoryName = decodeURIComponent(params.category);
    
    // Fetch all categories - with error handling
    let categories: Category[] = [];
    try {
      categories = await dbService.getCategories();
      console.log("Fetched categories:", categories.length);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Return a fallback UI with the error
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold">Neizdevās ielādēt kategorijas</h2>
            <p>Lūdzu, mēģiniet vēlreiz vai sazinieties ar atbalsta komandu.</p>
          </div>
        </div>
      );
    }
    
    // Find the current category
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (!category) {
      console.log(`Category not found: ${categoryName}`);
      notFound();
    }
    
    console.log(`Found category: ${category.name} (${category.id})`);
    
    // Fetch all subjects in this category - with error handling
    let subjects: Subject[] = [];
    try {
      subjects = await dbService.getSubjectsByCategory(category.id);
      console.log(`Fetched ${subjects.length} subjects for category ${category.name}`);
    } catch (error) {
      console.error(`Error fetching subjects for category ${category.id}:`, error);
      // Return subjects UI with the error
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold">Neizdevās ielādēt priekšmetus</h2>
            <p>Lūdzu, mēģiniet vēlreiz vai sazinieties ar atbalsta komandu.</p>
          </div>
        </div>
      );
    }
    
    if (subjects.length === 0) {
      console.log(`No subjects found for category ${category.name}`);
    }
    
    // Create a Map of subjects with lessons (all set to true for now to debug UI)
    // Later we can add proper lesson checking
    const subjectsWithLessons = new Map(
      subjects.map(subject => [subject.id, true])
    );
    
    // Return the client component with the data
    return <CategoryDetail 
      category={category} 
      subjects={subjects} 
      subjectsWithLessons={subjectsWithLessons}
    />;
  } catch (error) {
    console.error('Unexpected error in CategoryPage:', error);
    // Return a fallback UI with the generic error
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold">Kaut kas nogāja greizi</h2>
          <p>Lūdzu, mēģiniet vēlreiz vai sazinieties ar atbalsta komandu.</p>
        </div>
      </div>
    );
  }
}