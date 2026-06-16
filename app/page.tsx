'use client';

import { useState, useMemo } from 'react';
import { hesaplaEmeklilik } from '@/lib/calculator';
import ResultCard from '@/components/ResultCard';
import FormSection from '@/components/FormSection';
import StatCard from '@/components/StatCard';

export default function Home() {
  const [form, setForm] = useState({
    dogumTarihi: '1975-05-15',
    cinsiyet: 'erkek' as 'erkek' | 'kadin',
    ilkIsGirisTarihi: '1995-09-08',
    priGunu: 7200,
    askerlikBorclanlmasi: 0,
    askerlikNedir: 'sonra' as 'once' | 'sonra',
    ilkIsGirisOnceEngelliMi: false,
    statular: ['4a'] as string[],
  });

  const [hesaplananIlkIsGirisTarihi, setHesaplananIlkIsGirisTarihi] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(true);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.dogumTarihi) newErrors.dogumTarihi = 'Doğum tarihi gereklidir';
    if (!form.ilkIsGirisTarihi) newErrors.ilkIsGirisTarihi = 'İlk işe giriş tarihi gereklidir';

    const dogum = new Date(form.dogumTarihi);
    const ilkGiriş = new Date(form.ilkIsGirisTarihi);
    const simdi = new Date();

    if (dogum > simdi) newErrors.dogumTarihi = 'Doğum tarihi gelecekte olamaz';
    if (ilkGiriş > simdi) newErrors.ilkIsGirisTarihi = 'İşe giriş tarihi gelecekte olamaz';
    if (ilkGiriş <= dogum) newErrors.ilkIsGirisTarihi = 'İşe giriş tarihi doğum tarihinden sonra olmalı';

    if (form.priGunu < 0) newErrors.priGunu = 'Prim günü negatif olamaz';
    if (form.priGunu > 20000) newErrors.priGunu = 'Prim günü 20000 günü aşamaz';

    if (form.askerlikBorclanlmasi < 0) newErrors.askerlikBorclanlmasi = 'Askerlik borçlanması negatif olamaz';
    if (form.askerlikBorclanlmasi > 10000) newErrors.askerlikBorclanlmasi = 'Askerlik borçlanması 10000 günü aşamaz';

    if (form.statular.length === 0) newErrors.statular = 'En az bir statü seçilmelidir';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setForm({ ...form, [name]: parseInt(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
    // Clear error for this field
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleCheckbox = (statü: string) => {
    if (form.statular.includes(statü)) {
      setForm({
        ...form,
        statular: form.statular.filter((s) => s !== statü),
      });
    } else {
      setForm({
        ...form,
        statular: [...form.statular, statü],
      });
    }
    if (errors.statular) {
      const newErrors = { ...errors };
      delete newErrors.statular;
      setErrors(newErrors);
    }
  };

  const handleHesapla = () => {
    if (validateForm()) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleAskerlikChange = (nedir: 'once' | 'sonra') => {
    setForm({ ...form, askerlikNedir: nedir });
  };

  const handleEngelliChange = (engelli: boolean) => {
    setForm({ ...form, ilkIsGirisOnceEngelliMi: engelli });
  };

  const sonuc = useMemo(
    () =>
      hesaplaEmeklilik(
        form.dogumTarihi,
        form.ilkIsGirisTarihi,
        form.priGunu,
        form.askerlikBorclanlmasi,
        form.askerlikNedir,
        form.cinsiyet,
        form.statular,
        form.ilkIsGirisOnceEngelliMi
      ),
    [form]
  );

  // Update hesaplanan tarih state
  useMemo(() => {
    setHesaplananIlkIsGirisTarihi(sonuc.hesaplananIlkIsGirisTarihi || '');
  }, [sonuc.hesaplananIlkIsGirisTarihi]);

  const formatTarih = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Emeklilik Hesaplayıcı
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            SGK emeklilik aylığı bağlama koşulları
          </p>
        </div>

        {/* Grid Layout: Form (left) + Results (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Form Column - takes 1 col on mobile, 1 col on desktop */}
          <div className="lg:col-span-1">
            <FormSection
              form={form}
              hesaplananIlkIsGirisTarihi={hesaplananIlkIsGirisTarihi}
              errors={errors}
              onFormChange={handleFormChange}
              onCheckbox={handleCheckbox}
              onAskerlikChange={handleAskerlikChange}
              onEngelliChange={handleEngelliChange}
              onHesapla={handleHesapla}
            />
          </div>

          {/* Results Column - takes 1 col on mobile, 2 col on desktop */}
          {showResults && (
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="Yaş" value={sonuc.yas} />
                <StatCard label="Hizmet Yılı" value={sonuc.hizmetYili} />
                <StatCard label="Toplam Gün" value={sonuc.priGunleri} />
              </div>

              {/* Closest Retirement */}
              {sonuc.yakinEmeklilik && (
                <div className="card card-info">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Tahmini Emeklilik Tarihi</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {formatTarih(sonuc.yakinEmeklilik.tarih)}
                      </p>
                    </div>
                    <span className="badge badge-info">{sonuc.yakinEmeklilik.adi}</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-3">
                    Kalan: <span className="font-semibold">{sonuc.yakinEmeklilik.kalan}</span> gün
                  </p>
                </div>
              )}

              {/* Retirement Conditions */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Emeklilik Şartları</h2>
                {sonuc.emeklilikKosullari.length === 0 ? (
                  <div className="card bg-yellow-50 border-2 border-yellow-300">
                    <p className="text-sm text-yellow-800">Lütfen bir statü seçiniz</p>
                  </div>
                ) : (
                  sonuc.emeklilikKosullari.map((kosul, idx) => (
                    <ResultCard key={idx} kosul={kosul} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="card bg-gray-50 border-2 border-gray-300 text-sm">
          <p className="font-semibold text-gray-900 mb-2">⚠️ Önemli Bilgi</p>
          <p className="text-gray-700 mb-2">
            Bu hesaplayıcı MÜKTEZA_01_02_2023.xlsb dosyasına dayanan bir bilgilendirme aracıdır.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 text-xs">
            <li>506 SK (SSK) - Normal, Yaştan, EYT, Kademeli koşullar</li>
            <li>5510 SK - Ana yaşlılık, 15 yıl + gün koşulları</li>
            <li>2926 SK - Tarım Bağ-Kuru emekliliği</li>
            <li>Maden Yeraltı emekliliği</li>
            <li>Kesin bilgi için SGK&apos;ya başvurunuz</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
