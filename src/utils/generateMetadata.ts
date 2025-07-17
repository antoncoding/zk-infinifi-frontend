import type { Metadata } from 'next';

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export function generateMetadata({
  title = 'Web3 Next.js Template',
  description = 'A modern web3 template built with Next.js, TypeScript, and Tailwind CSS',
  url = 'https://github.com/your-username/web3-next-template',
  image = '/og-image.png',
}: GenerateMetadataProps = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Web3 Next.js Template',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
