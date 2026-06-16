import { getMalullikSaritlari, getMalulDereceleri } from './maluluk-tablosu';

export interface EmeklilikKosulu {
  adi: string;
  kosullar: {
    ad: string;
    gerekli: number | null;
    sahip: number;
    basarili: boolean;
  }[];
  tamamlandi: boolean;
}

export interface HesaplamaResultati {
  yas: number;
  hizmetYili: number;
  priGunleri: number;
  hesaplananIlkIsGirisTarihi?: string;
  emeklilikKosullari: EmeklilikKosulu[];
  yakinEmeklilik: {
    adi: string;
    tarih: Date;
    kalan: number;
  } | null;
}

// ============= CONSTANTS & HELPERS =============

const EYT_SINIR_TARIHI = new Date(1999, 8, 8); // 08.09.1999 DAHİL

// Dönem-bazlı gün tablosu (5510 SK 28/4)
const ENGELLI_GUN_TABLOSU: { basla: Date; bitis?: Date; gun: number }[] = [
  { basla: new Date(1900, 0, 1), bitis: new Date(2008, 9, 30), gun: 3600 },
  { basla: new Date(2008, 9, 1), bitis: new Date(2008, 11, 31), gun: 3700 },
  { basla: new Date(2009, 0, 1), bitis: new Date(2009, 11, 31), gun: 3800 },
  { basla: new Date(2010, 0, 1), bitis: new Date(2010, 11, 31), gun: 3900 },
  { basla: new Date(2011, 0, 1), bitis: undefined, gun: 3960 },
];

export const parseDate = (str: string): Date => new Date(str);

