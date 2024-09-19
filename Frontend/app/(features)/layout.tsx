import "../globals.css";
import { Inter } from "next/font/google";
import Topnav from '@/components/topnav';
import { UserType } from "@/lib/utils";


const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <html lang="en">
      <body className={inter.className}>
        <Topnav  />
        {children}
      </body>
    </html>
  )
}
