import { 
  getMalulDereceleri, 
  getSK284Sarti, 
  getSK285Sarti 
} from './maluluk-tablosu';

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

const ENGELLI_GUN_TABLOSU = [
  { basla: new Date(1900, 0, 1), bitis: new Date(2008, 9, 30), gun: 3600 },
  { basla: new Date(2008, 9, 1), bitis: new Date(2008, 11, 31), gun: 3700 },
  { basla: new Date(2009, 0, 1), bitis: new Date(2009, 11, 31), gun: 3800 },
  { basla: new Date(2010, 0, 1), bitis: new Date(2010, 11, 31), gun: 3900 },
  { basla: new Date(2011, 0, 1), bitis: undefined, gun: 3960 },
];

const dateFark = (tarih1: Date, tarih2: Date): number => {
  const ms = tarih2.getTime() - tarih1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

// ============= MAIN CALCULATION FUNCTION =============

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
  if (!dogumTarihi || !ilkIsGirisTarihi || statular.length === 0) {
    return {
      yas: 0,
      hizmetYili: 0,
      priGunleri: priGunu,
      emeklilikKosullari: [],
      yakinEmeklilik: null,
    };
  }

  const dogumTar = new Date(dogumTarihi);
  let ilkGirisTar = new Date(ilkIsGirisTarihi);
  const simdiBugnu = new Date();

  // Askerlik borçlanması hesaplaması
  if (askerlikBorclanlmasi > 0) {
    if (askerlikNedir === 'once') {
      const onceki = new Date(ilkGirisTar);
      onceki.setDate(onceki.getDate() - askerlikBorclanlmasi);
      ilkGirisTar = onceki;
    }
  }

  // Yaş hesaplaması
  let yas = simdiBugnu.getFullYear() - dogumTar.getFullYear();
  const ayFarki =
    simdiBugnu.getMonth() - dogumTar.getMonth();
  if (
    ayFarki < 0 ||
    (ayFarki === 0 && simdiBugnu.getDate() < dogumTar.getDate())
  ) {
    yas--;
  }

  // Hizmet yılı (18 yaş kuralı 4/a'da)
  const dogum18Yas = new Date(dogumTar);
  dogum18Yas.setFullYear(dogum18Yas.getFullYear() + 18);
  let hizmetBaslangici = ilkGirisTar;
  if (
    statular.includes('4a') &&
    ilkGirisTar < dogum18Yas
  ) {
    hizmetBaslangici = dogum18Yas;
  }
  const hizmetYili = dateFark(hizmetBaslangici, simdiBugnu) / 365;

  const priGunleri = priGunu;
  const hesaplananIlkIsGirisTarihi = ilkGirisTar.toLocaleDateString('tr-TR');

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
            sahip: Math.floor(hizmetYili),
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
          sahip: Math.floor(hizmetYili),
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

    // ========== 4/a SK 28/4 - İLK İŞE GİRİŞTE MALÜL (Yaşsız) ==========
    if (malulBirimi === 'sk28/4') {
      const sk284Sarti = getSK284Sarti('4a', ilkGirisTar, cinsiyet);

      if (sk284Sarti) {
        const kosullar = [];

        if (sk284Sarti.hizmetYili) {
          kosullar.push({
            ad: 'Hizmet Yılı',
            gerekli: sk284Sarti.hizmetYili,
            sahip: Math.floor(hizmetYili),
            basarili: hizmetYili >= sk284Sarti.hizmetYili,
          });
        }

        if (sk284Sarti.yas) {
          kosullar.push({
            ad: 'Yaş',
            gerekli: sk284Sarti.yas,
            sahip: yas,
            basarili: yas >= sk284Sarti.yas,
          });
        }

        kosullar.push({
          ad: `Prim Günü (${sk284Sarti.gun} gün)`,
          gerekli: sk284Sarti.gun,
          sahip: priGunleri,
          basarili: priGunleri >= sk284Sarti.gun,
        });

        const tumKosullarBasarili = kosullar.every((k) => k.basarili);

        emeklilikKosullari.push({
          adi: `4/a (SSK) - SK 28/4 İlk İşe Girişte Malül`,
          kosullar,
          tamamlandi: tumKosullarBasarili,
        });
      }
    }

    // ========== 4/a SK 28/5 - İŞE GİRDİKTEN SONRA MALÜL (Dereceli) ==========
    if (malulBirimi === 'sk28/5' && malulDerece) {
      const sk285Sarti = getSK285Sarti('4a', malulDerece);

      if (sk285Sarti) {
        let gerekliHizmetYili = sk285Sarti.hizmetYili;
        let gerekliGunSayisi = sk285Sarti.gun;

        if (bagimaMuhtac) {
          gerekliHizmetYili = 10;
          gerekliGunSayisi = Math.floor(sk285Sarti.gun * 0.7);
        }

        emeklilikKosullari.push({
          adi: `4/a (SSK) - SK 28/5 Malüllük (${malulDerece})${bagimaMuhtac ? ' - Bakıma Muhtaç' : ''}`,
          kosullar: [
            {
              ad: 'Hizmet Yılı',
              gerekli: gerekliHizmetYili,
              sahip: Math.floor(hizmetYili),
              basarili: hizmetYili >= gerekliHizmetYili,
            },
            {
              ad: `Prim Günü (${gerekliGunSayisi} gün)`,
              gerekli: gerekliGunSayisi,
              sahip: priGunleri,
              basarili: priGunleri >= gerekliGunSayisi,
            },
          ],
          tamamlandi:
            hizmetYili >= gerekliHizmetYili &&
            priGunleri >= gerekliGunSayisi,
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
            sahip: Math.floor(hizmetYili),
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

    // Geçici 9/1 (09.09.1999-30.04.2008)
    if (
      ilkGirisTar > EYT_SINIR_TARIHI &&
      ilkGirisTar <= new Date(2008, 3, 30)
    ) {
      emeklilikKosullari.push({
        adi: '4/b (Bağ-Kur) - 5510 SK Geçici 9/1',
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
            sahip: Math.floor(hizmetYili),
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

    // MD.28/2 (01.05.2008+)
    if (ilkGirisTar > new Date(2008, 3, 30)) {
      emeklilikKosullari.push({
        adi: '4/b (Bağ-Kur) - 5510 SK Md.28/2',
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

    // ========== 4/b SK 28/4 - İLK İŞE GİRİŞTE MALÜL ==========
    if (malulBirimi === 'sk28/4') {
      const sk284Sarti = getSK284Sarti('4b', ilkGirisTar, cinsiyet);

      if (sk284Sarti) {
        const kosullar = [];

        if (sk284Sarti.hizmetYili) {
          kosullar.push({
            ad: 'Hizmet Yılı',
            gerekli: sk284Sarti.hizmetYili,
            sahip: Math.floor(hizmetYili),
            basarili: hizmetYili >= sk284Sarti.hizmetYili,
          });
        }

        if (sk284Sarti.yas) {
          kosullar.push({
            ad: 'Yaş',
            gerekli: sk284Sarti.yas,
            sahip: yas,
            basarili: yas >= sk284Sarti.yas,
          });
        }

        kosullar.push({
          ad: `Prim Günü (${sk284Sarti.gun} gün)`,
          gerekli: sk284Sarti.gun,
          sahip: priGunleri,
          basarili: priGunleri >= sk284Sarti.gun,
        });

        const tumKosullarBasarili = kosullar.every((k) => k.basarili);

        emeklilikKosullari.push({
          adi: `4/b (Bağ-Kur) - SK 28/4 İlk İşe Girişte Malül`,
          kosullar,
          tamamlandi: tumKosullarBasarili,
        });
      }
    }

    // ========== 4/b SK 28/5 - İŞE GİRDİKTEN SONRA MALÜL ==========
    if (malulBirimi === 'sk28/5' && malulDerece) {
      const sk285Sarti = getSK285Sarti('4b', malulDerece);

      if (sk285Sarti) {
        let gerekliHizmetYili = sk285Sarti.hizmetYili;
        let gerekliGunSayisi = sk285Sarti.gun;

        if (bagimaMuhtac) {
          gerekliHizmetYili = 10;
          gerekliGunSayisi = Math.floor(sk285Sarti.gun * 0.7);
        }

        emeklilikKosullari.push({
          adi: `4/b (Bağ-Kur) - SK 28/5 Malüllük (${malulDerece})${bagimaMuhtac ? ' - Bakıma Muhtaç' : ''}`,
          kosullar: [
            {
              ad: 'Hizmet Yılı',
              gerekli: gerekliHizmetYili,
              sahip: Math.floor(hizmetYili),
              basarili: hizmetYili >= gerekliHizmetYili,
            },
            {
              ad: `Prim Günü (${gerekliGunSayisi} gün)`,
              gerekli: gerekliGunSayisi,
              sahip: priGunleri,
              basarili: priGunleri >= gerekliGunSayisi,
            },
          ],
          tamamlandi:
            hizmetYili >= gerekliHizmetYili &&
            priGunleri >= gerekliGunSayisi,
        });
      }
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
            sahip: Math.floor(hizmetYili),
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

    // İstekle (09.09.1999-30.04.2008)
    if (
      ilkGirisTar > EYT_SINIR_TARIHI &&
      ilkGirisTar <= new Date(2008, 3, 30)
    ) {
      emeklilikKosullari.push({
        adi: '4/c (Memur) - İstekle Emeklilik',
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
            sahip: Math.floor(hizmetYili),
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

    // MD.28/2 (01.05.2008+)
    if (ilkGirisTar > new Date(2008, 3, 30)) {
      emeklilikKosullari.push({
        adi: '4/c (Memur) - 5510 SK Md.28/2',
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

    // ========== 4/c SK 28/4 - ENGELLİ ==========
    if (malulBirimi === 'sk28/4') {
      const sk284Sarti = getSK284Sarti('4c', ilkGirisTar, cinsiyet);

      if (sk284Sarti) {
        const kosullar = [];

        if (sk284Sarti.hizmetYili) {
          kosullar.push({
            ad: 'Hizmet Yılı',
            gerekli: sk284Sarti.hizmetYili,
            sahip: Math.floor(hizmetYili),
            basarili: hizmetYili >= sk284Sarti.hizmetYili,
          });
        }

        if (sk284Sarti.yas) {
          kosullar.push({
            ad: 'Yaş',
            gerekli: sk284Sarti.yas,
            sahip: yas,
            basarili: yas >= sk284Sarti.yas,
          });
        }

        kosullar.push({
          ad: `Prim Günü (${sk284Sarti.gun} gün)`,
          gerekli: sk284Sarti.gun,
          sahip: priGunleri,
          basarili: priGunleri >= sk284Sarti.gun,
        });

        const tumKosullarBasarili = kosullar.every((k) => k.basarili);

        emeklilikKosullari.push({
          adi: `4/c (Memur) - SK 28/4 İlk İşe Girişte Engelli`,
          kosullar,
          tamamlandi: tumKosullarBasarili,
        });
      }
    }

    // ========== 4/c SK 28/5 - İŞE GİRDİKTEN SONRA MALÜL ==========
    if (malulBirimi === 'sk28/5' && malulDerece) {
      const sk285Sarti = getSK285Sarti('4c', malulDerece);

      if (sk285Sarti) {
        let gerekliHizmetYili = sk285Sarti.hizmetYili;
        let gerekliGunSayisi = sk285Sarti.gun;

        if (bagimaMuhtac) {
          gerekliHizmetYili = 10;
          gerekliGunSayisi = Math.floor(sk285Sarti.gun * 0.7);
        }

        emeklilikKosullari.push({
          adi: `4/c (Memur) - SK 28/5 Malüllük (${malulDerece})${bagimaMuhtac ? ' - Bakıma Muhtaç' : ''}`,
          kosullar: [
            {
              ad: 'Hizmet Yılı',
              gerekli: gerekliHizmetYili,
              sahip: Math.floor(hizmetYili),
              basarili: hizmetYili >= gerekliHizmetYili,
            },
            {
              ad: `Prim Günü (${gerekliGunSayisi} gün)`,
              gerekli: gerekliGunSayisi,
              sahip: priGunleri,
              basarili: priGunleri >= gerekliGunSayisi,
            },
          ],
          tamamlandi:
            hizmetYili >= gerekliHizmetYili &&
            priGunleri >= gerekliGunSayisi,
        });
      }
    }
  }

  // ========== 2925 (Tarım Sigortası) ==========
  if (statular.includes('2925')) {
    emeklilikKosullari.push({
      adi: '2925 (Tarım Sigortası) - Yaştan Emeklilik',
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
          sahip: Math.floor(hizmetYili),
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

    emeklilikKosullari.forEach((kosul) => {
      if (kosul.tamamlandi) {
        let tahminiTarih: Date | null = null;

        if (kosul.adi.includes('EYT Yaşsız')) {
          tahminiTarih = new Date(simdiBugnu);
        } else if (kosul.adi.includes('Yaştan')) {
          const yasSarti = kosul.kosullar.find((k) => k.ad === 'Yaş');
          if (yasSarti && yasSarti.gerekli) {
            const yasTam = new Date(dogumTar);
            yasTam.setFullYear(yasTam.getFullYear() + yasSarti.gerekli);
            tahminiTarih = yasTam;
          }
        } else if (
          kosul.adi.includes('Malüllük') ||
          kosul.adi.includes('Engelli')
        ) {
          tahminiTarih = new Date(simdiBugnu);
        } else if (kosul.adi.includes('SK 28/4')) {
          tahminiTarih = new Date(simdiBugnu);
        }

        if (tahminiTarih) {
          const kalan = dateFark(simdiBugnu, tahminiTarih);
          if (kalan >= 0) {
            hedefler.push({ adi: kosul.adi, tarih: tahminiTarih, kalan });
          }
        }
      }
    });

    if (hedefler.length > 0) {
      hedefler.sort((a, b) => a.tarih.getTime() - b.tarih.getTime());
      yakinEmeklilik = hedefler[0];
    }
  }

  return {
    yas,
    hizmetYili: Math.floor(hizmetYili),
    priGunleri,
    hesaplananIlkIsGirisTarihi,
    emeklilikKosullari,
    yakinEmeklilik,
  };
};
