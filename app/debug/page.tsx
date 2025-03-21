import { dbService } from '@/lib/supabase/db';
import { createClient } from '@supabase/supabase-js';

export const metadata = {
  title: 'Debug Page | MāciesTe',
};

export default async function DebugPage() {
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseAnonKey;
  
  // Attempt to create a direct client
  let directClientWorks = false;
  let directError = null;
  
  try {
    if (hasUrl && hasKey) {
      const directClient = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await directClient.from('categories').select('count(*)');
      directClientWorks = !error;
      if (error) directError = error.message;
    }
  } catch (err: any) {
    directError = err.message;
  }
  
  // Try dbService
  let dbServiceWorks = false;
  let dbServiceError = null;
  let categoriesCount = 0;
  
  try {
    const categories = await dbService.getCategories();
    dbServiceWorks = true;
    categoriesCount = categories.length;
  } catch (err: any) {
    dbServiceError = err.message;
  }
  
  // Try fetching subjects through dbService
  let subjectsWork = false;
  let subjectError = null;
  let subjectCount = 0;
  
  try {
    // Get first category
    const categories = await dbService.getCategories();
    if (categories.length > 0) {
      const firstCategory = categories[0];
      const subjects = await dbService.getSubjectsByCategory(firstCategory.id);
      subjectsWork = true;
      subjectCount = subjects.length;
    } else {
      subjectError = "No categories available to test subjects";
    }
  } catch (err: any) {
    subjectError = err.message;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Diagnostics</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Environment Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">NEXT_PUBLIC_SUPABASE_URL</h3>
              <div className={`badge ${hasUrl ? 'badge-success' : 'badge-error'}`}>
                {hasUrl ? 'Available' : 'Missing'}
              </div>
              {hasUrl && (
                <p className="text-xs opacity-70 mt-2">
                  Value length: {supabaseUrl?.length} characters
                </p>
              )}
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">NEXT_PUBLIC_SUPABASE_ANON_KEY</h3>
              <div className={`badge ${hasKey ? 'badge-success' : 'badge-error'}`}>
                {hasKey ? 'Available' : 'Missing'}
              </div>
              {hasKey && (
                <p className="text-xs opacity-70 mt-2">
                  Value length: {supabaseAnonKey?.length} characters
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Connection Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Direct Supabase Client</h3>
              <div className={`badge ${directClientWorks ? 'badge-success' : 'badge-error'}`}>
                {directClientWorks ? 'Working' : 'Failed'}
              </div>
              {directError && (
                <div className="mt-2 p-2 bg-error/10 text-error rounded text-sm">
                  <p className="font-semibold">Error:</p>
                  <p>{directError}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">dbService.getCategories()</h3>
              <div className={`badge ${dbServiceWorks ? 'badge-success' : 'badge-error'}`}>
                {dbServiceWorks ? 'Working' : 'Failed'}
              </div>
              {dbServiceWorks && (
                <p className="text-sm mt-2">Found {categoriesCount} categories</p>
              )}
              {dbServiceError && (
                <div className="mt-2 p-2 bg-error/10 text-error rounded text-sm">
                  <p className="font-semibold">Error:</p>
                  <p>{dbServiceError}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">dbService.getSubjectsByCategory()</h3>
              <div className={`badge ${subjectsWork ? 'badge-success' : 'badge-error'}`}>
                {subjectsWork ? 'Working' : 'Failed'}
              </div>
              {subjectsWork && (
                <p className="text-sm mt-2">Found {subjectCount} subjects in first category</p>
              )}
              {subjectError && (
                <div className="mt-2 p-2 bg-error/10 text-error rounded text-sm">
                  <p className="font-semibold">Error:</p>
                  <p>{subjectError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <a href="/" className="btn btn-primary">Return to Home</a>
      </div>
    </div>
  );
} 