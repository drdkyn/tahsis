# GitHub'a Yükleme Talimatları 📤

## Adım 1: GitHub'da Repository Oluştur

1. GitHub.com'a git (https://github.com)
2. Sağ üst köşedeki **+** simgesine tıkla
3. **New repository** seç
4. Aşağıdaki bilgileri gir:
   - **Repository name:** `emeklilik-hesaplama`
   - **Description:** Turkish SGK Retirement Calculator
   - **Visibility:** Public
   - **Initialize:** Hiçbir şey seçme (temiz repo)
5. **Create repository** butonuna tıkla

## Adım 2: Yerel Git Kurulumu

Repository klasöründe (emeklilik-hesaplama-app) terminal/komut istemini aç:

```bash
# Git'i başlat
git init

# GitHub repository'ini remote olarak ekle (USERNAME'i değiştir)
git remote add origin https://github.com/USERNAME/emeklilik-hesaplama.git

# Ana branch'i ayarla
git branch -M main

# Tüm dosyaları stage'e al
git add .

# İlk commit'i yap
git commit -m "Initial commit: Next.js emeklilik hesaplama uygulaması"

# GitHub'a push et
git push -u origin main
```

**Not:** `USERNAME` yerine kendi GitHub kullanıcı adını koy.

## Adım 3: Vercel'de Deploy (Opsiyonel ama Önerilir)

### A. Vercel.com'da Account Oluştur
1. https://vercel.com adresine git
2. GitHub ile sign up et
3. Repository'e erişim izni ver

### B. Vercel'e Deploy Et
1. Vercel dashboard'a git
2. **Add New...** → **Project** seç
3. `emeklilik-hesaplama` repository'ini seç
4. **Deploy** butonuna tıkla

Vercel otomatik olarak:
- Build eder
- Test eder
- https://emeklilik-hesaplama.vercel.app gibi bir URL oluşturur

## Adım 4: GitHub Pages (İsteğe Bağlı)

Next.js projesi Vercel üzerinde deploy etmek daha iyidir, ancak Pages kullanan varsa:

1. GitHub repository settings'e git
2. **Pages** seçeneğine git
3. Deploy source olarak Vercel'i seç

## Versiyon Güncelleme

Kodunu güncelledikten sonra:

```bash
# Değişiklikleri kontrol et
git status

# Değişiklikleri stage'e al
git add .

# Commit yap (mesaj yaz)
git commit -m "Özellik: Form validasyonu iyileştirildi"

# Push et
git push origin main
```

Vercel otomatik olarak yeni version'u deploy edecektir.

## Hızlı Referans

| İşlem | Komut |
|-------|-------|
| Repository klona | `git clone https://github.com/USERNAME/emeklilik-hesaplama.git` |
| Değişiklikleri gör | `git status` |
| Tüm dosya ekle | `git add .` |
| Commit yap | `git commit -m "Mesaj"` |
| GitHub'a gönder | `git push origin main` |
| Yeni branch oluştur | `git checkout -b feature/adı` |
| Branch değiştir | `git checkout main` |

## Sorun Giderme

**"fatal: not a git repository"**
→ Komutları proje klasöründe çalıştırdığından emin ol

**"Authentication failed"**
→ SSH key ekle veya GitHub Personal Access Token kullan

**Vercel deploy başarısız**
→ `npm run build` yerel olarak test et
→ `next.config.js` ve `vercel.json` dosyalarını kontrol et

---

**Başarılı deployment sonrası:**
- ✅ GitHub: https://github.com/USERNAME/emeklilik-hesaplama
- ✅ Vercel: https://emeklilik-hesaplama.vercel.app
- ✅ README.md'de linkler güncelle
