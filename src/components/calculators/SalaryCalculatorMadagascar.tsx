import React, { useState } from 'react';
import { Calculator, Info, TrendingUp, DollarSign } from 'lucide-react';
import { IRSAService } from '../../lib/services/irsaService';

export function SalaryCalculatorMadagascar() {
  const [salaireBrut, setSalaireBrut] = useState<number>(250000);
  const [showDetails, setShowDetails] = useState<boolean>(true);

  const calcul = IRSAService.calculerSalaireComplet(salaireBrut);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <Calculator className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Calculateur de Salaire Madagascar</h2>
            <p className="text-blue-100">Conforme à la législation fiscale et sociale malgache</p>
          </div>
        </div>
      </div>

      {/* Saisie du Salaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-lg font-medium text-gray-900 mb-4">
          <DollarSign className="w-5 h-5 inline mr-2" />
          Salaire de Base (Ar)
        </label>
        <input
          type="number"
          value={salaireBrut}
          onChange={(e) => setSalaireBrut(parseFloat(e.target.value) || 0)}
          min="0"
          step="10000"
          className="w-full px-4 py-3 text-2xl font-bold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: 250000"
        />
        <p className="text-sm text-gray-500 mt-2">
          Entrez le salaire mensuel brut en Ariary
        </p>
      </div>

      {/* ÉTAPE 1: Cotisations Obligatoires */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-900">
            ÉTAPE 1: Cotisations Obligatoires
          </h3>
          <span className="text-sm text-orange-700 font-medium">
            Total: {(calcul.ostie + calcul.cnaps).toLocaleString()} Ar
          </span>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">OSTIE (2%)</p>
                <p className="text-sm text-gray-600">Contribution Sociale Généralisée</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">-{calcul.ostie.toLocaleString()} Ar</p>
                <p className="text-xs text-gray-500">{salaireBrut.toLocaleString()} × 2%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">CNAPS (1%)</p>
                <p className="text-sm text-gray-600">Caisse Nationale de Prévoyance Sociale</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">-{calcul.cnaps.toLocaleString()} Ar</p>
                <p className="text-xs text-gray-500">{salaireBrut.toLocaleString()} × 1%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ÉTAPE 2: Salaire Imposable */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4">
          ÉTAPE 2: Calcul du Salaire Imposable (IRSA)
        </h3>

        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Formule: Salaire imposable = Salaire Brut - CNAPS
              </p>
              <p className="text-sm text-gray-600">
                Avec minimum de perception de 3 000 Ar
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-700 mb-2">
              = {salaireBrut.toLocaleString()} - {calcul.cnaps.toLocaleString()} = {(salaireBrut - calcul.cnaps).toLocaleString()} Ar
            </p>
            {(salaireBrut - calcul.cnaps) < 3000 ? (
              <div className="bg-orange-100 border border-orange-300 rounded p-3">
                <p className="text-sm text-orange-800 font-medium">
                  ⚠️ {(salaireBrut - calcul.cnaps).toLocaleString()} Ar &lt; 3 000 Ar
                </p>
                <p className="text-sm text-orange-800">
                  → Application du minimum de perception: 3 000 Ar
                </p>
              </div>
            ) : (
              <div className="bg-green-100 border border-green-300 rounded p-3">
                <p className="text-sm text-green-800 font-medium">
                  ✓ {(salaireBrut - calcul.cnaps).toLocaleString()} Ar &gt; 3 000 Ar
                </p>
                <p className="text-sm text-green-800">
                  → Salaire imposable = {calcul.salaireImposable.toLocaleString()} Ar
                </p>
              </div>
            )}
          </div>

          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-purple-900">Salaire Imposable:</span>
              <span className="text-2xl font-bold text-purple-700">
                {calcul.salaireImposable.toLocaleString()} Ar
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ÉTAPE 3: Application IRSA */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-red-900">
            ÉTAPE 3: Application de l'IRSA Progressif
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 bg-red-200 text-red-800 rounded-lg text-sm font-medium hover:bg-red-300"
          >
            {showDetails ? 'Masquer' : 'Afficher'} détails
          </button>
        </div>

        {/* Barème IRSA */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Barème IRSA Madagascar</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700">0 - 150 000 Ar</span>
              <span className="font-medium text-green-600">0% (Exonéré)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700">150 001 - 250 000 Ar</span>
              <span className="font-medium text-blue-600">5%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700">250 001 - 400 000 Ar</span>
              <span className="font-medium text-purple-600">10%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700">400 001 - 600 000 Ar</span>
              <span className="font-medium text-orange-600">15%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-700">Au-delà de 600 000 Ar</span>
              <span className="font-medium text-red-600">20%</span>
            </div>
          </div>
        </div>

        {/* Détail des tranches */}
        {showDetails && calcul.irsaDetail.tranches.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Calcul Détaillé par Tranche</h4>
            <div className="space-y-3">
              {calcul.irsaDetail.tranches.map((tranche, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Tranche {index + 1}: {tranche.min.toLocaleString()} - {tranche.max.toLocaleString()} Ar
                      </p>
                      <p className="text-xs text-gray-600">Taux: {tranche.taux}%</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {tranche.impotTranche.toLocaleString()} Ar
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                    {tranche.montantTranche.toLocaleString()} Ar × {tranche.taux}% = {tranche.impotTranche.toLocaleString()} Ar
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résultat IRSA */}
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-bold text-red-900">IRSA Total:</span>
            <span className="text-2xl font-bold text-red-700">
              -{calcul.irsa.toLocaleString()} Ar
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-red-700">Taux effectif:</span>
            <span className="font-medium text-red-700">
              {calcul.irsaDetail.tauxEffectif.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* RÉSULTAT FINAL */}
      <div className="bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-500 rounded-xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">RÉSULTAT FINAL</h3>
          <div className="w-20 h-1 bg-green-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-3">Décomposition</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Salaire Brut:</span>
                <span className="font-medium">{calcul.salaireBrut.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- OSTIE (2%):</span>
                <span className="font-medium">{calcul.ostie.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- CNAPS (1%):</span>
                <span className="font-medium">{calcul.cnaps.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- IRSA:</span>
                <span className="font-medium">{calcul.irsa.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300 font-bold">
                <span>Total déductions:</span>
                <span className="text-red-600">{calcul.totalDeductions.toLocaleString()} Ar</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-3">Analyse</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Taux de prélèvement:</span>
                <span className="font-medium text-orange-600">
                  {((calcul.totalDeductions / calcul.salaireBrut) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Salaire imposable:</span>
                <span className="font-medium">{calcul.salaireImposable.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Taux IRSA effectif:</span>
                <span className="font-medium text-purple-600">
                  {calcul.irsaDetail.tauxEffectif.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white text-center">
          <p className="text-lg mb-2">SALAIRE NET À PERCEVOIR</p>
          <p className="text-5xl font-bold mb-2">
            {calcul.salaireNet.toLocaleString()} Ar
          </p>
          <p className="text-green-100 text-sm">
            Soit {((calcul.salaireNet / calcul.salaireBrut) * 100).toFixed(1)}% du salaire brut
          </p>
        </div>
      </div>

      {/* Charges Patronales */}
      <div className="bg-gray-50 border border-gray-300 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Charges Patronales (Information)
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Ces charges ne sont pas déduites du salaire de l'employé mais sont à la charge de l'employeur
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">CNAPS Employeur (13%):</span>
              <span className="font-bold text-orange-600">
                +{Math.round(calcul.salaireBrut * 0.13).toLocaleString()} Ar
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">OSTIE Employeur (5%):</span>
              <span className="font-bold text-orange-600">
                +{Math.round(calcul.salaireBrut * 0.05).toLocaleString()} Ar
              </span>
            </div>
          </div>

          <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Coût Total Employeur:</span>
              <span className="text-xl font-bold text-orange-700">
                {(calcul.salaireBrut + Math.round(calcul.salaireBrut * 0.13) + Math.round(calcul.salaireBrut * 0.05)).toLocaleString()} Ar
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Salaire brut + charges patronales (18%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
