# 🚀 Emeklilik Hesaplama - GitHub Deploy Özeti

## ✅ Tamamlanan Değişiklikler

### SK 28/4 (İlk İşe Girişte Malül - Yaşsız)
```
4/a (SSK):
  08.09.1999 öncesi    → 15y + 3600g (Kadın 58), 20y + 5000g (Erkek)
  09.09.1999-30.04.2008→ 15y + 3960g
  01.05.2008 sonrası   → 15y + 3960g

4/b (Bağ-Kur):
  08.09.1999 öncesi    → 20y + 7200g
  09.09.1999-30.04.2008→ 15y + 5400g + Yaş(60/62)
  01.05.2008+          → Yaş(58-62) + 9000g (hizmet yılı yok!)

4/c (Memur):
  08.09.1999 öncesi    → 25y + 9000g
  09.09.1999-30.04.2008→ 25y + 9000g + Yaş(58/60)
  01.05.2008+          → Yaş(58-62) + 9000g (hizmet yılı yok!)
```

### SK 28/5 (İşe Girdikten Sonra Malül - Dereceli)
```
4/a:  %40-%49(20y+5075g) / %50-%59(15y+5300g) / %60+(10y+5450g)
4/b:  %40-%49(15y+5400g) / %50-%59(12y+5400g) / %60+(10y+3960g)
4/c:  %40-%49(20y+6480g) / %50-%59(15y+5760g) / %60+(10y+5760g)

Bakıma Muhtaçlık: Her derecede → 10y + (gün × %70)
```

### Tarih Kontrol Noktaları
- **08.09.1999** → EYT sınırı
- **01.05.2008** → Kanun değişikliği (SK Md.28/2)
- **27.04.2005** → 4/c için ayrı kurallar
- **31.12.2035/01.01.2036** → Yaş artış tabloları

## 📁 Değişen Dosyalar

### `lib/maluluk-tablosu.ts`
- `SK284_4A`, `SK284_4B`, `SK284_4C` → SK 28/4 tüm statüler
- `SK285_4A`, `SK285_4B`, `SK285_4C` → SK 28/5 dereceli
- `getSK284Sarti(statü, girisGunu, cinsiyet)` → yaş+hizmet+gün
- `getSK285Sarti(statü, derece)` → hizmet+gün
- `getMalulDereceleri()` → derece listesi

### `lib/calculator.ts`
- ✅ 4/a SK 28/4 hesaplama
- ✅ 4/a SK 28/5 hesaplama (dereceli)
- ✅ 4/b SK 28/4 hesaplama
- ✅ 4/b SK 28/5 hesaplama (yaşlı)
- ✅ 4/c SK 28/4 hesaplama
- ✅ 4/c SK 28/5 hesaplama (yaşlı)
- ✅ 2925 (Tarım Sigortası)
- ✅ En erken emeklilik tarihi hesaplama

### `app/page.tsx`
- Form state: `malulBirimi` ('yok' | 'sk28/4' | 'sk28/5')
- Malüllük seçim dropdown

## 🔧 Fonksiyonlar

```typescript
// SK 28/4 (Giriş tarihine göre)
getSK284Sarti('4a', new Date(1995, 0, 1), 'erkek')
// → { hizmetYili: 15, gun: 3960, yas: null, adi: "..." }

// SK 28/5 (Dereceli)
getSK285Sarti('4b', '%50-%59')
// → { hizmetYili: 12, gun: 5400, yas: null }

// Dereceler
getMalulDereceleri()
// → [{ value: '%40-%49', label: '%40-%49 (Hafif)' }, ...]
```

## 🧪 Test Senaryoları

### Test 1: 4/a SK 28/4
```
Doğum: 08.09.1975 (EYT öncesi)
İlk İş: 01.01.1995
Statü: 4/a
Malüllük: İlk işe girişte malül (SK 28/4)
Cinsiyet: Erkek

✓ Hizmet Yılı: 20y gerekli, 29y var → UYGUN
✓ Prim Günü: 5000g gerekli, (priGunu) → KONTROL ET
✓ Yaş: Şart yok (yaşsız)
→ Tahmini Emeklilik: BUGÜN
```

### Test 2: 4/b SK 28/4
```
Doğum: 15.05.1980
İlk İş: 01.01.2000
Statü: 4/b
Malüllük: İlk işe girişte malül
Cinsiyet: Kadın

✓ Tarih aralığı: 01.01.2000 → 09.09.1999-30.04.2008
✓ Hizmet Yılı: 15y gerekli
✓ Yaş: 60 gerekli
✓ Prim Günü: 5400g gerekli
```

### Test 3: 4/a SK 28/5
```
Statü: 4/a
Malüllük: İşe girdikten sonra malül
Derece: %50-%59
Bakıma Muhtaç: Evet

✓ Hizmet Yılı: 10y gerekli (bakıma muhtaç)
✓ Prim Günü: 3710g gerekli (5300 × %70)
```

## 📦 Deployment

### Vercel'de Yeni Deploy

1. **Mevcut sil:**
   - https://vercel.com/dashboard
   - emeklilik-hesaplama → Settings → Delete Project

2. **Yeni import et:**
   - https://vercel.com/new
   - GitHub: drdkyn/emeklilik-hesaplama
   - Deploy

3. **Otomatik Build:**
   - 3-5 dakika bekle
   - Tüm değişiklikler canlı olacak

## 📝 Notlar

- ✅ Form boş başlıyor (default value yok)
- ✅ Malüllük seçimi dinamik
- ✅ Derece dropdown SK 28/5'te gösterilir
- ✅ Bakıma muhtaçlık checkbox entegre
- ⚠️ SK 28/5'te yaş şartı 4/b ve 4/c'de VAR (4/a'da yok)

## 🔗 Repository

```
GitHub: https://github.com/drdkyn/emeklilik-hesaplama
Main Branch: ad14c16 (Latest)
```

---

**Hazırlandı:** 16.06.2026
**Son Commit:** ad14c16 - Complete: Full SK 28/4 and SK 28/5 implementation
