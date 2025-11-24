import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.jsx
export const metadata = {
  title: "Veritas",
  description:
    "A bible that understands you",
  authors: [{ name: "Prince Chidera", url: "https://github.com/prince24-web" }],
  creator: "Prince Chidera",
  openGraph: {
    title: "Veritas",
    description:
      "talk to the word of God and let it speak to you",
    url: "https://retro-psi-one.vercel.app", // <-- change to your real domain
    siteName: "Veritas",
    images: [
      {
        url: "/image.png", // Recommended size: 1200x630
        width: 1200,
        height: 630,
        alt: "veritas",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veritas",
    description:
      "talk with the bible",
    creator: "@Devprinze", // your X username
    images: ["/image.png"],
  },
  icons: {
    icon: "/image.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
