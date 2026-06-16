interface FormSectionProps {
  form: {
    dogumTarihi: string;
    cinsiyet: 'erkek' | 'kadin';
    ilkIsGirisTarihi: string;
    priGunu: number;
    borclanlmisGun: number;
    madenGunu: number;
    statular: string[];
  };
  errors: Record<string, string>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCheckbox: (statü: string) => void;
  onHesapla: () => void;
}

export default function FormSection({
  form,
  errors,
  onFormChange,
  onCheckbox,
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
          value={form.priGunu}
          onChange={onFormChange}
          min="0"
          max="20000"
          className={`input-field ${errors.priGunu ? 'border-red-500' : ''}`}
        />
        {errors.priGunu && <p className="text-xs text-red-600 mt-1">{errors.priGunu}</p>}
      </div>

      {/* Borrowed Days */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Borçlanmış Gün
          <span className="text-gray-500 text-xs ml-1">(askerlik, doğum vb.)</span>
        </label>
        <input
          type="number"
          name="borclanlmisGun"
          value={form.borclanlmisGun}
          onChange={onFormChange}
          min="0"
          className={`input-field ${errors.borclanlmisGun ? 'border-red-500' : ''}`}
        />
        {errors.borclanlmisGun && (
          <p className="text-xs text-red-600 mt-1">{errors.borclanlmisGun}</p>
        )}
      </div>

      {/* Mining Days */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maden Günü <span className="text-gray-500 text-xs ml-1">(varsa)</span>
        </label>
        <input
          type="number"
          name="madenGunu"
          value={form.madenGunu}
          onChange={onFormChange}
          min="0"
          max="10000"
          className={`input-field ${errors.madenGunu ? 'border-red-500' : ''}`}
        />
        {errors.madenGunu && (
          <p className="text-xs text-red-600 mt-1">{errors.madenGunu}</p>
        )}
      </div>

      {/* Status Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Statü Seçimi <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            { value: '4a', label: '4/a (SSK/İşçi)' },
            { value: '4b', label: '4/b (Bağ-Kur)' },
            { value: '4c', label: '4/c (Memur)' },
            { value: '2926', label: '2926 (Tarım Bağ-Kuru)' },
            { value: 'maden', label: 'Maden Yeraltı' },
          ].map((stat) => (
            <label key={stat.value} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition">
              <input
                type="checkbox"
                checked={form.statular.includes(stat.value)}
                onChange={() => onCheckbox(stat.value)}
                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{stat.label}</span>
            </label>
          ))}
        </div>
        {errors.statular && <p className="text-xs text-red-600 mt-2">{errors.statular}</p>}
      </div>

      {/* Calculate Button */}
      <button onClick={onHesapla} className="btn btn-primary w-full mb-4">
        🧮 Hesapla
      </button>

      {/* Reset Button */}
      <button
        onClick={() => window.location.reload()}
        className="btn btn-secondary w-full"
      >
        ↻ Sıfırla
      </button>
    </div>
  );
}
