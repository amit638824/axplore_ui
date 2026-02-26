import type { Metadata } from "next";
// import "./globals.css";
import "bootstrap/dist/css/bootstrap.css";

import '@/styles/app.min.css';
import "@/styles/custom.css";
import "@/styles/responsive.css";

import StoreProvider from "@/redux/StoreProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";

import { Poppins, Inter } from "next/font/google";
import BootstrapClient from "@/components/bootstrap/BootstrapClient";
import { UserProvider } from "@/lib/contexts/UserContext";

/* =========================
   Google Fonts Configuration
========================= */

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

/* =========================
   Metadata
========================= */

export const metadata: Metadata = {
  title: "Travel App",
  description: "More Than Tours, We Create Magic!",
  icons: {
    icon: "/assets/images/favicon.ico",
  },
};

/* =========================
   Root Layout
========================= */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
         <UserProvider>
        <BootstrapClient />

        <StoreProvider>
          {children}
          <ToastContainer />
        </StoreProvider>
        </UserProvider>
      </body>
    </html>
  );
}