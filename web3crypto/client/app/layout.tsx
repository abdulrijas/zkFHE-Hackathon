import "./globals.css";
import { Inter } from "next/font/google";
import TransactionsProvider from "@/context/TransactionContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Web3.0 App",
  description: "web3.0 app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TransactionsProvider>{children}</TransactionsProvider>
      </body>
    </html>
  );
}
