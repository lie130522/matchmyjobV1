import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, DM_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MatchMyJob — Land your dream job, faster.",
  description:
    "Optimize your CV with AI, analyze job offers, generate cover letters and centralize your job search. Powered by Claude AI.",
  keywords: ["cv optimizer", "ATS score", "job search", "cover letter", "AI", "resume"],
  openGraph: {
    title: "MatchMyJob — Land your dream job, faster.",
    description: "AI-powered job search optimization. Get hired faster.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={cn(jakarta.variable, fraunces.variable, dmMono.variable)}
    >
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
