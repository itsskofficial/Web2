import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lama Blog',
  description: 'A full stack blog app made with Next JS and MongoDB',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className = {inter.className}>
        <div className="container">
          <div className="wrapper">
            <Navbar />
              {children}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
