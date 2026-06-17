'use client';

import { useState } from 'react';
import FormSection from '@/components/FormSection';
import StatCard from '@/components/StatCard';
import { calculateRetirementOptionsDB } from '@/lib/calculator-db';

interface KosulSatir {
  ad: string;
  gerekli: string;
  sahip: string;
  basarili: boolean;
}

interface HesapSonucu {
  name: string;
  type: string;
  uygun: boolean;

  kosullar: KosulSatir[];
  notlar?: string;
}

interface FormState {
  dogumTarihi: string;
  cinsiyet: 'erkek' | 'kadin';
  ilkIsGirisTarihi: string;
  priGunu: number;
  borçlanmaDahil: boolean;
  askerlikBorclanlmasi: number;
  askerlikNedir: 'once' | 'sonra';
  statular: string[];
  malulBirimi?: string;
  malulDerece?: string;
  bagimaMuhtac?: boolean;
  /** Sadece 4c statüsü için: 5434 (eski Emekli Sandığı) veya 5510 (yeni memur) */
  lawType?: '5434' | '5510';
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Home() {
  const [form, setForm] = useState<FormState>({
    dogumTarihi: '',
    cinsiyet: 'erkek',
    ilkIsGirisTarihi: '',
    priGunu: 0,
    borçlanmaDahil: false,
    askerlikBorclanlmasi: 0,
    askerlikNedir: 'sonra',
    statular: [],
    malulBirimi: 'yok',
    malulDerece: '',
    bagimaMuhtac: false,
    lawType: '5510',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sonuclar, setSonuclar] = useState<HesapSonucu[] | null>(null);
  const [ozet, setOzet] = useState<{ yas: number; hizmetYili: number; toplamGun: number } | null>(null);

  const hesaplananIlkIsGirisTarihi = (() => {
    if (form.askerlikNedir === 'once' && form.askerlikBorclanlmasi > 0 && form.ilkIsGirisTarihi) {
      const d = parseDate(form.ilkIsGirisTarihi);
      d.setDate(d.getDate() - form.askerlikBorclanlmasi);
      return formatDate(d);
    }
    return undefined;
  })();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'priGunu' || name === 'askerlikBorclanlmasi' ? Number(value) : value,
    }));
    // Form değiştiğinde eski sonuçları sil, ki yeniden hesaplanmayan eski sonuçlar görünmesin
    setSonuclar(null);
  };

  const handleCheckbox = (statu: string) => {
    // ÖNEMLİ: Statü değiştirildiğinde malüllük seçimini SIFIRLAMIYORUZ.
    // Önceden burada malulBirimi/malulDerece 'yok'/'' olarak resetleniyordu;
    // bu da kullanıcı bir statüde oran seçip başka bir statüyü denediğinde
    // malüllük hesaplamasının sessizce devre dışı kalmasına ve sonuç
    // ekranında disability kartının hiç görünmemesine sebep oluyordu.
    // ANCAK: Statü değiştiğinde sonuçları temizlemeli, ki eski hesaplama gösterilmesin
    setForm(prev => ({ ...prev, statular: [statu] }));
    setSonuclar(null);
  };

  const handleAskerlikChange = (nedir: 'once' | 'sonra') => {
    setForm(prev => ({ ...prev, askerlikNedir: nedir }));
    setSonuclar(null);
  };

  const handleLawTypeChange = (lawType: '5434' | '5510') => {
    setForm(prev => ({ ...prev, lawType, malulBirimi: 'yok', malulDerece: '' }));
    setSonuclar(null);
  };

  const handleMalulBirimiChange = (birim: string) => {
    setForm(prev => ({ ...prev, malulBirimi: birim, malulDerece: '' }));
    setSonuclar(null);
    // Malülük seçimi değişince derece otomatik reset yapılır, hesapla tetiklensin diye
  };

  const handleMalulDereceChange = (derece: string) => {
    setForm(prev => ({ ...prev, malulDerece: derece }));
    setSonuclar(null);
  };

  const handleBagimaMuhtacChange = (value: boolean) => {
    setForm(prev => ({ ...prev, bagimaMuhtac: value }));
    setSonuclar(null);
  };

  const handleBorclanmaDahilChange = (dahil: boolean) => {
    setForm(prev => ({ ...prev, borçlanmaDahil: dahil }));
    setSonuclar(null);
  };

  const handleTemizle = () => {
    setForm({
      dogumTarihi: '',
      cinsiyet: 'erkek',
      ilkIsGirisTarihi: '',
      priGunu: 0,
      borçlanmaDahil: false,
      askerlikBorclanlmasi: 0,
      askerlikNedir: 'sonra',
      statular: [],
      malulBirimi: 'yok',
      malulDerece: '',
      bagimaMuhtac: false,
      lawType: '5510',
    });
    setSonuclar(null);
    setOzet(null);
    setErrors({});
  };

  const handleHesapla = () => {
    const errs: Record<string, string> = {};
    if (!form.dogumTarihi) errs.dogumTarihi = 'Doğum tarihi zorunludur';
    if (!form.ilkIsGirisTarihi) errs.ilkIsGirisTarihi = 'İlk işe giriş tarihi zorunludur';
    if (form.statular.length === 0) errs.statular = 'Sigortalılık statüsü seçiniz';
    if (form.priGunu <= 0) errs.priGunu = 'Prim günü zorunludur (0 olamaz)';
    if (form.malulBirimi === 'sk28/5' && !form.malulDerece) errs.malulDerece = 'Engelli derece seçiniz';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const dogumTarihi = parseDate(form.dogumTarihi);
    const ilkGirisTarihi = parseDate(form.ilkIsGirisTarihi);
    const status = form.statular[0] as '4a' | '4b' | '4c' | '2925';

    const malulMap: Record<string, 'yok' | 'sk284' | 'sk285' | 'm25' | 'adiMalullük'> = {
      'yok': 'yok',
      'sk28/4': 'sk284',
      'sk28/5': 'sk285',
      'm25': 'm25',
      'adiMalullük': 'adiMalullük',
    };
    const malulukTuru = malulMap[form.malulBirimi || 'yok'] || 'yok';

    // ÖNEMLİ: 4c statüsünde malülük seçilmişse, TARAFINDAN her iki lawType (5434 ve 5510) için
    // SADECE disability kurallarını hesapla (çünkü normal/age kuralları aynı). 
    // Normal ve age kurallarını ise sadece bir kez hesapla.
    let results: HesapSonucu[] = [];
    
    if (status === '4c' && malulukTuru !== 'yok') {
      // 4c/5434 kombinasyonu - tüm kurallar
      const results5434 = calculateRetirementOptionsDB({
        status,
        dogumTarihi,
        cinsiyet: form.cinsiyet,
        ilkGirisTarihi,
        priGunu: form.priGunu,
        borçlanmaOption: form.borçlanmaDahil ? 'dahil' : 'hariç',
        borçlanmaGunu: 0,
        askerlikGunu: form.askerlikBorclanlmasi,
        askerlikNedir: form.askerlikNedir,
        malulukTuru,
        derece: form.malulDerece || null,
        malulTarihi: null,
        bagimaMuhtac: form.bagimaMuhtac,
        lawType: '5434',
      });
      
      // 4c/5510 kombinasyonu - tüm kurallar
      const results5510 = calculateRetirementOptionsDB({
        status,
        dogumTarihi,
        cinsiyet: form.cinsiyet,
        ilkGirisTarihi,
        priGunu: form.priGunu,
        borçlanmaOption: form.borçlanmaDahil ? 'dahil' : 'hariç',
        borçlanmaGunu: 0,
        askerlikGunu: form.askerlikBorclanlmasi,
        askerlikNedir: form.askerlikNedir,
        malulukTuru,
        derece: form.malulDerece || null,
        malulTarihi: null,
        bagimaMuhtac: form.bagimaMuhtac,
        lawType: '5510',
      });
      
      // Sonuçları birleştir: 
      // - Normal ve age kuralları 5434'ten (aynı, duplicate'i engelle)
      // - Disability kuralları her iki kanundan (farklı olabilir)
      const disability5434 = results5434.filter(r => r.type === 'disability');
      const disability5510 = results5510.filter(r => r.type === 'disability');
      const normal = results5434.filter(r => r.type === 'normal');
      const age = results5434.filter(r => r.type === 'age');
      
      results = [...disability5434, ...disability5510, ...normal, ...age];
    } else {
      // 4c değil veya malülük seçilmemişse normal şekilde hesapla
      results = calculateRetirementOptionsDB({
        status,
        dogumTarihi,
        cinsiyet: form.cinsiyet,
        ilkGirisTarihi,
        priGunu: form.priGunu,
        borçlanmaOption: form.borçlanmaDahil ? 'dahil' : 'hariç',
        borçlanmaGunu: 0,
        askerlikGunu: form.askerlikBorclanlmasi,
        askerlikNedir: form.askerlikNedir,
        malulukTuru,
        derece: form.malulDerece || null,
        malulTarihi: null,
        bagimaMuhtac: form.bagimaMuhtac,
        lawType: status === '4c' ? form.lawType : undefined,
      });
    }

    const today = new Date();
    let yas = today.getFullYear() - dogumTarihi.getFullYear();
    if (today.getMonth() < dogumTarihi.getMonth() ||
      (today.getMonth() === dogumTarihi.getMonth() && today.getDate() < dogumTarihi.getDate())) yas--;

    let hizmetYili = today.getFullYear() - ilkGirisTarihi.getFullYear();
    if (today.getMonth() < ilkGirisTarihi.getMonth() ||
      (today.getMonth() === ilkGirisTarihi.getMonth() && today.getDate() < ilkGirisTarihi.getDate())) hizmetYili--;

    const toplamGun = form.borçlanmaDahil
      ? form.priGunu
      : form.priGunu + form.askerlikBorclanlmasi;

    setOzet({ yas, hizmetYili, toplamGun });
    setSonuclar(results);

    setTimeout(() => {
      document.getElementById('sonuclar')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const malulSeçildi = form.malulBirimi && form.malulBirimi !== 'yok';

  // Sonuçları sırala: malüllük seçildiyse disability önce, sonra normal ve yaştan
  // Sıralama: malüllük seçildiyse disability önce, sonra normal, sonra yaşlılık
  // Hepsi gösterilir — uygun olanlar yeşil, uygun olmayanlar sarı
  const siraliSonuclar = sonuclar ? (() => {
    const disability = sonuclar.filter(s => s.type === 'disability');
    const normal = sonuclar.filter(s => s.type === 'normal');
    const age = sonuclar.filter(s => s.type === 'age');
    if (malulSeçildi) {
      return [...disability, ...normal, ...age];
    }
    return [...normal, ...age];
  })() : [];

  const uygunSayisi = siraliSonuclar.filter(s => s.uygun).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">

        <div className="text-center py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">SGK Emeklilik Hesaplama</h1>
          <p className="text-gray-500 text-sm mt-1">Normal, Yaştan ve Malüllük Emeklilik Şartları</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* FORM */}
          <div className="w-full lg:w-80 shrink-0">
            <FormSection
              form={form}
              hesaplananIlkIsGirisTarihi={hesaplananIlkIsGirisTarihi}
              errors={errors}
              onFormChange={handleFormChange}
              onCheckbox={handleCheckbox}
              onAskerlikChange={handleAskerlikChange}
              onMalulBirimiChange={handleMalulBirimiChange}
              onMalulDereceChange={handleMalulDereceChange}
              onBagimaMuhtacChange={handleBagimaMuhtacChange}
              onBorclanmaDahilChange={handleBorclanmaDahilChange}
              onLawTypeChange={handleLawTypeChange}
              onHesapla={handleHesapla}
              onTemizle={handleTemizle}
            />
          </div>

          {/* SONUÇLAR */}
          <div className="flex-1" id="sonuclar">
            {sonuclar === null ? (
              <div className="card flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Bilgileri Girin</h2>
                <p className="text-gray-400 text-sm max-w-sm">
                  Sol taraftaki formu doldurup <strong>Hesapla</strong> butonuna basın.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* ÖZET */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Yaş" value={ozet!.yas} />
                  <StatCard label="Hizmet Yılı" value={ozet!.hizmetYili} />
                  <StatCard label="Toplam Gün" value={ozet!.toplamGun} />
                </div>

                {/* BANNER */}
                {uygunSayisi > 0 ? (
                  <div className="bg-green-100 border-2 border-green-500 rounded-xl p-4 text-center">
                    <p className="text-green-800 font-bold text-lg">
                      ✅ {uygunSayisi} emeklilik şartı sağlanmaktadır
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 text-center">
                    <p className="text-yellow-800 font-bold text-lg">
                      ⚠️ Henüz hiçbir emeklilik şartı sağlanmamaktadır
                    </p>
                  </div>
                )}

                {/* KARTLAR */}
                {siraliSonuclar.map((sonuc, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`card transition-all ${
                        sonuc.type === 'disability'
                          ? 'card-disability'
                          : sonuc.uygun
                          ? 'card-success'
                          : 'card-warning'
                      }`}
                    >
                      {/* Başlık */}
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {sonuc.uygun ? '✅' : '⏳'}
                          </span>
                          <div>
                            <h3 className={`font-semibold text-sm ${
                              sonuc.uygun ? 'text-green-900' : 'text-yellow-900'
                            }`}>
                              {sonuc.name}
                            </h3>

                          </div>
                        </div>
                        {sonuc.uygun && (
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0">
                            UYGUN
                          </span>
                        )}
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ml-1 ${
                          sonuc.type === 'disability' ? 'bg-purple-100 text-purple-700' :
                          sonuc.type === 'age' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {sonuc.type === 'disability' ? 'Malüllük' : sonuc.type === 'age' ? 'Yaştan' : 'Normal'}
                        </span>
                      </div>

                      {/* Koşullar */}
                      <div className="space-y-2">
                        {sonuc.kosullar.map((kosul, ki) => (
                          <div key={ki}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                                <span className={kosul.basarili ? 'text-green-600' : 'text-gray-300'}>
                                  {kosul.basarili ? '✓' : '○'}
                                </span>
                                {kosul.ad}
                              </span>
                              <span className={`font-mono font-bold ${kosul.basarili ? 'text-green-700' : 'text-gray-500'}`}>
                                {kosul.sahip} / {kosul.gerekli || '—'}
                              </span>
                            </div>
                            {kosul.gerekli && !isNaN(Number(kosul.sahip)) && !isNaN(Number(kosul.gerekli)) && (
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${kosul.basarili ? 'bg-green-500' : 'bg-yellow-400'}`}
                                  style={{ width: `${Math.min(Math.round((Number(kosul.sahip) / Number(kosul.gerekli)) * 100), 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {sonuc.notlar && (
                        <p className="text-xs text-gray-500 mt-3 italic border-t border-gray-200 pt-2">
                          💡 {sonuc.notlar}
                        </p>
                      )}
                    </div>
                  );
                })}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
