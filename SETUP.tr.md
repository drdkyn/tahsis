# 🚀 Emeklilik Hesaplayıcı - Kurulum ve Deploy Rehberi

## 📊 Proje Özeti

| Özellik | Değer |
|---------|-------|
| **Toplam Dosya** | 20 |
| **Kod Satırı** | 1.500+ |
| **Framework** | Next.js 14 |
| **Stil** | Tailwind CSS |
| **Dil** | TypeScript |
| **Deploy** | Vercel |

---

## 🎯 Özellikler

✅ Form validasyonu (veri kontrol eden)  
✅ Responsive tasarım (telefon + bilgisayar)  
✅ Tek sayfada tüm bilgiler  
✅ Real-time hesaplama  
✅ MÜKTEZA tabanlı (78 sayfa verisi)  
✅ GitHub + Vercel entegrasyonu  

---

## 📦 Kurulum (5 dakika)

### Seçenek 1: ZIP ile İndir ve Kur

```bash
# 1. Klasöre gir
cd emeklilik-hesaplama-app

# 2. Bağımlılıkları yükle
npm install

# 3. Sunucuyu başlat
npm run dev

# 4. Tarayıcıda aç: http://localhost:3000
```

### Seçenek 2: Git ile Klonla

```bash
git clone https://github.com/USERNAME/emeklilik-hesaplama.git
cd emeklilik-hesaplama
npm install
npm run dev
```

---

## 🌐 GitHub'a Yükleme

### 1. GitHub Repository Oluştur

1. GitHub.com'a git
2. **+** → **New repository**
3. İsim: `emeklilik-hesaplama`
4. **Create** ye tıkla

### 2. Terminal'de Push Et

```bash
cd emeklilik-hesaplama-app
git init
git remote add origin https://github.com/USERNAME/emeklilik-hesaplama.git
git branch -M main
git add .
git commit -m "Initial commit: MÜKTEZA based retirement calculator"
git push -u origin main
```

✅ Artık GitHub'da: https://github.com/USERNAME/emeklilik-hesaplama

---

## 🚀 Vercel'de Deploy

### Seçenek A: Otomatik (Önerilir)

1. https://vercel.com git
2. **GitHub ile sign up**
3. **Add New Project**
4. `emeklilik-hesaplama` seç
5. **Deploy**

**Sonuç:** https://emeklilik-hesaplama.vercel.app (canlı yayında)

### Seçenek B: CLI ile

```bash
npm i -g vercel
vercel

# Soruları cevapla:
# - Project name: emeklilik-hesaplama
# - Framework: Next.js
# - Deploy: evet
```

---

## 📁 Dosya Yapısı

```
emeklilik-hesaplama-app/
├── 📄 Yapılandırma Dosyaları
│   ├── package.json              (bağımlılıklar)
│   ├── tsconfig.json             (TypeScript ayarları)
│   ├── next.config.js            (Next.js ayarları)
│   ├── tailwind.config.js        (stil ayarları)
│   ├── postcss.config.js         (CSS işleyici)
│   ├── vercel.json               (Vercel deploy config)
│   └── .eslintrc.json            (kod kontrolü)
│
├── 📚 Belge Dosyaları
│   ├── README.md                 (proje açıklaması)
│   ├── GITHUB_SETUP.md           (GitHub talimatları)
│   ├── QUICKSTART.md             (hızlı başlangıç)
│   ├── LICENSE                   (MIT lisansı)
│   └── .env.example              (ortam değişkenleri)
│
├── 🎨 UI Katmanı (app/)
│   ├── layout.tsx                (sayfa layout)
│   ├── page.tsx                  (ana sayfa - 250+ satır)
│   └── globals.css               (global stiller)
│
├── 🧩 Bileşenler (components/)
│   ├── FormSection.tsx           (form input alanları)
│   ├── ResultCard.tsx            (sonuç gösterimi)
│   └── StatCard.tsx              (istatistik kartı)
│
└── 🧮 İşletme Mantığı (lib/)
    └── calculator.ts             (hesaplama fonksiyonları)
```

---

## ✨ Öne Çıkan Özellikler

### 1️⃣ Form Validasyonu
- Doğum tarihi kontrol
- İş giriş tarihi kontrol
- Prim günü sınırı (0-20000)
- Maden günü sınırı (0-10000)
- En az bir statü seçimi

### 2️⃣ Responsive Tasarım
**Mobil (≤640px):**
- Form üstte
- Sonuçlar altında
- Tek sütun layout

**Bilgisayar (>1024px):**
- Form yan tarafta (sticky)
- Sonuçlar sağda geniş
- 3 sütun grid

### 3️⃣ Emeklilik Hesaplaması
- **506 SK:** Normal, yaştan, EYT, kademeli
- **5510 SK:** Ana yaşlılık, 15 yıl + gün
- **2926 SK:** Tarım Bağ-Kuru
- **Maden:** Yeraltı çalışması
- **Tahmini Tarih:** Geri sayım

### 4️⃣ Borçlanma Desteği
- Askerlik günleri
- Doğum günleri
- Yurtdışı hizmeti
- Usta öğretici

---

## 🔧 Geliştirme

### Kodu Değiştir ve Test Et

```bash
# 1. İhtiyacınız bir dosyayı edit edin
# App dosyaları: app/page.tsx
# Stil değişiklikleri: app/globals.css
# Bileşenler: components/*.tsx
# Hesaplama: lib/calculator.ts

# 2. Sunucu otomatik yenilenir (hot reload)
# Değişiklikleri tarayıcıda gör

# 3. Build test et
npm run build

# 4. Git'e kaydet
git add .
git commit -m "Özellik: [açıklama]"
git push
```

### Vercel Otomatik Deploy
- Her `git push`'te otomatik build
- Başarısız build'lerde bildirim
- Production URL güncellenir

---

## 🐛 Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| `npm install` hatası | `npm cache clean --force` sonra tekrar dene |
| Port 3000 kullanımda | `npm run dev -- -p 3001` |
| TypeScript hatası | `npm run build` ile kontrol et |
| Vercel deploy fail | Yerel build test: `npm run build && npm start` |
| Form gönderilmiyor | DevTools'da hataları kontrol et (F12) |

---

## 📋 Checklist: Deploy Sonrası

- [ ] GitHub repo oluşturuldu
- [ ] Tüm dosyalar push edendi
- [ ] Vercel connected
- [ ] Production URL test edildi
- [ ] README linkler güncellendi
- [ ] GitHub stars verdik mi? ⭐

---

## 🎓 Öğrenme Kaynakları

- **Next.js:** https://nextjs.org/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind:** https://tailwindcss.com/docs
- **Vercel:** https://vercel.com/docs

---

## 📞 Destek

**Soruları varsa:**
1. README.md dosyasını oku
2. GITHUB_SETUP.md kontrol et
3. QUICKSTART.md'ye bak
4. Kod içindeki yorum satırlarını incele

---

## 📄 Lisans

MIT License - Özgürce kullan, değiştir, paylaş

---

**Son Kontrol Listesi:**
- ✅ Node.js 18+ yüklü
- ✅ GitHub hesabı var
- ✅ Vercel hesabı var (opsiyonel)
- ✅ npm çalışıyor
- ✅ Git kurulu

**Hepsi tamam? Başla! 🚀**

```bash
npm install && npm run dev
```
