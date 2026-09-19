import type { Metadata } from 'next';
import { Inter, Manrope, Source_Code_Pro } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '../styles/style.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const sourceCodePro = Source_Code_Pro({
  variable: '--font-source-code-pro',
  subsets: ['latin'],
});

const SITE_URL = 'https://ireshan.com';

const SITE_DESCRIPTION =
  'Senior Full Stack AI Engineer, building production AI systems: RAG pipelines, agentic workflows and LLM-powered products in TypeScript, Python and React.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // `default` is used by this route; `template` wraps any child route that
    // sets a plain string title, so /blog renders "Blog | Ireshan Pathirana"
    // and a post renders "<post title> | Ireshan Pathirana".
    default: 'Ireshan Pathirana | AI Engineer',
    template: '%s | Ireshan Pathirana',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Ireshan Pathirana',
    'AI Engineer',
    'Full Stack AI Engineer',
    'LLM Engineer',
    'RAG',
    'Agentic Workflows',
    'LangGraph',
    'LangChain',
    'TypeScript',
    'Node.js',
    'Python',
    'FastAPI',
    'React Developer',
    'Next.js',
  ],
  authors: [{ name: 'Ireshan Pathirana', url: SITE_URL }],
  creator: 'Ireshan Pathirana',
  openGraph: {
    title: 'Ireshan Pathirana | AI Engineer',
    description: SITE_DESCRIPTION,
    siteName: 'Ireshan Pathirana',
    locale: 'en_US',
    type: 'website',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary',
    title: 'Ireshan Pathirana | AI Engineer',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-length text snippets, large image previews and
      // full video previews rather than its conservative defaults.
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    // avoids duplicate indexing issues
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${manrope.variable} ${sourceCodePro.variable} antialiased`}
      >
        <NextTopLoader color="var(--primary)" showSpinner={false} showForHashAnchor={false} />
        {children}
      </body>
    </html>
  );
}
