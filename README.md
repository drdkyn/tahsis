# Emeklilik Hesaplayıcı 🧮

Turkish SGK (Sosyal Güvenlik Kurumu) emeklilik aylığı bağlama koşulları hesaplayıcısı. MÜKTEZA_01_02_2023.xlsb dosyasına dayanan kapsamlı hesaplama aracı.

## Özellikler ✨

- ✅ **506 SK (SSK)** - Yaştan, Normal, EYT, Kademeli emeklilik koşulları
- ✅ **5510 SK** - Ana yaşlılık aylığı, 15 yıl + gün koşulları
- ✅ **2926 SK** - Tarım Bağ-Kuru emekliliği
- ✅ **Maden Yeraltı Emekliliği** - Özel koşullar
- ✅ **Form Validasyonu** - Gerçek zamanlı veri kontrolü
- ✅ **Responsive Tasarım** - Telefon, tablet ve bilgisayar uyumlu
- ✅ **Tahmini Emeklilik Tarihi** - Geri sayım bildirimi
- ✅ **Borçlanma Günü Desteği** - Askerlik, doğum, yurtdışı vb.

## Teknolojiler 🛠

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vercel** - Deployment

## Kurulum 📦

### Gereksinimler
- Node.js 18.x veya daha yeni
- npm veya yarn

### Adımlar

1. **Repository klonla:**
```bash
git clone https://github.com/drdkyn/emeklilik-hesaplama.git
cd emeklilik-hesaplama
```

2. **Bağımlılıkları yükle:**
```bash
npm install
# veya
yarn install
```

3. **Geliştirme sunucusunu başlat:**
```bash
npm run dev
# veya
yarn dev
```

4. **Tarayıcıda aç:**
```
http://localhost:3000
```

## Build ve Deploy 🚀

### Yerel Build

```bash
npm run build
npm start
```

### Vercel'e Deploy

1. **GitHub'a push et:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Vercel'e bağlan:**
   - https://vercel.com adresine git
   - GitHub hesabıyla giriş yap
   - "New Project" seç
   - Bu repository'i seç
   - Deploy et

Vercel otomatik olarak:
- Build eder
- Tüm pushlarda redeployed yapar
- Preview URL'leri oluşturur

## Dosya Yapısı 📁

```
emeklilik-hesaplama/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Ana sayfa
│   └── globals.css         # Global styles
├── components/
│   ├── FormSection.tsx     # Form component
│   ├── ResultCard.tsx      # Sonuç kartı
│   └── StatCard.tsx        # İstatistik kartı
├── lib/
│   └── calculator.ts       # Hesaplama logics
├── public/                 # Statik dosyalar
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## Kullanım 📖

1. **Form alanlarını doldur:**
   - Doğum tarihi
   - Cinsiyet
   - İlk işe giriş tarihi
   - Prim günü
   - Borçlanmış gün (isteğe bağlı)
   - Maden günü (isteğe bağlı)

2. **Statü seç** (SSK, Bağ-Kur, Memur, Tarım, Maden)

3. **"Hesapla" butonuna tıkla**

4. **Sonuçları incele:**
   - Mevcut yaş, hizmet yılı, prim günü
   - Tahmini emeklilik tarihi
   - Her emeklilik şartı için kontrol

## Veri Kaynakları 📚

- **MÜKTEZA_01_02_2023.xlsb** - Kahramanamaraş SGK Merkezi
- Tüm tabloları 78 sayfalık dosyadan çıkarılmıştır

## Şartlar ve Koşullar ⚖️

**ÖNEMLİ:** Bu araç bilgilendirme amaçlıdır. Kesin bilgi için SGK'ya başvurunuz.

- Hesaplamalar MÜKTEZA'daki tablolara dayanmaktadır
- Her hesaplamadan bir kaydı tutunuz
- SGK kaydında farklılık varsa resmi kayıtlar geçerlidir

## Katkı 🤝

Hataları bildirin veya önerilerde bulunun:
1. Bir Issue açın
2. Kodu geliştirin
3. Pull Request gönderin

## Lisans 📄

MIT License - Detaylar için LICENSE dosyasına bakın

## Yazılan 👨‍💻

**DURDU** (@drdkyn)

---

**Not:** Bu proje açık kaynaktır ve eğitim/kişisel kullanım amaçlıdır.
SGK ile olan resmi işlemlerinizde her zaman onların verdiği bilgileri ve belgelerinizi referans alınız.
