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
    malulBirimi?: string;
    malulDerece?: string;
    bagimaMuhtac?: boolean;
  };
  hesaplananIlkIsGirisTarihi?: string;
  errors: Record<string, string>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCheckbox: (statu: string) => void;
  onAskerlikChange: (nedir: 'once' | 'sonra') => void;
  onMalulBirimiChange: (birim: string) => void;
  onMalulDereceChange?: (derece: string) => void;
  onBagimaMuhtacChange?: (value: boolean) => void;
  onBorclanmaDahilChange: (dahil: boolean) => void;
  onHesapla: () => void;
  onTemizle: () => void;
}

export default function FormSection({
  form, hesaplananIlkIsGirisTarihi, errors,
  onFormChange, onCheckbox, onAskerlikChange,
  onMalulBirimiChange, onMalulDereceChange,
  onBagimaMuhtacChange, onBorclanmaDahilChange, onHesapla, onTemizle,
}: FormSectionProps) {
  const statu = form.statular[0];

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

      {/* MALÜLÜK */}
      {statu && (
        <div className="section-box bg-purple-50 border-purple-200 mb-3">
          <p className="text-xs font-semibold text-purple-800 mb-2">
            Malüllük / Engellilik <span className="text-gray-400 font-normal">(5510 SK Md.28)</span>
          </p>

          {['4a', '4b', '4c'].includes(statu) ? (
            <>
              <select value={form.malulBirimi || 'yok'}
                onChange={(e) => onMalulBirimiChange(e.target.value)}
                className="input-field mb-2">
                <option value="yok">— Malül değilim —</option>
                <option value="sk28/4">
                  {statu === '4c' ? '27.04.2005 öncesi Engelli (yaşsız)' : 'Md.28/4 — İlk işe girişte malül (yaşsız)'}
                </option>
                <option value="sk28/5">
                  {statu === '4c' ? '27.04.2005 sonrası Engelli (dereceli)' : 'Md.28/5 — Sonradan malül (dereceli)'}
                </option>
              </select>

              {form.malulBirimi === 'sk28/5' && (
                <div className="mt-2 space-y-2">
                  <select value={form.malulDerece || ''} onChange={(e) => onMalulDereceChange?.(e.target.value)}
                    className="input-field">
                    <option value="">— Engel derecesi seçin —</option>
                    <option value="%40-%49">%40–%49 (Hafif)</option>
                    <option value="%50-%59">%50–%59 (Orta)</option>
                    <option value="%60+">%60+ (Ağır)</option>
                  </select>
                  {errors.malulDerece && <p className="text-xs text-red-600">{errors.malulDerece}</p>}

                  {form.malulDerece === '%60+' && (
                    <label className="flex items-start gap-2 cursor-pointer p-2 bg-red-50 border border-red-200 rounded-lg">
                      <input type="checkbox" checked={form.bagimaMuhtac || false}
                        onChange={(e) => onBagimaMuhtacChange?.(e.target.checked)}
                        className="w-3.5 h-3.5 mt-0.5 text-red-600 shrink-0" />
                      <span className="text-xs text-gray-700">
                        <strong>Bakıma muhtaç</strong>
                        <span className="block text-gray-500 mt-0.5">
                          Başkasının yardımına muhtaç olduğunuz sağlık kurulu raporu ile belirlenmişse — 10 yıl hizmet şartı aranmaz
                        </span>
                      </span>
                    </label>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-500">2925 statüsünde malüllük koşulu uygulanmaz.</p>
          )}
        </div>
      )}

      {/* KİŞİSEL BİLGİLER */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="label">Doğum Tarihi <span className="text-red-500">*</span></label>
          <input type="date" name="dogumTarihi" value={form.dogumTarihi}
            onChange={onFormChange}
            className={`input-field ${errors.dogumTarihi ? 'border-red-500' : ''}`} />
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
        <input type="date" name="ilkIsGirisTarihi" value={form.ilkIsGirisTarihi}
          onChange={onFormChange}
          className={`input-field ${errors.ilkIsGirisTarihi ? 'border-red-500' : ''}`} />
        {errors.ilkIsGirisTarihi && <p className="text-xs text-red-600 mt-0.5">{errors.ilkIsGirisTarihi}</p>}
        {hesaplananIlkIsGirisTarihi && (
          <p className="text-xs text-green-700 mt-1 bg-green-50 px-2 py-1 rounded">
            ↩ Borçlanma nedeniyle öne çekilen giriş: <strong>{hesaplananIlkIsGirisTarihi}</strong>
          </p>
        )}
      </div>

      {/* PRİM GÜNÜ + BORÇLANMA */}
      <div className="mb-3">
        <label className="label">Prim Günü</label>
        <input type="number" name="priGunu" value={form.priGunu || ''} onChange={onFormChange}
          min="0" max="20000" placeholder="0" className="input-field" />
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
            { val: 'once' as const, label: 'Girişten ÖNCE', desc: '(borçlanma nedeniyle öne çekilir)' },
            { val: 'sonra' as const, label: 'Girişten SONRA', desc: '(sadece gün eklenir)' },
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button onClick={onHesapla}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md text-sm">
          Hesapla →
        </button>
        <button onClick={onTemizle}
          className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md text-sm">
          Temizle ✕
        </button>
      </div>
    </div>
  );
}
