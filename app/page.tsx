import Link from 'next/link'
import { Wallet, TrendingUp, Shield, BarChart3, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-full shadow-lg">
              <Wallet className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Kasa Takip Uygulaması
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            İşletmenizin gelir ve giderlerini kolayca takip edin, raporlar alın ve finansal durumunuzu kontrol altında tutun.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center"
            >
              Hemen Başla
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

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Kolay Takip
            </h3>
            <p className="text-gray-600">
              Gelir ve giderlerinizi kategorilere ayırarak kolayca takip edin.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Detaylı Raporlar
            </h3>
            <p className="text-gray-600">
              Grafikler ve raporlarla finansal durumunuzu analiz edin.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Güvenli Saklama
            </h3>
            <p className="text-gray-600">
              Verileriniz güvenli bir şekilde bulutta saklanır ve yedeklenir.
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                1
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">Ücretsiz Kayıt Olun</h4>
                <p className="text-gray-600">Email adresinizle hızlıca üye olun.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                2
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">İşlemlerinizi Girin</h4>
                <p className="text-gray-600">Gelir ve giderlerinizi kategorilere ayırarak ekleyin.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                3
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">Raporları İnceleyin</h4>
                <p className="text-gray-600">Detaylı raporlar ve grafiklerle finansal durumunuzu takip edin.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}