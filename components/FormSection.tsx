'use client';

interface FormSectionProps {
  form: {
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
  };
  hesaplananIlkIsGirisTarihi?: string;
  errors: Record<string, string>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCheckbox: (statu: string) => void;
  onAskerlikChange: (nedir: 'once' | 'sonra') => void;
  onBorclanmaDahilChange: (dahil: boolean) => void;
  onLawTypeChange?: (lawType: '5434' | '5510') => void;
  onDisabilityTypeChange?: (type: 'before_60' | 'after_60' | 'disability_50_59' | 'disability_40_49' | undefined) => void;
  onHesapla: () => void;
  onTemizle: () => void;
}

export default function FormSection({
  form, hesaplananIlkIsGirisTarihi, errors,
  onFormChange, onCheckbox, onAskerlikChange,
  onBorclanmaDahilChange, onLawTypeChange, onDisabilityTypeChange, onHesapla, onTemizle,
}: FormSectionProps) {
  const statu = form.statular[0];
  const lawType = form.lawType || '5510';
  const disabilityType = form.disabilityType;

  return (
    <div className="card overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>

      {/* STATÜ */}
      <div className="section-box bg-blue-50 border-blue-200 mb-3">
        <p className="text-xs font-semibold text-blue-800 mb-2">
          Sigortalılık Statüsü <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-1">
          {[
            { value: '4a', label: '4/a (SSK)' },
            { value: '4b', label: '4/b (Bağ-Kur)' },
            { value: '4c', label: '4/c (Memur)' },
            { value: '2925', label: '2925 (Tarım)' },
          ].map((s) => (
            <label key={s.value} className={`flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded-lg border text-xs transition-all ${
              statu === s.value
                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}>
              <input type="radio" name="statular" value={s.value}
                checked={statu === s.value} onChange={() => onCheckbox(s.value)}
                className="sr-only" />
              {s.label}
            </label>
          ))}
        </div>
        {errors.statular && <p className="text-xs text-red-600 mt-1">{errors.statular}</p>}
      </div>

      {/* 4/a MALÜLLÜK DROPDOWN - STATÜ SEÇİMİNİN HEMEN ALTINDA */}
      {statu === '4a' && (
        <div className="section-box bg-purple-50 border-purple-200 mb-3">
          <label className="label">Malüllük/Engellilik Türü</label>
          <select 
            value={disabilityType || ''}
            onChange={(e) => onDisabilityTypeChange?.(e.target.value as any || undefined)}
            className="input-field"
          >
            <option value="">— Seçilmedi —</option>
            <option value="before_60">%60 ve Üzeri (İşe Başlamadan Önce)</option>
            <option value="after_60">%60 ve Üzeri (İşe Başladıktan Sonra)</option>
            <option value="disability_50_59">%50-%59 Arası</option>
            <option value="disability_40_49">%40-%49 Arası</option>
          </select>
          <p className="text-xs text-gray-500 mt-1.5">
            Malüllük derecesine göre seçiniz. Boş bırakırsanız sadece normal emeklilik kuralları hesaplanır.
          </p>
        </div>
      )}

      {/* KİŞİSEL BİLGİLER */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="label">Doğum Tarihi <span className="text-red-500">*</span></label>
          <div className="relative">
            <input 
              type="text" 
              name="dogumTarihi" 
              value={form.dogumTarihi}
              onChange={(e) => {
                let val = e.target.value;
                
                // Eğer tamamen boşsa, boş bırak
                if (val === '') {
                  onFormChange({ target: { name: 'dogumTarihi', value: '' } } as any);
                  return;
                }
                
                // Sadece rakamları al
                let numOnly = val.replace(/\D/g, '');
                
                // Format yap: GG.AA.YYYY
                let formatted = '';
                if (numOnly.length > 0) {
                  formatted = numOnly.slice(0, 2);
                  if (numOnly.length > 2) formatted += '.' + numOnly.slice(2, 4);
                  if (numOnly.length > 4) formatted += '.' + numOnly.slice(4, 8);
                }
                
                onFormChange({ target: { name: 'dogumTarihi', value: formatted } } as any);
              }}
              onKeyDown={(e) => {
                // Backspace'te input boşsa, sadece karakter sil
                if (e.key === 'Backspace') {
                  const input = e.currentTarget;
                  const curPos = input.selectionStart || 0;
                  
                  // Eğer nokta öncesi konumdaysak, noktayı da sil
                  if (input.value[curPos - 1] === '.') {
                    e.preventDefault();
                    const newVal = input.value.slice(0, curPos - 2) + input.value.slice(curPos);
                    onFormChange({ target: { name: 'dogumTarihi', value: newVal } } as any);
                    // Cursor'ı doğru pozisyona taşı
                    setTimeout(() => {
                      input.selectionStart = curPos - 2;
                      input.selectionEnd = curPos - 2;
                    }, 0);
                  }
                }
              }}
              placeholder="GG.AA.YYYY"
              inputMode="numeric"
              pattern="\d{2}\.\d{2}\.\d{4}"
              className={`input-field pr-9 ${errors.dogumTarihi ? 'border-red-500' : ''}`} 
            />
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector('input[name="dogumTarihi"]') as HTMLInputElement;
                if (input) {
                  input.focus();
                  // Input açılırsa, seçili hale getir (takvim için)
                  input.select();
                }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="Takvim aç"
            >
              📅
            </button>
          </div>
          {errors.dogumTarihi && <p className="text-xs text-red-600 mt-0.5">{errors.dogumTarihi}</p>}
        </div>
        <div>
          <label className="label">Cinsiyet</label>
          <select name="cinsiyet" value={form.cinsiyet} onChange={onFormChange} className="input-field">
            <option value="erkek">Erkek</option>
            <option value="kadin">Kadın</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="label">İlk İşe Giriş Tarihi <span className="text-red-500">*</span></label>
        <div className="relative">
          <input 
            type="text" 
            name="ilkIsGirisTarihi" 
            value={form.ilkIsGirisTarihi}
            onChange={(e) => {
              let val = e.target.value;
              
              // Eğer tamamen boşsa, boş bırak
              if (val === '') {
                onFormChange({ target: { name: 'ilkIsGirisTarihi', value: '' } } as any);
                return;
              }
              
              // Sadece rakamları al
              let numOnly = val.replace(/\D/g, '');
              
              // Format yap: GG.AA.YYYY
              let formatted = '';
              if (numOnly.length > 0) {
                formatted = numOnly.slice(0, 2);
                if (numOnly.length > 2) formatted += '.' + numOnly.slice(2, 4);
                if (numOnly.length > 4) formatted += '.' + numOnly.slice(4, 8);
              }
              
              onFormChange({ target: { name: 'ilkIsGirisTarihi', value: formatted } } as any);
            }}
            onKeyDown={(e) => {
              // Backspace'te input boşsa, sadece karakter sil
              if (e.key === 'Backspace') {
                const input = e.currentTarget;
                const curPos = input.selectionStart || 0;
                
                // Eğer nokta öncesi konumdaysak, noktayı da sil
                if (input.value[curPos - 1] === '.') {
                  e.preventDefault();
                  const newVal = input.value.slice(0, curPos - 2) + input.value.slice(curPos);
                  onFormChange({ target: { name: 'ilkIsGirisTarihi', value: newVal } } as any);
                  // Cursor'ı doğru pozisyona taşı
                  setTimeout(() => {
                    input.selectionStart = curPos - 2;
                    input.selectionEnd = curPos - 2;
                  }, 0);
                }
              }
            }}
            placeholder="GG.AA.YYYY"
            inputMode="numeric"
            pattern="\d{2}\.\d{2}\.\d{4}"
            className={`input-field pr-9 ${errors.ilkIsGirisTarihi ? 'border-red-500' : ''}`} 
          />
          <button
            type="button"
            onClick={() => {
              const input = document.querySelector('input[name="ilkIsGirisTarihi"]') as HTMLInputElement;
              if (input) {
                input.focus();
                // Input açılırsa, seçili hale getir (takvim için)
                input.select();
              }
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Takvim aç"
          >
            📅
          </button>
        </div>
        {errors.ilkIsGirisTarihi && <p className="text-xs text-red-600 mt-0.5">{errors.ilkIsGirisTarihi}</p>}
        {hesaplananIlkIsGirisTarihi && (
          <p className="text-xs text-green-700 mt-1 bg-green-50 px-2 py-1 rounded">
            ↩ Borçlanma nedeniyle öne çekilen giriş: <strong>{hesaplananIlkIsGirisTarihi}</strong>
          </p>
        )}
        
        {/* DİNAMİK BİLGİ NOTU - İlk işe giriş tarihine göre */}
        {form.ilkIsGirisTarihi && (() => {
          // Tarih formatını kontrol et
          if (!/^\d{2}\.\d{2}\.\d{4}$/.test(form.ilkIsGirisTarihi)) return null;
          
          // Tarihi parse et
          const [gün, ay, yıl] = form.ilkIsGirisTarihi.split('.').map(Number);
          const tarih = new Date(yıl, ay - 1, gün);
          const karşılaştırmaTarihi = new Date(2008, 9, 1); // 01.10.2008
          
          const önce = tarih < karşılaştırmaTarihi;
          
          return (
            <div className={`mt-2.5 p-2.5 rounded border ${
              önce 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-xs ${önce ? 'text-amber-800' : 'text-blue-800'}`}>
                <span className="mr-1.5">ℹ️</span>
                {önce ? (
                  <>
                    <strong>3,5 Yıl Kuralı:</strong> Son 7 yılda hangi statüdeki hizmetiniz 1261 günden fazla ise, o kapsamda hesaplayınız. 
                    İşe girdikten sonra oluşan malüliyette (%60+) bu husus dikkate alınmaz.
                  </>
                ) : (
                  <>
                    <strong>Kapsam Kuralı:</strong> En fazla hangi kapsamda hizmetiniz (SSK, Bağ-Kur, Emekli Sandığı 4/c) varsa 
                    o kapsamda hesaplama yapınız. İşe girdikten sonra oluşan malüliyette (%60+) bu husus dikkate alınmaz.
                  </>
                )}
              </p>
            </div>
          );
        })()}
      </div>

      {/* PRİM GÜNÜ + BORÇLANMA */}
      <div className="mb-3">
        <label className="label">Prim Günü <span className="text-red-500">*</span></label>
        <input type="number" name="priGunu" value={form.priGunu || ''} onChange={onFormChange}
          min="0" max="20000" placeholder="0" className={`input-field ${errors.priGunu ? 'border-red-500' : ''}`} />
        {errors.priGunu && <p className="text-xs text-red-600 mt-0.5">{errors.priGunu}</p>}
        <div className="flex gap-3 mt-1.5">
          {[{ val: false, label: 'Borçlanma hariç' }, { val: true, label: 'Borçlanma dahil' }].map(opt => (
            <label key={String(opt.val)} className="flex items-center gap-1 cursor-pointer text-xs text-gray-600">
              <input type="radio" name="borclanmaDahil" checked={form.borçlanmaDahil === opt.val}
                onChange={() => onBorclanmaDahilChange(opt.val)}
                className="w-3 h-3 text-blue-600" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* ASKERLİK */}
      <div className="section-box bg-blue-50 border-blue-200 mb-3">
        <p className="text-xs font-semibold text-blue-800 mb-2">Askerlik Borçlanması (Gün)</p>
        <input type="number" name="askerlikBorclanlmasi" value={form.askerlikBorclanlmasi || ''}
          onChange={onFormChange} min="0" placeholder="0" className="input-field mb-2" />
        <div className="flex gap-4">
          {[
            { val: 'once' as const, label: 'İlk İşe Girişten ÖNCE', desc: '(borçlanma nedeniyle öne çekilir)' },
            { val: 'sonra' as const, label: 'İlk İşe Girişten SONRA', desc: '(sadece gün eklenir)' },
          ].map(opt => (
            <label key={opt.val} className="flex items-start gap-1.5 cursor-pointer text-xs text-gray-700">
              <input type="radio" name="askerlikNedir" value={opt.val}
                checked={form.askerlikNedir === opt.val}
                onChange={() => onAskerlikChange(opt.val)}
                className="w-3 h-3 mt-0.5 text-blue-600 shrink-0" />
              <span><strong>{opt.label}</strong><span className="block text-gray-400">{opt.desc}</span></span>
            </label>
          ))}
        </div>
      </div>

      {/* HESAPLA + TEMİZLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
        <button onClick={onHesapla}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md text-sm">
          Hesapla →
        </button>
        <button onClick={onTemizle}
          className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-1.5 rounded-lg transition-all shadow-sm text-xs">
          Temizle ✕
        </button>
      </div>
    </div>
  );
}
