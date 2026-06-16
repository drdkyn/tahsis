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
  emeklilikKosullari: EmeklilikKosulu[];
  yakinEmeklilik: {
    adi: string;
    tarih: Date;
    kalan: number;
  } | null;
}

// Kademeli 506 SK tablosu
export const kademeli506Tablosu = {
  erkek: [
    { basla: '1970-01-01', yas: null, hizmet: 25, priGunu: 5000 },
    { basla: '1976-09-09', yas: 44, hizmet: 25, priGunu: 5000 },
    { basla: '1979-05-24', yas: 45, hizmet: 25, priGunu: 5000 },
    { basla: '1980-11-24', yas: 46, hizmet: 25, priGunu: 5075 },
    { basla: '1982-05-24', yas: 47, hizmet: 25, priGunu: 5150 },
    { basla: '1983-11-24', yas: 48, hizmet: 25, priGunu: 5225 },
    { basla: '1985-05-24', yas: 49, hizmet: 25, priGunu: 5300 },
    { basla: '1986-11-24', yas: 50, hizmet: 25, priGunu: 5375 },
    { basla: '1988-05-24', yas: 51, hizmet: 25, priGunu: 5450 },
    { basla: '1989-11-24', yas: 52, hizmet: 25, priGunu: 5525 },
    { basla: '1991-05-24', yas: 53, hizmet: 25, priGunu: 5600 },
    { basla: '1992-11-24', yas: 54, hizmet: 25, priGunu: 5675 },
    { basla: '1994-05-24', yas: 55, hizmet: 25, priGunu: 5750 },
    { basla: '1995-11-24', yas: 56, hizmet: 25, priGunu: 5825 },
    { basla: '1997-05-24', yas: 57, hizmet: 25, priGunu: 5900 },
    { basla: '1998-11-24', yas: 58, hizmet: 25, priGunu: 5975 },
    { basla: '1999-09-08', yas: 60, hizmet: null, priGunu: 7000 },
  ],
  kadin: [
    { basla: '1970-01-01', yas: null, hizmet: 20, priGunu: 5000 },
    { basla: '1981-09-09', yas: 40, hizmet: 20, priGunu: 5000 },
    { basla: '1984-05-24', yas: 41, hizmet: 20, priGunu: 5000 },
    { basla: '1985-05-24', yas: 42, hizmet: 20, priGunu: 5075 },
    { basla: '1986-05-24', yas: 43, hizmet: 20, priGunu: 5150 },
    { basla: '1987-05-24', yas: 44, hizmet: 20, priGunu: 5225 },
    { basla: '1988-05-24', yas: 45, hizmet: 20, priGunu: 5300 },
    { basla: '1989-05-24', yas: 46, hizmet: 20, priGunu: 5375 },
    { basla: '1990-05-24', yas: 47, hizmet: 20, priGunu: 5450 },
    { basla: '1991-05-24', yas: 48, hizmet: 20, priGunu: 5525 },
    { basla: '1992-05-24', yas: 49, hizmet: 20, priGunu: 5600 },
    { basla: '1993-05-24', yas: 50, hizmet: 20, priGunu: 5675 },
    { basla: '1994-05-24', yas: 51, hizmet: 20, priGunu: 5750 },
    { basla: '1995-05-24', yas: 52, hizmet: 20, priGunu: 5825 },
    { basla: '1996-05-24', yas: 53, hizmet: 20, priGunu: 5900 },
    { basla: '1997-05-24', yas: 54, hizmet: 20, priGunu: 5975 },
    { basla: '1998-05-24', yas: 55, hizmet: 20, priGunu: 5975 },
    { basla: '1999-05-24', yas: 56, hizmet: 20, priGunu: 5975 },
    { basla: '1999-09-08', yas: 58, hizmet: null, priGunu: 7000 },
  ],
};

export const parseDate = (str: string): Date => new Date(str);