export const dateFark = (d1: Date, d2: Date): number => {
  return Math.floor((d2.getTime() - d1.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

const getEngelliGun = (tarih: Date): number => {
  for (const tab of ENGELLI_GUN_TABLOSU) {
    const bitisTarihi = tab.bitis || new Date(2099, 11, 31);
    if (tarih >= tab.basla && tarih <= bitisTarihi) {
      return tab.gun;
    }
  }
  return 3960;
};

// ============= MAIN CALCULATOR =============

export const hesaplaEmeklilik = (
  dogumTarihi: string,
  ilkIsGirisTarihi: string,
  priGunu: number,
  askerlikBorclanlmasi: number,
  askerlikNedir: 'once' | 'sonra',
  cinsiyet: 'erkek' | 'kadin',
  statular: string[],
  malulBirimi?: string,
  malulDerece?: string,
  bagimaMuhtac?: boolean
): HesaplamaResultati => {
  const dogumTar = parseDate(dogumTarihi);
  const originalIlkGirisTar = parseDate(ilkIsGirisTarihi);
  const simdiBugnu = new Date();

  let ilkGirisTar = originalIlkGirisTar;
  let hesaplananIlkIsGirisTarihi = '';
  
  if (askerlikNedir === 'once' && askerlikBorclanlmasi > 0) {
    ilkGirisTar = new Date(originalIlkGirisTar);
    ilkGirisTar.setDate(ilkGirisTar.getDate() - askerlikBorclanlmasi);
    hesaplananIlkIsGirisTarihi = ilkGirisTar.toLocaleDateString('tr-TR');
  }

  // ========== 18 YAŞ KURALI (4/a İÇİN) ==========
  // Hizmet yılı hesaplaması 18 yaştan önceki dönemi saymaz
  const dogum18Yas = new Date(dogumTar);
  dogum18Yas.setFullYear(dogum18Yas.getFullYear() + 18);
  
  // Hizmet yılının başlangıcı: 18 yaş vs ilk işe giriş tarihinden daha sonrası
  let hizmetBaslangici = ilkGirisTar;
  if (ilkGirisTar < dogum18Yas) {
    hizmetBaslangici = dogum18Yas; // 18 yaş tarihinden başla
  }

  const yas = dateFark(dogumTar, simdiBugnu);
  const hizmetYili = dateFark(hizmetBaslangici, simdiBugnu); // 18 yaşından itibaren
  const priGunleri = priGunu + askerlikBorclanlmasi;

  const emeklilikKosullari: EmeklilikKosulu[] = [];

  // ========== 4/a (SSK) ==========
  if (statular.includes('4a')) {
    // EYT Yaşsız
    if (ilkGirisTar <= EYT_SINIR_TARIHI) {
      emeklilikKosullari.push({
        adi: '4/a (SSK) - EYT Yaşsız',
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: cinsiyet === 'erkek' ? 25 : 20,
            sahip: hizmetYili,
            basarili: hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20),
          },
          {
            ad: 'Prim Günü',
            gerekli: 5000,
            sahip: priGunleri,
            basarili: priGunleri >= 5000,
          },
        ],
        tamamlandi:
          hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20) && priGunleri >= 5000,
      });
    }

    // Yaştan Emeklilik
    emeklilikKosullari.push({
      adi: '4/a (SSK) - Yaştan Emeklilik',
      kosullar: [
        {
          ad: 'Yaş',
          gerekli: cinsiyet === 'erkek' ? 60 : 55,
          sahip: yas,
          basarili: yas >= (cinsiyet === 'erkek' ? 60 : 55),
        },
        {
          ad: 'Hizmet Yılı',
          gerekli: 15,
          sahip: hizmetYili,
          basarili: hizmetYili >= 15,
        },
        {
          ad: 'Prim Günü',
          gerekli: 3600,
          sahip: priGunleri,
          basarili: priGunleri >= 3600,
        },
      ],
      tamamlandi:
        yas >= (cinsiyet === 'erkek' ? 60 : 55) &&
        hizmetYili >= 15 &&
        priGunleri >= 3600,
    });

    // ========== 4/a MALÜLÜK EMEKLİLİĞİ (SK 28/5) ==========
    // İşe girdikten sonra malül olan sigortalılar
    if (malulBirimi === 'sk28/5' && malulDerece && statular.includes('4a')) {
      const malulSarti = getMalullikSaritlari('4a', 'sk28/5', malulDerece);
      
      if (malulSarti) {
        let gerekliHizmetYili = malulSarti.hizmetYili;
        let gerekliGunSayisi = malulSarti.gunSayisi;

        // Bakıma muhtaçlık durumunda şartlar azalır
        if (bagimaMuhtac) {
          gerekliHizmetYili = 10; // Bakıma muhtaç ise 10 yıl yeterli
          gerekliGunSayisi = Math.floor(malulSarti.gunSayisi * 0.7); // Gün sayısı %70'i
        }

        emeklilikKosullari.push({
          adi: `4/a (SSK) - Malüllük Emekliği (${malulDerece})${bagimaMuhtac ? ' - Bakıma Muhtaç' : ''}`,
          kosullar: [
            {
              ad: 'Hizmet Yılı',
              gerekli: gerekliHizmetYili,
              sahip: hizmetYili,
              basarili: hizmetYili >= gerekliHizmetYili,
            },
            {
              ad: `Prim Günü (${gerekliGunSayisi} gün)`,
              gerekli: gerekliGunSayisi,
              sahip: priGunleri,
              basarili: priGunleri >= gerekliGunSayisi,
            },
          ],
          tamamlandi: hizmetYili >= gerekliHizmetYili && priGunleri >= gerekliGunSayisi,
        });
      }
    }
  }

  // ========== 4/b (Bağ-Kur) ==========
  if (statular.includes('4b')) {
    // EYT Yaşsız
    if (ilkGirisTar <= EYT_SINIR_TARIHI) {
      emeklilikKosullari.push({
        adi: '4/b (Bağ-Kur) - EYT Yaşsız',
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: cinsiyet === 'erkek' ? 25 : 20,
            sahip: hizmetYili,
            basarili: hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20),
          },
          {
            ad: 'Prim Günü',
            gerekli: cinsiyet === 'erkek' ? 9000 : 7200,
            sahip: priGunleri,
            basarili: priGunleri >= (cinsiyet === 'erkek' ? 9000 : 7200),
          },
        ],
        tamamlandi:
          hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20) &&
          priGunleri >= (cinsiyet === 'erkek' ? 9000 : 7200),
      });
    }

    // 5510 SK Geçici 9/1 (09.09.1999 - 30.04.2008)
    if (
      ilkGirisTar > EYT_SINIR_TARIHI &&
      ilkGirisTar < new Date(2008, 4, 1)
    ) {
      emeklilikKosullari.push({
        adi: '4/b - 5510 SK Geçici 9/1 (09.09.1999-30.04.2008)',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Hizmet Yılı',
            gerekli: 25,
            sahip: hizmetYili,
            basarili: hizmetYili >= 25,
          },
          {
            ad: 'Prim Günü',
            gerekli: 9000,
            sahip: priGunleri,
            basarili: priGunleri >= 9000,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) &&
          hizmetYili >= 25 &&
          priGunleri >= 9000,
      });
    }

    // 5510 SK Md.28/2 (01.05.2008+)
    if (ilkGirisTar >= new Date(2008, 4, 1)) {
      emeklilikKosullari.push({
        adi: '4/b - 5510 SK Md.28/2 (01.05.2008+)',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Prim Günü',
            gerekli: 9000,
            sahip: priGunleri,
            basarili: priGunleri >= 9000,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) && priGunleri >= 9000,
      });
    }
  }

  // ========== 4/b MALÜLÜK EMEKLİLİĞİ (SK 28/5) ==========
  if (malulBirimi === 'sk28/5' && malulDerece && statular.includes('4b')) {
    const malulSarti = getMalullikSaritlari('4b', 'sk28/5', malulDerece);
    
    if (malulSarti) {
      let gerekliHizmetYili = malulSarti.hizmetYili;
      let gerekliGunSayisi = malulSarti.gunSayisi;

      if (bagimaMuhtac) {
        gerekliHizmetYili = 10;
        gerekliGunSayisi = Math.floor(malulSarti.gunSayisi * 0.7);
      }

      emeklilikKosullari.push({
        adi: `4/b (Bağ-Kur) - Malüllük Emekliği (${malulDerece})${bagimaMuhtac ? ' - Bakıma Muhtaç' : ''}`,
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: gerekliHizmetYili,
            sahip: hizmetYili,
            basarili: hizmetYili >= gerekliHizmetYili,
          },
          {
            ad: `Prim Günü (${gerekliGunSayisi} gün)`,
            gerekli: gerekliGunSayisi,
            sahip: priGunleri,
            basarili: priGunleri >= gerekliGunSayisi,
          },
        ],
        tamamlandi: hizmetYili >= gerekliHizmetYili && priGunleri >= gerekliGunSayisi,
      });
    }
  }

  // ========== 4/c (Memur) ==========
  if (statular.includes('4c')) {
    // EYT Yaşsız
    if (ilkGirisTar <= EYT_SINIR_TARIHI) {
      emeklilikKosullari.push({
        adi: '4/c (Memur) - EYT Yaşsız',
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: cinsiyet === 'erkek' ? 25 : 20,
            sahip: hizmetYili,
            basarili: hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20),
          },
          {
            ad: 'Prim Günü',
            gerekli: cinsiyet === 'erkek' ? 9000 : 7200,
            sahip: priGunleri,
            basarili: priGunleri >= (cinsiyet === 'erkek' ? 9000 : 7200),
          },
        ],
        tamamlandi:
          hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20) &&
          priGunleri >= (cinsiyet === 'erkek' ? 9000 : 7200),
      });
    }

    // İstekle Emeklilik (09.09.1999 - 30.04.2008)
    if (
      ilkGirisTar > EYT_SINIR_TARIHI &&
      ilkGirisTar < new Date(2008, 4, 1)
    ) {
      emeklilikKosullari.push({
        adi: '4/c - İstekle Emeklilik (09.09.1999-30.04.2008)',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Hizmet Yılı',
            gerekli: 25,
            sahip: hizmetYili,
            basarili: hizmetYili >= 25,
          },
          {
            ad: 'Prim Günü',
            gerekli: 9000,
            sahip: priGunleri,
            basarili: priGunleri >= 9000,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) &&
          hizmetYili >= 25 &&
          priGunleri >= 9000,
      });
    }

    // 5510 SK Md.28/2 (01.05.2008+)
    if (ilkGirisTar >= new Date(2008, 4, 1)) {
      emeklilikKosullari.push({
        adi: '4/c - 5510 SK Md.28/2 (01.05.2008+)',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Prim Günü',
            gerekli: 9000,
            sahip: priGunleri,
            basarili: priGunleri >= 9000,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) && priGunleri >= 9000,
      });
    }
  }

  // ========== 4/c MALÜLÜK EMEKLİLİĞİ (SK 28/5) ==========
  if (malulBirimi === 'sk28/5' && malulDerece && statular.includes('4c')) {
    const malulSarti = getMalullikSaritlari('4c', 'sk28/5', malulDerece);
    
    if (malulSarti) {
      let gerekliHizmetYili = malulSarti.hizmetYili;
      let gerekliGunSayisi = malulSarti.gunSayisi;

      if (bagimaMuhtac) {
        gerekliHizmetYili = 10;
        gerekliGunSayisi = Math.floor(malulSarti.gunSayisi * 0.7);
      }

      emeklilikKosullari.push({
        adi: `4/c (Memur) - Malüllük Emekliği (${malulDerece})${bagimaMuhtac ? ' - Bakıma Muhtaç' : ''}`,
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: gerekliHizmetYili,
            sahip: hizmetYili,
            basarili: hizmetYili >= gerekliHizmetYili,
          },
          {
            ad: `Prim Günü (${gerekliGunSayisi} gün)`,
            gerekli: gerekliGunSayisi,
            sahip: priGunleri,
            basarili: priGunleri >= gerekliGunSayisi,
          },
        ],
        tamamlandi: hizmetYili >= gerekliHizmetYili && priGunleri >= gerekliGunSayisi,
      });
    }
  }

  // ========== 2925 (Tarım Sigortası) ==========
  if (statular.includes('2925')) {
    emeklilikKosullari.push({
      adi: '2925 (Tarım Sigortası) - Emeklilik',
      kosullar: [
        {
          ad: 'Yaş',
          gerekli: cinsiyet === 'erkek' ? 60 : 58,
          sahip: yas,
          basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
        },
        {
          ad: 'Hizmet Yılı',
          gerekli: 15,
          sahip: hizmetYili,
          basarili: hizmetYili >= 15,
        },
        {
          ad: 'Prim Günü',
          gerekli: 3600,
          sahip: priGunleri,
          basarili: priGunleri >= 3600,
        },
      ],
      tamamlandi:
        yas >= (cinsiyet === 'erkek' ? 60 : 58) &&
        hizmetYili >= 15 &&
        priGunleri >= 3600,
    });
  }

  // ========== YAKIN EMEKLİLİK - EN ERKEN EMEKLİLİK TARİHİ ==========
  let yakinEmeklilik: {
    adi: string;
    tarih: Date;
    kalan: number;
  } | null = null;

  if (statular.length > 0) {
    const hedefler: { adi: string; tarih: Date; kalan: number }[] = [];

    // Tüm tamamlanan koşullardan emeklilik tarihini hesapla
    emeklilikKosullari.forEach((kosul) => {
      if (kosul.tamamlandi) {
        // Koşulun adından tarih türünü çıkar
        let tahminiTarih: Date | null = null;

        if (kosul.adi.includes('EYT Yaşsız')) {
          // EYT yaşsız - hemen (zaten tamamlandıysa)
          tahminiTarih = new Date(simdiBugnu);
        } else if (kosul.adi.includes('Yaştan')) {
          // Yaş şartından emeklilik tarihini hesapla
          const yasSarti = kosul.kosullar.find((k) => k.ad === 'Yaş');
          if (yasSarti && yasSarti.gerekli) {
            const yasTam = new Date(dogumTar);
            yasTam.setFullYear(yasTam.getFullYear() + yasSarti.gerekli);
            tahminiTarih = yasTam;
          }
        } else if (kosul.adi.includes('Malüllük') || kosul.adi.includes('Engelli')) {
          // Malüllük emekliği - hemen (zaten tamamlandıysa)
          tahminiTarih = new Date(simdiBugnu);
        }

        if (tahminiTarih) {
          const kalan = dateFark(simdiBugnu, tahminiTarih);
          if (kalan >= 0) {
            // Sadece gelecekteki tarihleri ekle
            hedefler.push({ adi: kosul.adi, tarih: tahminiTarih, kalan });
          }
        }
      }
    });

    if (hedefler.length > 0) {
      // En erken tarihi seç
      hedefler.sort((a, b) => a.tarih.getTime() - b.tarih.getTime());
      yakinEmeklilik = hedefler[0];
    }
  }

  return {
    yas,
    hizmetYili,
    priGunleri,
    hesaplananIlkIsGirisTarihi,
    emeklilikKosullari,
    yakinEmeklilik,
  };
};
