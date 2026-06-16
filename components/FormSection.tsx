'use client';

interface FormSectionProps {
  form: {
    dogumTarihi: string;
    cinsiyet: 'erkek' | 'kadin';
    ilkIsGirisTarihi: string;
    priGunu: number;
    askerlikBorclanlmasi: number;
    askerlikNedir: 'once' | 'sonra';
    ilkIsGirisOnceEngelliMi: boolean;
    statular: string[];
  };
  hesaplananIlkIsGirisTarihi?: string;
  errors: Record<string, string>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCheckbox: (statü: string) => void;
  onAskerlikChange: (nedir: 'once' | 'sonra') => void;
  onEngelliChange: (engelli: boolean) => void;
  onHesapla: () => void;
}

export default function FormSection({
  form,
  hesaplananIlkIsGirisTarihi,
  errors,
  onFormChange,
  onCheckbox,
  onAskerlikChange,
  onEngelliChange,
  onHesapla,
}: FormSectionProps) {
  return (
    <div className="card sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Sigortalı Bilgileri</h2>

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
          className="input-field"
        >
          <option value="erkek">Erkek</option>
          <option value="kadin">Kadın</option>
        </select>
      </div>

      {/* First Work Date */}
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

      {/* Engelli Checkbox (4/a için) */}
      {form.statular.includes('4a') && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.ilkIsGirisOnceEngelliMi}
              onChange={(e) => onEngelliChange(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded border-purple-300"
            />
            <span className="ml-2 text-sm text-gray-700">
              İlk işe giriş tarihinden <strong>ÖNCE</strong> engelli (malul) miydim?
              <span className="text-xs text-gray-500 block mt-1">
                (Bölge Sağlık Kurulu kararı gerekir)
              </span>
            </span>
          </label>
          <p className="text-xs text-purple-700 mt-3">
            💡 Eğer işe başlamadan önce kronik hastalık/engeli varsa işaretle
          </p>
        </div>
      )}

      {/* Statü Seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sigortalılık Statüsü <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            { value: '4a', label: '4/a (SSK)' },
            { value: '4b', label: '4/b (Bağ-Kur)' },
            { value: '4c', label: '4/c (Memur)' },
            { value: '2925', label: '2925 (Tarım Sigortası)' },
          ].map((stat) => (
            <label key={stat.value} className="flex items-center">
              <input
                type="checkbox"
                checked={form.statular.includes(stat.value)}
                onChange={() => onCheckbox(stat.value)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{stat.label}</span>
            </label>
          ))}
        </div>
        {errors.statular && (
          <p className="text-xs text-red-600 mt-2">{errors.statular}</p>
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
