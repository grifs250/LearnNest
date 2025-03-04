// Global application configuration
export const siteConfig = {
  name: 'MāciesTe',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://macieste.lv',
  description: 'MāciesTe ir vadošā tiešsaistes mācīšanās platforma Latvijā, kur skolēni un studenti var atrast kvalificētus pasniedzējus.',
  keywords: 'tiešsaistes mācības, izglītība, privātskolotāji, nodarbības, skolotāji, studenti',
  author: 'MāciesTe Komanda',
  locale: 'lv-LV',
  ogImage: '/images/og-image.jpg',
  socials: {
    twitter: 'https://twitter.com/macieste',
    facebook: 'https://facebook.com/macieste',
    instagram: 'https://instagram.com/macieste',
  },
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
  },
  legal: {
    terms: '/terms',
    privacy: '/privacy',
    cookies: '/cookies',
  },
  contact: {
    email: 'info@macieste.lv',
    phone: '+371 20 123 456',
    address: 'Rīga, Latvija',
  },
  features: {
    enableInstantBookings: true,
    enableRealTimeMessaging: true,
    enableTeacherVerification: true,
    enableStripePayments: true,
  },
  limits: {
    maxLessonsPerTeacher: 50,
    maxBookingsPerStudent: 20,
    maxMessageLength: 2000,
  }
};

// App supported languages
export const supportedLanguages = [
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

// App supported subjects categories
export const subjectCategories = [
  'mathematics',
  'languages',
  'science',
  'arts',
  'music',
  'programming',
  'sports',
  'other'
];

// App payment options
export const paymentOptions = {
  currency: 'EUR',
  supportedPaymentMethods: ['card', 'bank_transfer'],
  minimumLesson: 5, // EUR
  maximumLesson: 200, // EUR
}; 