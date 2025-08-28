# Kasa Takip Uygulaması

Modern, kullanıcı dostu online kasa takip uygulaması. İşletmenizin gelir ve giderlerini kolayca takip edin, detaylı raporlar alın.

## Özellikler

- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Gelir/Gider ekleme, düzenleme ve silme
- ✅ Kategorilere göre organize etme
- ✅ Tarih bazlı filtreleme ve arama
- ✅ Detaylı raporlar ve grafikler
- ✅ CSV formatında dışa aktarım
- ✅ Responsive tasarım (mobil uyumlu)
- ✅ Gerçek zamanlı bakiye takibi

## Teknolojiler

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Charts:** Recharts
- **Hosting:** Vercel (önerilen)

## Kurulum

### 1. Projeyi Klonlayın

```bash
cd kasa-takip
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Supabase Kurulumu

1. [Supabase.com](https://supabase.com) adresinden ücretsiz hesap oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından API anahtarlarınızı alın
4. `supabase/schema.sql` dosyasındaki SQL komutlarını Supabase SQL Editor'da çalıştırın

### 4. Çevre Değişkenleri

`.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Uygulamayı Çalıştırın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## Deployment (Vercel)

1. GitHub'a projeyi yükleyin
2. [Vercel.com](https://vercel.com) hesabı oluşturun
3. GitHub reponuzu Vercel'e bağlayın
4. Çevre değişkenlerini Vercel dashboard'dan ekleyin
5. Deploy edin!

## Kullanım

1. **Kayıt Ol:** Email ve şifre ile üye olun
2. **Giriş Yap:** Hesabınıza giriş yapın
3. **İşlem Ekle:** Gelir veya gider ekleyin
4. **Raporları İncele:** Grafikler ve detaylı raporları görüntüleyin
5. **Dışa Aktar:** İstediğiniz tarih aralığındaki verileri CSV olarak indirin

## Proje Yapısı

```
kasa-takip/
├── app/                    # Next.js app dizini
│   ├── dashboard/         # Dashboard sayfaları
│   │   ├── layout.tsx    # Dashboard layout
│   │   ├── page.tsx      # Ana dashboard
│   │   ├── transactions/ # İşlemler sayfaları
│   │   └── reports/      # Raporlar sayfası
│   ├── login/            # Giriş sayfası
│   ├── signup/           # Kayıt sayfası
│   └── page.tsx          # Ana sayfa
├── lib/                   # Yardımcı fonksiyonlar
│   └── supabase/         # Supabase bağlantıları
├── types/                # TypeScript tip tanımlamaları
└── supabase/             # Veritabanı şeması
```

## Veritabanı Şeması

### Tablolar

- **categories:** Gelir/gider kategorileri
- **transactions:** İşlem kayıtları

### Özellikler

- Row Level Security (RLS) ile veri güvenliği
- Otomatik varsayılan kategori oluşturma
- Timestamp yönetimi

## Lisans

MIT

## Destek

Herhangi bir sorun veya öneri için issue açabilirsiniz.