export const dateFark = (d1: Date, d2: Date): number => {
  return Math.floor((d2.getTime() - d1.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

export const getKademeli506 = (cinsiyet: 'erkek' | 'kadin', ilkGirisTari: Date) => {
  const tablo = kademeli506Tablosu[cinsiyet];
  let sonuc = tablo[0];
  for (let row of tablo) {
    if (parseDate(row.basla) <= ilkGirisTari) {
      sonuc = row;
    } else {
      break;
    }
  }
  return sonuc;
};

export const hesaplaEmeklilik = (
  dogumTarihi: string,
  ilkIsGirisTarihi: string,
  priGunu: number,
  borclanlmisGun: number,
  madenGunu: number,
  cinsiyet: 'erkek' | 'kadin',
  statular: string[]
): HesaplamaResultati => {
  const dogumTar = parseDate(dogumTarihi);
  const ilkGirisTar = parseDate(ilkIsGirisTarihi);
  const simdiBugnu = new Date();

  const yas = dateFark(dogumTar, simdiBugnu);
  const hizmetYili = dateFark(ilkGirisTar, simdiBugnu);
  const priGunleri = priGunu + borclanlmisGun + madenGunu;

  const emeklilikKosullari: EmeklilikKosulu[] = [];

  // 4/a (SSK) - 506 SK
  if (statular.includes('4a')) {
    const kad506 = getKademeli506(cinsiyet, ilkGirisTar);

    // Normal emeklilik
    emeklilikKosullari.push({
      adi: '506 SK - Normal Emeklilik',
      kosullar: [
        {
          ad: 'Hizmet Yılı',
          gerekli: kad506.hizmet,
          sahip: hizmetYili,
          basarili: !kad506.hizmet || hizmetYili >= kad506.hizmet,
        },
        {
          ad: 'Yaş',
          gerekli: kad506.yas,
          sahip: yas,
          basarili: !kad506.yas || yas >= kad506.yas,
        },
        {
          ad: 'Prim Günü',
          gerekli: kad506.priGunu,
          sahip: priGunleri,
          basarili: priGunleri >= kad506.priGunu,
        },
      ],
      tamamlandi:
        (!kad506.hizmet || hizmetYili >= kad506.hizmet) &&
        (!kad506.yas || yas >= kad506.yas) &&
        priGunleri >= kad506.priGunu,
    });

    // EYT koşulları (08.09.1999 öncesi)
    if (ilkGirisTar < parseDate('1999-09-08')) {
      emeklilikKosullari.push({
        adi: 'EYT - Yaşsız (Normal)',
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

    // Yaştan emeklilik (temel 506)
    emeklilikKosullari.push({
      adi: '506 SK - Yaştan Emeklilik',
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

    // 5510 SK (01.10.2008 sonrası)
    if (ilkGirisTar >= parseDate('2008-10-01')) {
      emeklilikKosullari.push({
        adi: '5510 SK - Ana Yaşlılık Aylığı',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Prim Günü',
            gerekli: 7200,
            sahip: priGunleri,
            basarili: priGunleri >= 7200,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) && priGunleri >= 7200,
      });

      emeklilikKosullari.push({
        adi: '5510 SK - 15 Yıl + Gün Koşulu',
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: 15,
            sahip: hizmetYili,
            basarili: hizmetYili >= 15,
          },
          {
            ad: 'Prim Günü',
            gerekli: 4320,
            sahip: priGunleri,
            basarili: priGunleri >= 4320,
          },
        ],
        tamamlandi: hizmetYili >= 15 && priGunleri >= 4320,
      });
    }
  }

  // 2926 SK - Tarım Bağ-Kuru
  if (statular.includes('2926')) {
    emeklilikKosullari.push({
      adi: '2926 SK - Tarım Emekliliği',
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

  // Maden emekliliği
  if (statular.includes('maden') && madenGunu >= 1800) {
    emeklilikKosullari.push({
      adi: 'Maden Yeraltı Emekliliği',
      kosullar: [
        {
          ad: 'Yaş',
          gerekli: 50,
          sahip: yas,
          basarili: yas >= 50,
        },
        {
          ad: 'Hizmet Yılı',
          gerekli: 20,
          sahip: hizmetYili,
          basarili: hizmetYili >= 20,
        },
        {
          ad: 'Maden Günü',
          gerekli: 1800,
          sahip: madenGunu,
          basarili: madenGunu >= 1800,
        },
        {
          ad: 'Toplam Gün',
          gerekli: 7200,
          sahip: priGunleri,
          basarili: priGunleri >= 7200,
        },
      ],
      tamamlandi:
        yas >= 50 && hizmetYili >= 20 && madenGunu >= 1800 && priGunleri >= 7200,
    });
  }

  // En yakın emeklilik tarihi
  let yakinEmeklilik: { adi: string; tarih: Date; kalan: number } | null = null;

  if (statular.includes('4a')) {
    const kad506 = getKademeli506(cinsiyet, ilkGirisTar);
    const hedefler: { adi: string; tarih: Date; kalan: number }[] = [];

    if (kad506.yas) {
      const yasTam = new Date(dogumTar);
      yasTam.setFullYear(yasTam.getFullYear() + kad506.yas);
      const kalan = dateFark(simdiBugnu, yasTam);
      if (kalan > 0) {
        hedefler.push({ adi: 'Yaştan Emeklilik', tarih: yasTam, kalan });
      }
    }

    if (kad506.hizmet) {
      const hizmetTam = new Date(ilkGirisTar);
      hizmetTam.setFullYear(hizmetTam.getFullYear() + kad506.hizmet);
      const kalan = dateFark(simdiBugnu, hizmetTam);
      if (kalan > 0) {
        hedefler.push({ adi: 'Normal Emeklilik', tarih: hizmetTam, kalan });
      }
    }

    if (hedefler.length > 0) {
      hedefler.sort((a, b) => a.tarih.getTime() - b.tarih.getTime());
      yakinEmeklilik = hedefler[0];
    }
  }

  return {
    yas,
    hizmetYili,
    priGunleri,
    emeklilikKosullari,
    yakinEmeklilik,
  };
};
