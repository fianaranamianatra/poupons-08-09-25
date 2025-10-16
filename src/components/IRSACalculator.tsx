import React, { useState } from 'react';
import { Calculator, Info, TrendingDown } from 'lucide-react';
import { IRSAService, IRSACalculation } from '../lib/services/irsaService';

interface IRSACalculatorProps {
  revenuImposable: number;
  onCalculationChange?: (calculation: IRSACalculation) => void;
}

export function IRSACalculator({ revenuImposable, onCalculationChange }: IRSACalculatorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [calculation, setCalculation] = useState<IRSACalculation | null>(null);

  React.useEffect(() => {
    if (revenuImposable >= 0) {
      const calc = IRSAService.calculerIRSA(revenuImposable);
      setCalculation(calc);
      onCalculationChange?.(calc);
    }
  }, [revenuImposable, onCalculationChange]);

  if (!calculation) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Aucun calcul IRSA disponible</span>
        </div>
      </div>
    );
  }

  const bareme = IRSAService.getBareme();

  return (
    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-purple-800">IRSA (Impôt sur Revenus Salariaux)</h4>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium px-3 py-1 bg-purple-200 rounded hover:bg-purple-300 transition-colors"
        >
          {showDetails ? 'Masquer' : 'Détails'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-700">Revenu imposable:</span>
            <span className="font-bold text-purple-900">{calculation.revenuImposable.toLocaleString()} Ar</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-700">IRSA calculé:</span>
            <span className="font-bold text-gray-700">{calculation.irsaAvantMinimum.toLocaleString()} Ar</span>
          </div>

          {calculation.irsaFinal > calculation.irsaAvantMinimum && (
            <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-2">
              <p className="text-xs text-yellow-800 font-medium">
                ⚠️ Minimum de perception appliqué: {calculation.minimumPerception.toLocaleString()} Ar
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-purple-700">IRSA final à déduire:</span>
              <span className="text-xl font-bold text-red-600">-{calculation.irsaFinal.toLocaleString()} Ar</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-purple-600">Taux effectif:</span>
            <span className="text-xs font-medium text-purple-800">{calculation.tauxEffectif.toFixed(2)}%</span>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <h5 className="font-medium text-purple-800 mb-2 flex items-center text-sm">
                <Info className="w-4 h-4 mr-2" />
                Calcul détaillé par tranche
              </h5>

              <div className="space-y-2">
                {calculation.tranches.map((tranche, index) => (
                  <div key={index} className="bg-purple-50 rounded p-2 border border-purple-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        Tranche {index + 1}: {tranche.min.toLocaleString()} - {
                          tranche.max === calculation.revenuImposable && tranche.taux === 20
                            ? '∞'
                            : tranche.max.toLocaleString()
                        } Ar ({tranche.taux}%)
                      </span>
                      <span className="text-xs font-bold text-purple-600">
                        {tranche.impotTranche.toLocaleString()} Ar
                      </span>
                    </div>
                    {tranche.impotTranche > 0 && (
                      <div className="text-xs text-gray-500 font-mono">
                        {tranche.formule}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <h6 className="font-medium text-purple-800 mb-2 text-xs">Barème IRSA Madagascar 2024</h6>
              <div className="space-y-1">
                {bareme.map((tranche, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-700">
                      {tranche.min.toLocaleString()} - {tranche.max ? tranche.max.toLocaleString() : '∞'} Ar
                    </span>
                    <span className={`font-medium ${
                      tranche.taux === 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tranche.taux}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-purple-200">
                <p className="text-xs text-purple-700">
                  Minimum de perception: {IRSAService.getMinimumPerception().toLocaleString()} Ar
                </p>
              </div>
            </div>

            {calculation.notes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h6 className="font-medium text-gray-800 mb-2 text-xs">Notes de calcul</h6>
                <div className="space-y-1">
                  {calculation.notes.map((note, index) => (
                    <p key={index} className="text-xs text-gray-600">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
