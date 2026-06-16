import { EmeklilikKosulu } from '@/lib/calculator';

interface ResultCardProps {
  kosul: EmeklilikKosulu;
}

export default function ResultCard({ kosul }: ResultCardProps) {
  return (
    <div
      className={`card transition-all ${
        kosul.tamamlandi
          ? 'card-success shadow-lg'
          : 'card-warning shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b-2 border-opacity-30">
        <div className={`text-2xl ${kosul.tamamlandi ? 'text-green-600' : 'text-yellow-600'}`}>
          {kosul.tamamlandi ? '✓' : '⚠'}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${kosul.tamamlandi ? 'text-green-900' : 'text-yellow-900'}`}>
            {kosul.adi}
          </h3>
          <p className={`text-xs mt-1 ${kosul.tamamlandi ? 'text-green-700' : 'text-yellow-700'}`}>
            {kosul.tamamlandi ? 'Koşullar sağlanmıştır' : 'Şartlar eksiktir'}
          </p>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {kosul.kosullar.map((k, idx) => {
          const basarili = k.basarili;
          const gerekli = k.gerekli;
          const sahip = k.sahip;
          const yuzde = gerekli ? Math.min(Math.round((sahip / gerekli) * 100), 100) : 100;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <span className={basarili ? 'text-green-600 text-lg' : 'text-gray-400 text-lg'}>
                    {basarili ? '✓' : '○'}
                  </span>
                  {k.ad}
                </span>
                <span className={`font-mono font-bold ${basarili ? 'text-green-700' : 'text-gray-600'}`}>
                  {sahip}/{gerekli || '—'}
                </span>
              </div>

              {/* Progress bar */}
              {gerekli && (
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      basarili ? 'bg-green-500' : 'bg-yellow-400'
                    }`}
                    style={{ width: `${yuzde}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
