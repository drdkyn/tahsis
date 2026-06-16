/**
 * SK 28/4: İlk İşe Girişte Malül (Yaşsız)
 * SK 28/5: İşe Girdikten Sonra Malül (Dereceli)
 * 
 * Giriş tarihi değişim tarihleri:
 * - 08.09.1999 (EYT sınırı)
 * - 01.05.2008 (Kanun değişikliği)
 * - 27.04.2005 (4/c için)
 */

export interface MalullikSarti {
  derece?: string;
  hizmetYili?: number;
  yasMin?: number;
  gunSayisi: number;
  aciklama?: string;
}

// ============================================================================
// SK 28/4 - İLK İŞE GİRİŞTE MALÜL (Giriş Tarihine Göre)
// ============================================================================

export const SK284_4A = [
  {
    adi: '08.09.1999 öncesi (EYT)',
    koşul: (girisGunu: Date) => girisGunu <= new Date(1999, 8, 8),
    cinsiyet: {
      kadin: { hizmetYili: 15, gun: 3600, yas: 58 },
      erkek: { hizmetYili: 20, gun: 5000, yas: null },
    },
  },
  {
    adi: '09.09.1999-30.04.2008 arası',
    koşul: (girisGunu: Date) =>
      girisGunu > new Date(1999, 8, 8) && girisGunu <= new Date(2008, 3, 30),
    cinsiyet: {
      kadin: { hizmetYili: 15, gun: 3960, yas: null },
      erkek: { hizmetYili: 15, gun: 3960, yas: null },
    },
  },
  {
    adi: '01.05.2008 sonrası',
    koşul: (girisGunu: Date) => girisGunu > new Date(2008, 3, 30),
    cinsiyet: {
      kadin: { hizmetYili: 15, gun: 3960, yas: null },
      erkek: { hizmetYili: 15, gun: 3960, yas: null },
    },
  },
];

export const SK284_4B = [
  {
    adi: '08.09.1999 öncesi (EYT)',
    koşul: (girisGunu: Date) => girisGunu <= new Date(1999, 8, 8),
    cinsiyet: {
      kadin: { hizmetYili: 20, gun: 7200, yas: null },
      erkek: { hizmetYili: 20, gun: 7200, yas: null },
    },
  },
  {
    adi: '09.09.1999-30.04.2008 arası',
    koşul: (girisGunu: Date) =>
      girisGunu > new Date(1999, 8, 8) && girisGunu <= new Date(2008, 3, 30),
    cinsiyet: {
      kadin: { hizmetYili: 15, gun: 5400, yas: 60 },
      erkek: { hizmetYili: 15, gun: 5400, yas: 62 },
    },
  },
  {
    adi: '01.05.2008-31.12.2035',
    koşul: (girisGunu: Date) =>
      girisGunu > new Date(2008, 3, 30) && girisGunu <= new Date(2035, 11, 31),
    cinsiyet: {
      kadin: { hizmetYili: null, gun: 9000, yas: 58 },
      erkek: { hizmetYili: null, gun: 9000, yas: 60 },
    },
  },
  {
    adi: '01.01.2036-31.12.2037',
    koşul: (girisGunu: Date) =>
      girisGunu >= new Date(2036, 0, 1) && girisGunu <= new Date(2037, 11, 31),
    cinsiyet: {
      kadin: { hizmetYili: null, gun: 9000, yas: 59 },
      erkek: { hizmetYili: null, gun: 9000, yas: 61 },
    },
  },
];

