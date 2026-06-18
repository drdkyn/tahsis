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
  lawType?: '5434' | '5510';
  disabilityType?: 'before_60' | 'after_60' | 'disability_50_59' | 'disability_40_49';
}

function parseDate(str: string): Date {
  if (str.includes('.')) {
    const [d, m, y] = str.split('.').map(Number);
    return new Date(y, m - 1, d);
  } else {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
}

function dateToYMD(date: Date): { year: number; month: number; day: number } {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function compareDates(date1: Date, date2: Date): number {
  const d1 = dateToYMD(date1);
  const d2 = dateToYMD(date2);
  
  if (d1.year !== d2.year) return d1.year - d2.year;
  if (d1.month !== d2.month) return d1.month - d2.month;
  return d1.day - d2.day;
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
    lawType: '5510',
    disabilityType: undefined,
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
    setSonuclar(null);
  };

  const handleCheckbox = (statu: string) => {
    setForm(prev => ({ 
      ...prev, 
      statular: [statu],
      lawType: '5510',
      disabilityType: undefined,
    }));
    setSonuclar(null);
  };

  const handleAskerlikChange = (nedir: 'once' | 'sonra') => {
    setForm(prev => ({ ...prev, askerlikNedir: nedir }));
    setSonuclar(null);
  };

  const handleLawTypeChange = (lawType: '5434' | '5510') => {
    setForm(prev => ({ ...prev, lawType }));
    setSonuclar(null);
  };

  const handleDisabilityTypeChange = (disabilityType: 'before_60' | 'after_60' | 'disability_50_59' | 'disability_40_49' | undefined) => {
    setForm(prev => ({ ...prev, disabilityType }));
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
      lawType: '5510',
      disabilityType: undefined,
    });
    setSonuclar(null);
    setOzet(null);
    setErrors({});
  };

  const handleHesapla = () => {
    const errs: Record<string, string> = {};
    
    const dateFormatRegex = /^(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})$/;
    
    if (!form.dogumTarihi) errs.dogumTarihi = 'Doğum tarihi zorunludur';
    else if (!dateFormatRegex.test(form.dogumTarihi)) errs.dogumTarihi = 'Format: GG.AA.YYYY (örn: 25.01.1990)';
    
    if (!form.ilkIsGirisTarihi) errs.ilkIsGirisTarihi = 'İlk işe giriş tarihi zorunludur';
    else if (!dateFormatRegex.test(form.ilkIsGirisTarihi)) errs.ilkIsGirisTarihi = 'Format: GG.AA.YYYY (örn: 01.01.2004)';
    if (form.statular.length === 0) errs.statular = 'Sigortalılık statüsü seçiniz';
    if (form.priGunu <= 0) errs.priGunu = 'Prim günü zorunludur (0 olamaz)';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const dogumTarihi = parseDate(form.dogumTarihi);
    const ilkGirisTarihi = parseDate(form.ilkIsGirisTarihi);
    const status = form.statular[0] as '4a' | '4b' | '4c' | '2925';

    let results: HesapSonucu[] = [];
    
    const selectedLawType = status === '4c' ? form.lawType : undefined;
    const selectedDisabilityType = status === '4a' ? form.disabilityType : undefined;
    
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
      lawType: selectedLawType,
      disabilityType: selectedDisabilityType,
    });

    const today = new Date();
    let yas = today.getFullYear() - dogumTarihi.getFullYear();
    if (today.getMonth() < dogumTarihi.getMonth() ||
      (today.getMonth() === dogumTarihi.getMonth() && today.getDate() < dogumTarihi.getDate())) yas--;

    let hizmetYili = today.getFullYear() - ilkGirisTarihi.getFullYear();
    if (today.getMonth() < ilkGirisTarihi.getMonth() ||
      (today.getMonth() === ilkGirisTarihi.getMonth() && today.getDate() < ilkGirisTarihi.getDate())) hizmetYili--;
    
    const toplamGun = form.borçlanmaDahil ? form.priGunu + form.askerlikBorclanlmasi : form.priGunu + form.askerlikBorclanlmasi;

    setOzet({ yas, hizmetYili, toplamGun });
    setSonuclar(results);

    setTimeout(() => {
      document.getElementById('sonuclar')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const siraliSonuclar = sonuclar ? (() => {
    const normal = sonuclar.filter(s => s.type === 'normal');
    const age = sonuclar.filter(s => s.type === 'age');
    const disability = sonuclar.filter(s => s.type === 'disability');
    return [...normal, ...age, ...disability];
  })() : [];

  const uygunSayisi = siraliSonuclar.filter(s => s.uygun).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">

        <div className="text-center py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">SGK Emeklilik Hesaplama</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          <div className="w-full lg:w-80 shrink-0">
            <FormSection
              form={form}
              hesaplananIlkIsGirisTarihi={hesaplananIlkIsGirisTarihi}
              errors={errors}
              onFormChange={handleFormChange}
              onCheckbox={handleCheckbox}
              onAskerlikChange={handleAskerlikChange}
              onBorclanmaDahilChange={handleBorclanmaDahilChange}
              onLawTypeChange={handleLawTypeChange}
              onDisabilityTypeChange={handleDisabilityTypeChange}
              onHesapla={handleHesapla}
              onTemizle={handleTemizle}
            />
          </div>

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

                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Yaş" value={ozet!.yas} />
                  <StatCard label="Hizmet Yılı" value={ozet!.hizmetYili} />
                  <StatCard label="Toplam Gün" value={ozet!.toplamGun} />
                </div>

                {form.statular[0] === '4a' && (() => {
                  const dogumTarihi = parseDate(form.dogumTarihi);
                  const ilkGirisTarihi = parseDate(form.ilkIsGirisTarihi);
                  const ageAt18 = new Date(dogumTarihi);
                  ageAt18.setFullYear(ageAt18.getFullYear() + 18);
                  return compareDates(ilkGirisTarihi, ageAt18) < 0;
                })() && (
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <span className="text-lg mr-2">💡</span>
                      <strong>Not:</strong> 18 yaşından önce işe girmişsiniz. 
                      Hizmet süresi <strong>18 yaş tarihinden</strong> itibaren sayılmaktadır.
                    </p>
                  </div>
                )}

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
                          {sonuc.type === 'disability' ? 'Malüllük/Engellilik' : sonuc.type === 'age' ? 'Yaştan' : 'Normal'}
                        </span>
                      </div>

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

                      {(() => {
                        const hasServiceYears = sonuc.kosullar.some(k => k.ad === 'Hizmet Yılı');
                        if (!hasServiceYears || form.statular[0] !== '4a') return null;
                        
                        const dogumTarihi = parseDate(form.dogumTarihi);
                        const ilkGirisTarihi = parseDate(form.ilkIsGirisTarihi);
                        const ageAt18 = new Date(dogumTarihi);
                        ageAt18.setFullYear(ageAt18.getFullYear() + 18);
                        
                        if (compareDates(ilkGirisTarihi, ageAt18) >= 0) return null;
                        
                        return (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2.5 mt-3 text-xs text-blue-700">
                            <span className="mr-1.5">💡</span>
                            18 yaştan önce işe girişiniz için hizmet süresi 
                            <strong> 18 yaş tarihinden </strong>
                            itibaren sayılmaktadır.
                          </div>
                        );
                      })()}

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
