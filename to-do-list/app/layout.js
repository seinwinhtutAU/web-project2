import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MenuWrapper from "./context/menuWrapper";
import TaskProviderWrapper from "./context/taskProviderWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "To-Do List App",
  description: "Next.js + MongoDB To-Do App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}
      >
        <TaskProviderWrapper>
          <MenuWrapper />
          {children}
        </TaskProviderWrapper>
      </body>
    </html>
  );
}
