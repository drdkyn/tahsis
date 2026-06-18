import rulesRaw from './rules.json' assert { type: 'json' };
const rules = rulesRaw as any;

export interface RetirementInput {
  status: '4a' | '4b' | '4c' | '2925';
  dogumTarihi: Date;
  cinsiyet: 'erkek' | 'kadin';
  ilkGirisTarihi: Date;
  priGunu: number;
  borçlanmaOption: 'hariç' | 'dahil';
  borçlanmaGunu: number;
  askerlikGunu: number;
  askerlikNedir: 'once' | 'sonra';
  /** Sadece 4c statüsü için: hangi kanuna göre değerlendirilecek (5434 = eski Emekli Sandığı, 5510 = yeni memur). */
  lawType?: '5434' | '5510';
}

export interface RetirementResult {
  name: string;
  type: 'normal' | 'age' | 'disability';
  uygun: boolean;
  kosullar: {
    ad: string;
    gerekli: string;
    sahip: string;
    basarili: boolean;
  }[];
  notlar?: string;
}

function calculateAge(birthDate: Date, ref: Date): number {
  let age = ref.getFullYear() - birthDate.getFullYear();
  const m = ref.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birthDate.getDate())) age--;
  return age;
}

function calculateServiceYears(start: Date, ref: Date): number {
  let y = ref.getFullYear() - start.getFullYear();
  const m = ref.getMonth() - start.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < start.getDate())) y--;
  return y;
}

export function calculateRetirementOptionsDB(input: RetirementInput): RetirementResult[] {
  const {
    status, dogumTarihi, cinsiyet, ilkGirisTarihi,
    priGunu, borçlanmaOption, borçlanmaGunu,
    askerlikGunu, askerlikNedir, lawType,
  } = input;

  const today = new Date();
  const age = calculateAge(dogumTarihi, today);
  
  // ÖNEMLİ: Askerlik işe girmeden ÖNCE olmuşsa, borçlanma nedeniyle işe giriş tarihini öne çek
  let effectiveStartDate = new Date(ilkGirisTarihi);
  if (askerlikNedir === 'once' && askerlikGunu > 0) {
    effectiveStartDate = new Date(ilkGirisTarihi.getTime() - askerlikGunu * 24 * 60 * 60 * 1000);
  }
  
  const serviceYears = calculateServiceYears(effectiveStartDate, today);
  const totalDays = borçlanmaOption === 'hariç'
    ? priGunu + askerlikGunu + borçlanmaGunu
    : priGunu + askerlikGunu;

  const statusRules = rules[status as keyof typeof rules];
  if (!statusRules) throw new Error(`${status} statüsü bulunamadı`);

  // 2925: 01.10.2008 sonrası girişler için uyarı
  if (status === '2925') {
    const cutoffDate = new Date(2008, 9, 1); // 01.10.2008
    if (ilkGirisTarihi > cutoffDate) {
      return [{
        name: '⚠️ 2925 Statüsü - Giriş Tarihi Geçersiz',
        type: 'normal',
        uygun: false,
        kosullar: [{
          ad: 'Geçerlilik',
          gerekli: '01.10.2008 veya öncesi',
          sahip: ilkGirisTarihi.toLocaleDateString('tr-TR'),
          basarili: false
        }],
        notlar: '2925 statüsü 01.10.2008\'de kapandı. Bu tarihten sonra giriş yapanlar için hesaplama yapılmaz.'
      }];
    }
  }

  // Kişinin giriş tarihi bu kuralın tarih aralığında mı?
  // ÖNEMLİ: rule tarihlerini lokal saatte parse et (UTC değil) - timezone uyumsuzluğunu önler
  function parseLocal(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function isGecerli(rule: any): boolean {
    const from = parseLocal(rule.dateFrom);
    const to = parseLocal(rule.dateTo);
    return effectiveStartDate >= from && effectiveStartDate <= to;
  }

  function buildKosullar(rule: any, extraServiceYears?: number): { kosullar: RetirementResult['kosullar']; uygun: boolean } {
    const kosullar: RetirementResult['kosullar'] = [];
    let uygun = true;

    const gunOk = totalDays >= rule.days;
    kosullar.push({ ad: 'Prim Günü', gerekli: `${rule.days}`, sahip: `${totalDays}`, basarili: gunOk });
    uygun = uygun && gunOk;

    const reqAge = cinsiyet === 'kadin' ? rule.ageWoman : rule.ageMan;
    if (reqAge !== null && reqAge !== undefined) {
      const yasOk = age >= reqAge;
      kosullar.push({ ad: 'Yaş', gerekli: `${reqAge}`, sahip: `${age}`, basarili: yasOk });
      uygun = uygun && yasOk;
    }

    const reqService = extraServiceYears !== undefined ? extraServiceYears : rule.serviceYears;
    
    // Hizmet yılını HER ZAMAN göster
    if (reqService !== null && reqService !== undefined) {
      // Şart varsa: göster ve uygunluğa ekle
      const hizmetOk = serviceYears >= reqService;
      kosullar.push({ ad: 'Hizmet Yılı', gerekli: `${reqService}`, sahip: `${serviceYears}`, basarili: hizmetOk });
      uygun = uygun && hizmetOk;
    } else {
      // Şart yoksa: sadece göster, uygunluğa ekleme
      kosullar.push({ ad: 'Hizmet Yılı', gerekli: '-', sahip: `${serviceYears}`, basarili: true });
    }

    return { kosullar, uygun };
  }

  const results: RetirementResult[] = [];

  // ---- NORMAL ----
  if (statusRules.normal) {
    for (const rule of statusRules.normal) {
      if (!isGecerli(rule)) continue;
      
      // 4a'da 18 yaş altı girişler için her kuralda hizmet yılını 18 yaştan hesapla
      let effectiveServiceYears = undefined;
      if (status === '4a') {
        const ageAt18 = new Date(dogumTarihi);
        ageAt18.setFullYear(ageAt18.getFullYear() + 18);
        
        if (ilkGirisTarihi < ageAt18) {
          // 18 yaşından önce girmişse, 18 yaştan hizmet sayıldı
          effectiveServiceYears = calculateServiceYears(ageAt18, today);
        }
      }
      
      const { kosullar, uygun } = buildKosullar(rule, effectiveServiceYears);
      results.push({ name: rule.name, type: 'normal', uygun, kosullar });
      break; // giriş tarihine uyan ilk kural
    }
  }

  // ---- YAŞTAN (KISMİ) ----
  if (statusRules.age) {
    for (const rule of statusRules.age) {
      if (!isGecerli(rule)) continue;
      
      // 4a'da 18 yaş altı girişler için her kuralda hizmet yılını 18 yaştan hesapla
      let effectiveServiceYears = undefined;
      if (status === '4a') {
        const ageAt18 = new Date(dogumTarihi);
        ageAt18.setFullYear(ageAt18.getFullYear() + 18);
        
        if (ilkGirisTarihi < ageAt18) {
          // 18 yaşından önce girmişse, 18 yaştan hizmet sayıldı
          effectiveServiceYears = calculateServiceYears(ageAt18, today);
        }
      }
      
      const { kosullar, uygun } = buildKosullar(rule, effectiveServiceYears);
      results.push({ name: rule.name, type: 'age', uygun, kosullar });
      break; // giriş tarihine uyan ilk kural
    }
  }

  return results;
}
