import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://macieste.lv';
  
  // Static routes
  const staticRoutes: SitemapEntry[] = [
    {
      url: '/',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: '/about',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: '/buj',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7
    }
  ];
  
  // Convert the custom entries to Next.js sitemap format
  const sitemap: MetadataRoute.Sitemap = staticRoutes.map(entry => ({
    url: `${baseUrl}${entry.url}`,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));
  
  try {
    // Dynamic routes from database
    const supabase = await createClient();
    
    // Get active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, updated_at')
      .eq('is_active', true);
    
    if (categories) {
      for (const category of categories) {
        sitemap.push({
          url: `${baseUrl}/lessons/${category.id}`,
          lastModified: category.updated_at || new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.8
        });
        
        // Get subjects for this category
        const { data: subjects } = await supabase
          .from('subjects')
          .select('id, updated_at')
          .eq('category_id', category.id)
          .eq('is_active', true);
        
        if (subjects) {
          for (const subject of subjects) {
            sitemap.push({
              url: `${baseUrl}/lessons/${category.id}/${subject.id}`,
              lastModified: subject.updated_at || new Date().toISOString(),
              changeFrequency: 'weekly',
              priority: 0.7
            });
          }
        }
      }
    }
    
    // Get active teacher profiles
    const { data: teachers } = await supabase
      .from('user_profiles_view')
      .select('url_slug, updated_at')
      .eq('profile_type', 'teacher')
      .eq('is_active', true);
    
    if (teachers) {
      for (const teacher of teachers) {
        sitemap.push({
          url: `${baseUrl}/teachers/${teacher.url_slug}`,
          lastModified: teacher.updated_at || new Date().toISOString(),
          changeFrequency: 'daily',
          priority: 0.9
        });
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }
  
  return sitemap;
} 