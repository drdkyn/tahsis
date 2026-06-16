# ⚡ Quick Start Guide

## 5 Dakikada Başla

### 1. Depoyu İndir
```bash
# Eğer zip olarak indirdiysen, klasöre gir
cd emeklilik-hesaplama-app

# Git'i başlat (ilk kez için)
git init
```

### 2. Bağımlılıkları Yükle
```bash
npm install
# veya: yarn install
```

### 3. Geliştirme Sunucusunu Başlat
```bash
npm run dev
# veya: yarn dev
```

### 4. Tarayıcıda Aç
```
http://localhost:3000
```

✅ Tamamdır! Uygulama çalışıyor.

---

## Üretim için Build

```bash
npm run build
npm start
```

---

## Vercel'e Deploy (2 Dakika)

1. **GitHub'a push et:**
```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. **Vercel.com'a git**
   - Sign up with GitHub
   - Select this repository
   - Click "Deploy"

3. **Bitir!** 🎉
   - Vercel otomatik URL verecek
   - Her push'ta otomatik deploy olur

---

## Form Alanları

| Alan | Açıklama | Zorunlu |
|------|----------|---------|
| Doğum Tarihi | YYYY-MM-DD | ✅ |
| Cinsiyet | Erkek/Kadın | ✅ |
| İlk İşe Giriş | YYYY-MM-DD | ✅ |
| Prim Günü | 0-20000 | ✅ |
| Borçlanma | Askerlik, doğum vb. | ❌ |
| Maden Günü | 0-10000 | ❌ |
| Statü | SSK, Bağ-Kur vb. | ✅ |

---

## Proje Yapısı

```
📁 emeklilik-hesaplama-app/
├── 📁 app/              → Next.js sayfa router
│   ├── page.tsx         → Ana sayfa
│   ├── layout.tsx       → Sayfa layout
│   └── globals.css      → Global stiller
├── 📁 components/       → React componentleri
│   ├── FormSection.tsx  → Form
│   ├── ResultCard.tsx   → Sonuç kartı
│   └── StatCard.tsx     → İstatistik
├── 📁 lib/              → Yardımcı fonksiyonlar
│   └── calculator.ts    → Hesaplama logics
└── 📄 package.json      → Bağımlılıklar
```

---

## Hızlı Komutlar

```bash
# Geliştirme
npm run dev          # Sunucu başlat

# Production
npm run build        # Build et
npm start            # Başlat

# Git
git add .            # Tüm dosyaları stage'e al
git commit -m "..."  # Commit yap
git push             # GitHub'a gönder
```

---

## Yaygın Sorular

**Q: Localhost:3000 açılmıyor?**
A: Başka bir uygulama aynı portu kullanıyor. `npm run dev -- -p 3001` ile farklı port dene.

**Q: Vercel deploy başarısız?**
A: `npm run build` yerel olarak çalıştır ve hataları kontrol et.

**Q: Git credentials hatası?**
A: SSH key oluştur veya Personal Access Token kullan.

---

## Sonraki Adımlar 📚

1. ✅ Uygulamayı test et
2. ✅ GitHub'a push et (`GITHUB_SETUP.md` dosyasını oku)
3. ✅ Vercel'e deploy et
4. ✅ Arkadaşlarla paylaş: https://emeklilik-hesaplama.vercel.app

---

**Sorular?** README.md veya GITHUB_SETUP.md dosyalarını oku.
