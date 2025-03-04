import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  imageUrl?: string;
  pathname?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  tags?: string[];
}

export function generateDynamicMetadata({
  title,
  description,
  imageUrl = '/images/default-og-image.jpg',
  pathname = '',
  type = 'website',
  publishedTime,
  tags = [],
}: SEOProps): Metadata {
  // Base URL for the site
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://macieste.lv';
  const url = `${baseUrl}${pathname}`;
  
  // Default image dimensions
  const imageWidth = 1200;
  const imageHeight = 630;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'MāciesTe',
      locale: 'lv_LV',
      type,
      ...(type === 'article' && publishedTime
        ? { publishedTime }
        : {}),
      images: [
        {
          url: imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`,
          width: imageWidth,
          height: imageHeight,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`],
    },
    ...(tags.length > 0 ? { keywords: tags.join(', ') } : {}),
    alternates: {
      canonical: url,
    },
  };
} 