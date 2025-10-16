import React from 'react';
import { Info, BookOpen } from 'lucide-react';
import { IRSAService } from '../lib/services/irsaService';

interface IRSABaremeDisplayProps {
  showExplanation?: boolean;
  compact?: boolean;
  className?: string;
}

export function IRSABaremeDisplay({
  showExplanation = true,
  compact = false,
  className = ''
}: IRSABaremeDisplayProps) {
  const bareme = IRSAService.getBareme();
  const minimumPerception = IRSAService.getMinimumPerception();

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center text-sm">
          <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
          Barème IRSA Madagascar 2024
        </h4>
        <div className="space-y-1">
          {bareme.map((tranche, index) => (
            <div key={index} className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-0">
              <span className="text-gray-700">
                {tranche.min.toLocaleString()} - {tranche.max ? tranche.max.toLocaleString() : '∞'} Ar
              </span>
              <span className={`font-semibold ${tranche.taux === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tranche.taux}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Minimum de perception: <span className="font-semibold text-gray-900">{minimumPerception.toLocaleString()} Ar</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-bold text-blue-900">
            Barème IRSA Officiel Madagascar 2024
          </h3>
          <p className="text-sm text-blue-700">
            Impôt sur les Revenus Salariaux et Assimilés
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tranche de Revenu Imposable</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Taux</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Cumul Max</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bareme.map((tranche, index) => (
              <tr key={index} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {tranche.min.toLocaleString()} - {tranche.max ? tranche.max.toLocaleString() : '∞'} Ar
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    tranche.taux === 0
                      ? 'bg-green-100 text-green-700'
                      : tranche.taux === 5
                      ? 'bg-blue-100 text-blue-700'
                      : tranche.taux === 10
                      ? 'bg-yellow-100 text-yellow-700'
                      : tranche.taux === 15
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {tranche.taux}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  {tranche.cumulPrecedent > 0 ? `${tranche.cumulPrecedent.toLocaleString()} Ar` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-900 mb-1">
              Minimum de perception IRSA
            </p>
            <p className="text-sm text-yellow-800">
              Si le calcul par tranches donne un montant inférieur à{' '}
              <span className="font-bold">{minimumPerception.toLocaleString()} Ar</span>,
              l'IRSA sera automatiquement fixé à ce montant minimum.
            </p>
          </div>
        </div>
      </div>

      {showExplanation && (
        <div className="mt-4 bg-white rounded-lg border border-blue-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Info className="w-4 h-4 mr-2 text-blue-600" />
            Comment calculer l'IRSA ?
          </h4>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 rounded p-3">
              <p className="font-medium text-blue-900 mb-1">Étape 1: Revenu Imposable</p>
              <p className="text-blue-800">RI = Salaire Brut - OSTIE (2%) - CNaPS (1%)</p>
              <p className="text-blue-800">RI = Salaire Brut × 0,97</p>
            </div>

            <div className="bg-blue-50 rounded p-3">
              <p className="font-medium text-blue-900 mb-1">Étape 2: Calcul par tranches</p>
              <p className="text-blue-800">
                L'IRSA est calculé progressivement sur chaque tranche selon le barème ci-dessus.
                Chaque portion du revenu est imposée au taux correspondant à sa tranche.
              </p>
            </div>

            <div className="bg-blue-50 rounded p-3">
              <p className="font-medium text-blue-900 mb-1">Étape 3: Minimum de perception</p>
              <p className="text-blue-800">
                Si le total calculé est inférieur à {minimumPerception.toLocaleString()} Ar,
                le minimum est appliqué.
              </p>
            </div>

            <div className="bg-green-50 border border-green-300 rounded p-3">
              <p className="font-medium text-green-900 mb-1">Exemple:</p>
              <p className="text-green-800 text-xs font-mono">
                Salaire brut: 1 800 000 Ar<br />
                RI: 1 800 000 × 0,97 = 1 746 000 Ar<br />
                <br />
                Tranche 1 (0-350 000): 0 Ar<br />
                Tranche 2 (350 001-400 000): 50 000 × 5% = 2 500 Ar<br />
                Tranche 3 (400 001-500 000): 100 000 × 10% = 10 000 Ar<br />
                Tranche 4 (500 001-600 000): 100 000 × 15% = 15 000 Ar<br />
                Tranche 5 (600 001+): 1 146 000 × 20% = 229 200 Ar<br />
                <br />
                IRSA Total: 256 700 Ar<br />
                Salaire Net: 1 489 300 Ar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
