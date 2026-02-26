// "use client"
import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.css";
import "@/styles/main.css";
import "@/styles/responsive.css"; 
import StoreProvider from "@/redux/StoreProvider"; 
 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import "font-awesome/css/font-awesome.min.css"; 
import { Open_Sans, Roboto } from "next/font/google"; 
import BootstrapClient from "@/components/bootstrap/BootstrapClient";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Travel App",
  description: "More Than Tours, We Create Magic!",
  icons: {
    icon: "/assets/images/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
 <html
      lang="en"
      className={`${openSans.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <body>
        <BootstrapClient/>
        <StoreProvider> 
            {children} 
            <ToastContainer /> 
        </StoreProvider>
      </body>
    </html>
  );
}
