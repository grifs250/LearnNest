import { Metadata } from "next";

export interface DynamicMetadataProps {
  title: string;
  description: string;
  imageUrl?: string;
  pathname?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Generates metadata for Next.js pages with dynamic content
 */
export function generateDynamicMetadata({
  title,
  description,
  imageUrl,
  pathname,
  type = 'website',
  keywords = [],
  noIndex = false
}: DynamicMetadataProps): Metadata {
  // Base URL from environment or default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://macieste.lv';
  
  // Construct canonical URL
  const url = pathname ? `${baseUrl}${pathname}` : baseUrl;
  
  // Prepare OpenGraph image array
  const images = imageUrl 
    ? [{ url: imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}` }] 
    : [];
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    metadataBase: new URL(baseUrl),
    
    // Open Graph
    openGraph: {
      title,
      description,
      url,
      siteName: 'MāciesTe',
      locale: 'lv_LV',
      type,
      images,
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    
    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    
    // Alternates
    alternates: {
      canonical: url,
    },
  };
} 