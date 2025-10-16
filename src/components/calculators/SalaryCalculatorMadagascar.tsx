import React, { useState } from 'react';
import { Calculator, Info, TrendingUp, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { IRSAService } from '../../lib/services/irsaService';

export function SalaryCalculatorMadagascar() {
  const [salaireBrut, setSalaireBrut] = useState<number>(1800000);
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [showBareme, setShowBareme] = useState<boolean>(false);

  const calcul = IRSAService.calculerSalaireComplet(salaireBrut);
  const bareme = IRSAService.getBareme();

  const handleExport = () => {
    const texte = IRSAService.formaterCalcul(calcul);
    const blob = new Blob([texte], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulletin-salaire-${salaireBrut}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Calculateur IRSA Madagascar</h2>
              <p className="text-blue-100">Conforme à la législation fiscale 2024</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
        <label className="block text-lg font-medium text-gray-900 mb-4">
          <DollarSign className="w-5 h-5 inline mr-2 text-green-600" />
          Salaire Brut Mensuel (Ar)
        </label>
        <input
          type="number"
          value={salaireBrut}
          onChange={(e) => setSalaireBrut(parseFloat(e.target.value) || 0)}
          min="0"
          step="10000"
          className="w-full px-4 py-3 text-2xl font-bold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: 1 800 000"
        />
        <p className="text-sm text-gray-500 mt-2">
          Entrez le salaire mensuel brut en Ariary (Ar)
        </p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6">
        <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
          <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
          Cotisations Sociales Obligatoires
        </h3>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">OSTIE (2%)</p>
                <p className="text-xs text-gray-600">Œuvres Sociales</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">-{calcul.ostie.toLocaleString()} Ar</p>
                <p className="text-xs text-gray-500">{salaireBrut.toLocaleString()} × 2%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">CNaPS (1%)</p>
                <p className="text-xs text-gray-600">Caisse Nationale de Prévoyance Sociale</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">-{calcul.cnaps.toLocaleString()} Ar</p>
                <p className="text-xs text-gray-500">{salaireBrut.toLocaleString()} × 1%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
          <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
          Calcul du Revenu Imposable
        </h3>

        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-start space-x-2 bg-purple-50 rounded-lg p-3">
            <Info className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                Formule: RI = Salaire Brut - OSTIE - CNaPS
              </p>
              <p className="text-gray-600">
                RI = Salaire Brut × 0,97
              </p>
            </div>
          </div>

          <div className="border-t border-purple-200 pt-3">
            <p className="text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded">
              = {salaireBrut.toLocaleString()} - {calcul.ostie.toLocaleString()} - {calcul.cnaps.toLocaleString()}
              <br />
              = {calcul.revenuImposable.toLocaleString()} Ar
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Revenu Imposable:</span>
              <span className="text-2xl font-bold">{calcul.revenuImposable.toLocaleString()} Ar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-red-900 flex items-center">
            <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
            Application du Barème IRSA Progressif
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBareme(!showBareme)}
              className="px-3 py-1 bg-red-200 text-red-800 rounded-lg text-sm font-medium hover:bg-red-300 transition-colors"
            >
              {showBareme ? 'Masquer' : 'Voir'} barème
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 bg-red-200 text-red-800 rounded-lg text-sm font-medium hover:bg-red-300 transition-colors"
            >
              {showDetails ? 'Masquer' : 'Voir'} détails
            </button>
          </div>
        </div>

        {showBareme && (
          <div className="bg-white rounded-lg p-4 mb-4 border-2 border-red-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-red-600" />
              Barème IRSA Officiel Madagascar 2024
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700">Tranche de Revenu Imposable</th>
                    <th className="px-4 py-2 text-center text-gray-700">Taux</th>
                    <th className="px-4 py-2 text-right text-gray-700">Cumul Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bareme.map((tranche, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">
                        {tranche.min.toLocaleString()} - {tranche.max ? tranche.max.toLocaleString() : '∞'} Ar
                      </td>
                      <td className="px-4 py-2 text-center font-semibold text-red-600">
                        {tranche.taux}%
                      </td>
                      <td className="px-4 py-2 text-right text-gray-700">
                        {tranche.cumulPrecedent > 0 && `${tranche.cumulPrecedent.toLocaleString()} Ar`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-800 font-medium">
                📌 Minimum de perception IRSA: {IRSAService.getMinimumPerception().toLocaleString()} Ar
              </p>
            </div>
          </div>
        )}

        {showDetails && calcul.irsaDetail.tranches.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">Calcul Détaillé par Tranche</h4>
            <div className="space-y-2">
              {calcul.irsaDetail.tranches.map((tranche, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-3 ${
                    tranche.impotTranche > 0
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Tranche {index + 1}: {tranche.min.toLocaleString()} - {tranche.max.toLocaleString()} Ar
                      </p>
                      <p className="text-xs text-gray-600">Taux: {tranche.taux}%</p>
                    </div>
                    <span className={`text-sm font-bold ${
                      tranche.impotTranche > 0 ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {tranche.impotTranche > 0 ? `${tranche.impotTranche.toLocaleString()} Ar` : '0 Ar'}
                    </span>
                  </div>
                  {tranche.impotTranche > 0 && (
                    <div className="text-xs text-gray-700 bg-white rounded p-2 mt-2 font-mono">
                      {tranche.formule} = {tranche.impotTranche.toLocaleString()} Ar
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-red-300">
              <div className="bg-red-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">IRSA calculé (par tranches):</span>
                  <span className="font-bold text-gray-900">
                    {calcul.irsaDetail.irsaAvantMinimum.toLocaleString()} Ar
                  </span>
                </div>
                {calcul.irsaDetail.irsaFinal > calcul.irsaDetail.irsaAvantMinimum && (
                  <div className="flex justify-between text-sm bg-yellow-100 border border-yellow-300 rounded p-2">
                    <span className="text-yellow-800 font-medium">⚠️ Minimum de perception appliqué:</span>
                    <span className="font-bold text-yellow-900">
                      {calcul.irsaDetail.minimumPerception.toLocaleString()} Ar
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">IRSA Total à Déduire:</span>
            <span className="text-3xl font-bold">-{calcul.irsa.toLocaleString()} Ar</span>
          </div>
          <div className="flex justify-between items-center text-sm text-red-100">
            <span>Taux effectif:</span>
            <span className="font-medium">{calcul.irsaDetail.tauxEffectif.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-500 rounded-xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">RÉSULTAT FINAL</h3>
          <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-md">
            <p className="text-sm text-gray-600 mb-4 font-medium">Décomposition</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Salaire Brut:</span>
                <span className="font-semibold text-gray-900">{calcul.salaireBrut.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between py-1 text-red-600">
                <span>- OSTIE (2%):</span>
                <span className="font-semibold">{calcul.ostie.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between py-1 text-red-600">
                <span>- CNaPS (1%):</span>
                <span className="font-semibold">{calcul.cnaps.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between py-1 text-red-600">
                <span>- IRSA:</span>
                <span className="font-semibold">{calcul.irsa.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-gray-300 font-bold">
                <span className="text-gray-900">Total déductions:</span>
                <span className="text-red-600">{calcul.totalDeductions.toLocaleString()} Ar</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-md">
            <p className="text-sm text-gray-600 mb-4 font-medium">Analyse</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Taux de prélèvement total:</span>
                <span className="font-semibold text-orange-600">
                  {((calcul.totalDeductions / calcul.salaireBrut) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Revenu imposable:</span>
                <span className="font-semibold text-gray-900">{calcul.revenuImposable.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Taux IRSA effectif:</span>
                <span className="font-semibold text-purple-600">
                  {calcul.irsaDetail.tauxEffectif.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Part du net:</span>
                <span className="font-semibold text-green-600">
                  {((calcul.salaireNet / calcul.salaireBrut) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white text-center shadow-lg">
          <p className="text-sm uppercase tracking-wide mb-1 text-green-100">Salaire Net à Percevoir</p>
          <p className="text-5xl font-bold mb-2">
            {calcul.salaireNet.toLocaleString()} Ar
          </p>
          <p className="text-green-100 text-sm">
            Soit {((calcul.salaireNet / calcul.salaireBrut) * 100).toFixed(1)}% du salaire brut
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
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
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">CNaPS Employeur (13%):</span>
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
          </div>

          <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900">Coût Total Employeur:</span>
              <span className="text-xl font-bold text-orange-700">
                {(calcul.salaireBrut + Math.round(calcul.salaireBrut * 0.18)).toLocaleString()} Ar
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Salaire brut + charges patronales (18%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
