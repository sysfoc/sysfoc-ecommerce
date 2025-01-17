import "./globals.css";
import Header from "./components/Header";
import Footerr from "./components/Footerr";
import { DarkModeProvider } from "./context/DarkModeProvider";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 dark:text-gray-300 text-black transition-colors duration-300">
        <DarkModeProvider>
          <Header />
            {children}
          <Footerr />
        </DarkModeProvider>
      </body>
    </html>
  );
}
