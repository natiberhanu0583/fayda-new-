import type { Metadata } from "next";
import { Noto_Sans_Ethiopic, Open_Sans } from "next/font/google";
import "./globals.css";



const notoSans = Noto_Sans_Ethiopic({
  variable: "--font-noto-sans",
  subsets: ["latin", "ethiopic"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"]
})



export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL || 'http://localhost:3000'),
  title: {
    default: "Fayda ID Card Extractor — Ethiopian ID Data Processing",
    template: "%s | Fayda ID Card Extractor",
  },
  description:
    "Fayda is a fast, secure platform for extracting and generating Ethiopian national ID card data from PDFs and screenshots. Upload your Fayda app files to instantly produce print-ready ID cards.",
  keywords: [
    "Fayda",
    "Ethiopian ID card",
    "ID card extractor",
    "Fayda app",
    "Ethiopian national ID",
    "PDF extraction",
    "ID card generator",
    "Ethiopia",
    "ፋይዳ",
  ],
  authors: [{ name: "Fayda Team" }],
  creator: "Fayda Team",
  robots: {
    index: false, // Private/authenticated app — prevent indexing
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "en_ET",
    title: "Fayda ID Card Extractor",
    description:
      "Extract and generate Ethiopian national ID card data from PDFs and Fayda app screenshots.",
    siteName: "Fayda ID Card Extractor",
  },
  twitter: {
    card: "summary",
    title: "Fayda ID Card Extractor",
    description:
      "Extract and generate Ethiopian national ID card data from PDFs and Fayda app screenshots.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSans.variable} ${openSans.variable} antialiased`}
      >

        {children}
      </body>
    </html>
  );
}