export const SK284_4C = [
  {
    adi: '08.09.1999 öncesi (EYT)',
    koşul: (girisGunu: Date) => girisGunu <= new Date(1999, 8, 8),
    cinsiyet: {
      kadin: { hizmetYili: 25, gun: 9000, yas: null },
      erkek: { hizmetYili: 25, gun: 9000, yas: null },
    },
  },
  {
    adi: '09.09.1999-30.04.2008 arası',
    koşul: (girisGunu: Date) =>
      girisGunu > new Date(1999, 8, 8) && girisGunu <= new Date(2008, 3, 30),
    cinsiyet: {
      kadin: { hizmetYili: 25, gun: 9000, yas: 58 },
      erkek: { hizmetYili: 25, gun: 9000, yas: 60 },
    },
  },
  {
    adi: '01.05.2008-31.12.2035',
    koşul: (girisGunu: Date) =>
      girisGunu > new Date(2008, 3, 30) && girisGunu <= new Date(2035, 11, 31),
    cinsiyet: {
      kadin: { hizmetYili: null, gun: 9000, yas: 58 },
      erkek: { hizmetYili: null, gun: 9000, yas: 60 },
    },
  },
  {
    adi: '01.01.2036-31.12.2037',
    koşul: (girisGunu: Date) =>
      girisGunu >= new Date(2036, 0, 1) && girisGunu <= new Date(2037, 11, 31),
    cinsiyet: {
      kadin: { hizmetYili: null, gun: 9000, yas: 59 },
      erkek: { hizmetYili: null, gun: 9000, yas: 61 },
    },
  },
];

export const SK284_2925 = [
  {
    adi: 'Tüm tarihler',
    koşul: (girisGunu: Date) => true,
    cinsiyet: {
      kadin: { hizmetYili: 15, gun: 3600, yas: null },
      erkek: { hizmetYili: 15, gun: 3600, yas: null },
    },
  },
];

// ============================================================================
// SK 28/5 - İŞE GİRDİKTEN SONRA MALÜL (Derece-Bazlı)
// ============================================================================

export const SK285_4A = {
  '%40-%49': { hizmetYili: 20, gun: 5075, yas: null },
  '%50-%59': { hizmetYili: 15, gun: 5300, yas: null },
  '%60+': { hizmetYili: 10, gun: 5450, yas: null },
};

export const SK285_4B = {
  '%40-%49': { hizmetYili: 15, gun: 5400, yas: null },
  '%50-%59': { hizmetYili: 12, gun: 5400, yas: null },
  '%60+': { hizmetYili: 10, gun: 3960, yas: null },
};

export const SK285_4C = {
  '%40-%49': { hizmetYili: 20, gun: 6480, yas: null },
  '%50-%59': { hizmetYili: 15, gun: 5760, yas: null },
  '%60+': { hizmetYili: 10, gun: 5760, yas: null },
};

export const SK285_2925 = {
  '%40-%49': { hizmetYili: 15, gun: 3600, yas: null },
  '%50-%59': { hizmetYili: 12, gun: 3600, yas: null },
  '%60+': { hizmetYili: 10, gun: 3600, yas: null },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getSK284Sarti = (
  statü: string,
  girisGunu: Date,
  cinsiyet: 'erkek' | 'kadin'
) => {
  const tablolar = {
    '4a': SK284_4A,
    '4b': SK284_4B,
    '4c': SK284_4C,
    '2925': SK284_2925,
  };

  const tablo = tablolar[statü as keyof typeof tablolar];
  if (!tablo) return null;

  const uygunKural = tablo.find((r) => r.koşul(girisGunu));
  if (!uygunKural) return null;

  const cinsigetKural = uygunKural.cinsiyet[cinsiyet];
  return {
    hizmetYili: cinsigetKural.hizmetYili,
    gun: cinsigetKural.gun,
    yas: cinsigetKural.yas,
    adi: uygunKural.adi,
  };
};

export const getSK285Sarti = (statü: string, derece: string) => {
  const tablolar = {
    '4a': SK285_4A,
    '4b': SK285_4B,
    '4c': SK285_4C,
    '2925': SK285_2925,
  };

  const tablo = tablolar[statü as keyof typeof tablolar];
  if (!tablo) return null;

  return tablo[derece as keyof typeof tablo] || null;
};

export const getMalulDereceleri = () => {
  return [
    { value: '%40-%49', label: '%40-%49 (Hafif)' },
    { value: '%50-%59', label: '%50-%59 (Orta)' },
    { value: '%60+', label: '%60+ (Ağır)' },
  ];
};
