import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Arka Plan Logoları */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 animate-pulse">
          <Image src="/akbim-logo.png" alt="" width={300} height={150} className="rotate-12" />
        </div>
        <div className="absolute bottom-20 right-20 animate-bounce">
          <Image src="/akbim-logo.png" alt="" width={250} height={125} className="-rotate-12" />
        </div>
        <div className="absolute top-1/2 left-1/3 animate-pulse">
          <Image src="/akbim-logo.png" alt="" width={200} height={100} className="opacity-50" />
        </div>
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Image 
              src="/akbim-logo.png" 
              alt="Akbim Bilgisayar" 
              width={300} 
              height={150} 
              className="drop-shadow-xl" 
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            Akbim Kasa Takip
          </h1>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center"
            >
              Kayıt Ol
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors border-2 border-indigo-600 shadow-md"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}