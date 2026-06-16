'use client';

interface FormSectionProps {
  form: {
    dogumTarihi: string;
    cinsiyet: 'erkek' | 'kadin';
    ilkIsGirisTarihi: string;
    priGunu: number;
    askerlikBorclanlmasi: number;
    askerlikNedir: 'once' | 'sonra';
    statular: string[];
    malulBirimi?: string;
    malulDerece?: string;
    bagimaMuhtac?: boolean; // Bakıma muhtaçlık
  };
  hesaplananIlkIsGirisTarihi?: string;
  errors: Record<string, string>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCheckbox: (statü: string) => void;
  onAskerlikChange: (nedir: 'once' | 'sonra') => void;
  onMalulBirimiChange: (birim: string) => void;
  onMalulDereceChange?: (derece: string) => void;
  onBagimaMuhtacChange?: (value: boolean) => void; // Yeni handler
  onHesapla: () => void;
}

export default function FormSection({
  form,
  hesaplananIlkIsGirisTarihi,
  errors,
  onFormChange,
  onCheckbox,
  onAskerlikChange,
  onMalulBirimiChange,
  onMalulDereceChange,
  onBagimaMuhtacChange,
  onHesapla,
}: FormSectionProps) {
  return (
    <div className="card sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Sigortalı Bilgileri</h2>

      {/* ========== STATÜ SEÇİMİ (EN ÜST) ========== */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-300">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Sigortalılık Statüsü <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            { value: '4a', label: '4/a (SSK)' },
            { value: '4b', label: '4/b (Bağ-Kur)' },
            { value: '4c', label: '4/c (Memur)' },
            { value: '2925', label: '2925 (Tarım Sigortası)' },
          ].map((stat) => (
            <label key={stat.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="statular"
                value={stat.value}
                checked={form.statular.length > 0 && form.statular[0] === stat.value}
                onChange={() => {
                  onCheckbox(stat.value);
                }}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">{stat.label}</span>
            </label>
          ))}
        </div>
        {errors.statular && (
          <p className="text-xs text-red-600 mt-2">{errors.statular}</p>
        )}
        {form.statular.length === 0 && !errors.statular && (
          <p className="text-xs text-orange-600 mt-2">Lütfen sigortalılık statüsünü seçiniz</p>
        )}
      </div>

      {/* ========== MALÜLÜK/ENGELLİLİK (STATÜ SEÇILİ İSE) ========== */}
      {form.statular.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-300">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Malüllük/Engellilik Durumu
            <span className="text-gray-500 text-xs ml-1">(5510 SK 28. Md.)</span>
          </label>

          {/* 4/a, 4/b, 4/c için malüllük seçeneği */}
          {['4a', '4b', '4c'].includes(form.statular[0]) && (
            <>
              <select
                value={form.malulBirimi || 'yok'}
                onChange={(e) => onMalulBirimiChange(e.target.value)}
                className="input-field w-full mb-3"
              >
                <option value="yok">Malül değilim</option>
                <option value="sk28/4">
                  {form.statular[0] === '4c' 
                    ? '27.04.2005 öncesi Engelli (Yaşsız)'
                    : '28/4 - İlk işe girişte malül (Yaşsız)'}
                </option>
                <option value="sk28/5">
                  {form.statular[0] === '4c'
                    ? '27.04.2005 sonrası Engelli (Dereceli)'
                    : '28/5 - İşe girdikten sonra malül (Dereceli)'}
                </option>
              </select>

              {/* DERECE SEÇİMİ - SK28/5 seçiliyse göster */}
              {form.malulBirimi === 'sk28/5' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Engelli Derece
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-gray-500 text-xs ml-1">(Çalışma gücü kayıp oranı)</span>
                  </label>
                  <select
                    value={form.malulDerece || ''}
                    onChange={(e) => onMalulDereceChange?.(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">-- Derece seçiniz --</option>
                    {form.statular[0] === '4a' && (
                      <>
                        <option value="%40-%49">%40 - %49 (Hafif)</option>
                        <option value="%50-%59">%50 - %59 (Orta)</option>
                        <option value="%60+">%60 ve üzeri (Ağır)</option>
                      </>
                    )}
                    {form.statular[0] === '4b' && (
                      <>
                        <option value="%40-%49">%40 - %49 (Hafif)</option>
                        <option value="%50-%59">%50 - %59 (Orta)</option>
                        <option value="%60+">%60 ve üzeri (Ağır)</option>
                      </>
                    )}
                    {form.statular[0] === '4c' && (
                      <>
                        <option value="%40-%49">%40 - %49 (Hafif)</option>
                        <option value="%50-%59">%50 - %59 (Orta)</option>
                        <option value="%60+">%60 ve üzeri (Ağır)</option>
                      </>
                    )}
                  </select>

                  {/* BAKIMA MUHTAÇLIK CHECKBOX - SK28/5 seçiliyse göster */}
                  {form.malulBirimi === 'sk28/5' && form.malulDerece && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.bagimaMuhtac || false}
                          onChange={(e) => onBagimaMuhtacChange?.(e.target.checked)}
                          className="w-4 h-4 text-red-600 rounded border-red-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          <strong>Bakıma muhtaç mıyım?</strong>
                          <span className="text-xs text-gray-500 block mt-1">
                            (Başkasının bakımına muhtaç olduğunuzda işaretleyin)
                          </span>
                        </span>
                      </label>
                      {form.bagimaMuhtac && (
                        <p className="text-xs text-red-700 mt-2 italic">
                          ⚠️ Bakıma muhtaçlık durumunda sigortalılık süresi şartı azalır.
                          Tüm şartları doktor raporu ve SGK ile kontrol edin.
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-yellow-700 mt-2">
                    💡 Dereceniz Bölge Sağlık Kurulu raporunuzda belirtilmelidir.
                  </p>
                </div>
              )}
            </>
          )}

          {/* 2925 için */}
          {form.statular[0] === '2925' && (
            <p className="text-sm text-gray-700">
              2925 Tarım Sigortası statüsü malüllük koşulu bulunmamaktadır.
            </p>
          )}

          {form.malulBirimi && form.malulBirimi !== 'yok' && (
            <p className="text-xs text-green-700 mt-2 italic">
              💡 Malüllük durumuna göre şartlar otomatik güncellenecektir.
            </p>
          )}
        </div>
      )}

      {/* Birth Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Doğum Tarihi <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="dogumTarihi"
          value={form.dogumTarihi}
          onChange={onFormChange}
          className={`input-field ${errors.dogumTarihi ? 'border-red-500' : ''}`}
        />
        {!form.dogumTarihi && !errors.dogumTarihi && (
          <p className="text-xs text-orange-600 mt-1">Lütfen tarihi seçiniz</p>
        )}
        {errors.dogumTarihi && (
          <p className="text-xs text-red-600 mt-1">{errors.dogumTarihi}</p>
        )}
      </div>

      {/* Gender */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cinsiyet <span className="text-red-500">*</span>
        </label>
        <select
          name="cinsiyet"
          value={form.cinsiyet}
          onChange={onFormChange}
          className={`input-field ${errors.cinsiyet ? 'border-red-500' : ''}`}
        >
          <option value="erkek">Erkek</option>
          <option value="kadin">Kadın</option>
        </select>
        {errors.cinsiyet && <p className="text-xs text-red-600 mt-1">{errors.cinsiyet}</p>}
      </div>

      {/* First Employment Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          İlk İşe Giriş Tarihi <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="ilkIsGirisTarihi"
          value={form.ilkIsGirisTarihi}
          onChange={onFormChange}
          className={`input-field ${errors.ilkIsGirisTarihi ? 'border-red-500' : ''}`}
        />
        {!form.ilkIsGirisTarihi && !errors.ilkIsGirisTarihi && (
          <p className="text-xs text-orange-600 mt-1">Lütfen tarihi seçiniz</p>
        )}
        {errors.ilkIsGirisTarihi && (
          <p className="text-xs text-red-600 mt-1">{errors.ilkIsGirisTarihi}</p>
        )}
      </div>

      {/* Premium Days */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prim Günü
          <span className="text-gray-500 text-xs ml-1">(dönemsel)</span>
        </label>
        <input
          type="number"
          name="priGunu"
          value={form.priGunu || ''}
          onChange={onFormChange}
          min="0"
          max="20000"
          placeholder="0"
          className={`input-field ${errors.priGunu ? 'border-red-500' : ''}`}
        />
        {errors.priGunu && <p className="text-xs text-red-600 mt-1">{errors.priGunu}</p>}
      </div>

      {/* Askerlik Borçlanması */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Askerlik Borçlanması <span className="text-gray-500 text-xs ml-1">(Gün)</span>
        </label>

        {/* Input */}
        <input
          type="number"
          name="askerlikBorclanlmasi"
          value={form.askerlikBorclanlmasi || ''}
          onChange={onFormChange}
          min="0"
          placeholder="0"
          className={`input-field mb-3 ${errors.askerlikBorclanlmasi ? 'border-red-500' : ''}`}
        />

        {/* Radio Buttons */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="askerlikNedir"
              value="once"
              checked={form.askerlikNedir === 'once'}
              onChange={() => onAskerlikChange('once')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">
              İlk işe girişten <strong>ÖNCE</strong>
              <span className="text-xs text-gray-500 ml-1">(Tarih geriye çekilir)</span>
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="askerlikNedir"
              value="sonra"
              checked={form.askerlikNedir === 'sonra'}
              onChange={() => onAskerlikChange('sonra')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">
              İlk işe girişten <strong>SONRA</strong>
              <span className="text-xs text-gray-500 ml-1">(Normal hesaplama)</span>
            </span>
          </label>
        </div>

        {errors.askerlikBorclanlmasi && (
          <p className="text-xs text-red-600 mt-2">{errors.askerlikBorclanlmasi}</p>
        )}

        {/* Hesaplanan Tarih */}
        {hesaplananIlkIsGirisTarihi && form.askerlikNedir === 'once' && form.askerlikBorclanlmasi > 0 && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            <strong>Hesaplanan İlk İşe Giriş:</strong> {hesaplananIlkIsGirisTarihi}
          </div>
        )}
      </div>

      {/* Hesapla Button */}
      <button
        onClick={onHesapla}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Hesapla
      </button>
    </div>
  );
}
