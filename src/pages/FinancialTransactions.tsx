import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, TrendingUp, TrendingDown, DollarSign, Calendar, Eye, CreditCard as Edit, Trash2, AlertTriangle, CheckCircle, RefreshCw, Zap, Lock } from 'lucide-react';
import { Modal } from '../components/Modal';
import { TransactionForm } from '../components/forms/TransactionForm';
import { Avatar } from '../components/Avatar';
import { useFirebaseCollection } from '../hooks/useFirebaseCollection';
import { transactionsService } from '../lib/firebase/firebaseService';
import { TransactionDeduplicationService } from '../lib/services/transactionDeduplicationService';
import { CentralizedSyncPanel } from '../components/financial/CentralizedSyncPanel';
import { usePermissions } from '../hooks/usePermissions';
import { USER_ROLES, canModifyData } from '../lib/roles';

interface Transaction {
  id?: string;
  type: 'Encaissement' | 'Décaissement';
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: 'Validé' | 'En attente' | 'Annulé';
  reference?: string;
  relatedModule?: 'ecolage' | 'salary' | 'other';
  relatedId?: string;
  isManual?: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const statusColors = {
  'Validé': 'bg-green-100 text-green-800',
  'En attente': 'bg-yellow-100 text-yellow-800',
  'Annulé': 'bg-red-100 text-red-800'
};

const typeColors = {
  'Encaissement': 'text-green-600',
  'Décaissement': 'text-red-600'
};

export default function FinancialTransactions() {
  const { is, role } = usePermissions();
  const isSecretary = is([USER_ROLES.SECRETARY]);
  const canModify = role ? canModifyData(role) : false;

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [deduplicationResult, setDeduplicationResult] = useState<any>(null);
  const [showDeduplicationModal, setShowDeduplicationModal] = useState(false);
  const [autoDeduplicationEnabled, setAutoDeduplicationEnabled] = useState(true);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hook Firebase avec synchronisation temps réel
  const {
    data: transactions,
    loading,
    error,
    creating,
    updating,
    deleting,
    create,
    update,
    remove
  } = useFirebaseCollection<Transaction>(transactionsService, true);

  // Déduplication automatique au chargement des données
  useEffect(() => {
    if (transactions.length > 0 && autoDeduplicationEnabled) {
      // Délai pour éviter les appels trop fréquents
      const timer = setTimeout(() => {
        checkAndRemoveDuplicatesAutomatically();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [transactions.length, autoDeduplicationEnabled]);

  const checkAndRemoveDuplicatesAutomatically = async () => {
    try {
      console.log('🔍 Vérification automatique des doublons...');
      
      // Analyser d'abord pour voir s'il y a des doublons
      const analysis = await TransactionDeduplicationService.analyzeDuplicates();
      
      if (analysis.duplicatesFound > 0) {
        console.log(`⚠️ ${analysis.duplicatesFound} doublon(s) détecté(s) - Suppression automatique`);
        
        // Supprimer automatiquement les doublons
        const result = await TransactionDeduplicationService.removeDuplicates();
        
        if (result.success && result.duplicatesRemoved > 0) {
          console.log(`✅ Suppression automatique réussie: ${result.duplicatesRemoved} doublon(s) supprimé(s)`);
          
          // Afficher une notification discrète
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50';
          notification.innerHTML = `
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-sm font-medium">${result.duplicatesRemoved} doublon(s) supprimé(s) automatiquement</span>
            </div>
          `;
          
          document.body.appendChild(notification);
          
          // Supprimer la notification après 5 secondes
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 5000);
        }
      } else {
        console.log('✅ Aucun doublon détecté');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déduplication automatique:', error);
    }
  };

  const handleManualDeduplication = async () => {
    if (!confirm('Analyser et supprimer tous les doublons de transactions ?')) {
      return;
    }

    setIsDeduplicating(true);
    try {
      console.log('🧹 Déduplication manuelle lancée...');
      
      // Analyser d'abord
      const analysis = await TransactionDeduplicationService.analyzeDuplicates();
      
      if (analysis.duplicatesFound === 0) {
        alert('✅ Aucun doublon détecté dans les transactions');
        setIsDeduplicating(false);
        return;
      }

      // Supprimer les doublons
      const result = await TransactionDeduplicationService.removeDuplicates();
      setDeduplicationResult(result);
      setShowDeduplicationModal(true);
      
      if (result.success) {
        console.log(`✅ Déduplication réussie: ${result.duplicatesRemoved} doublon(s) supprimé(s)`);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la déduplication:', error);
      alert('❌ Erreur lors de la déduplication: ' + error.message);
    } finally {
      setIsDeduplicating(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === '' || transaction.type === selectedType;
    const matchesStatus = selectedStatus === '' || transaction.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalEncaissements = transactions
    .filter(t => t.type === 'Encaissement' && t.status === 'Validé')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDecaissements = transactions
    .filter(t => t.type === 'Décaissement' && t.status === 'Validé')
    .reduce((acc, t) => acc + t.amount, 0);

  const soldeNet = totalEncaissements - totalDecaissements;
  const transactionsEnAttente = transactions.filter(t => t.status === 'En attente').length;

  const handleAddTransaction = async (data: any) => {
    try {
      console.log('🚀 Ajout de transaction - Données reçues:', data);
      
      const transactionData = {
        type: data.type,
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        date: data.date,
        paymentMethod: data.paymentMethod,
        status: data.status,
        reference: data.reference || `TXN-${Date.now()}`,
        isManual: true,
        notes: data.notes || ''
      };
      
      console.log('📝 Données formatées pour Firebase:', transactionData);
      
      const transactionId = await create(transactionData);
      console.log('✅ Transaction créée avec l\'ID:', transactionId);
      
      setShowAddForm(false);
      
      alert('✅ Transaction enregistrée avec succès !');
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'ajout de la transaction:', error);
      alert('❌ Erreur lors de l\'ajout de la transaction: ' + error.message);
    }
  };

  const handleEditTransaction = async (data: any) => {
    if (selectedTransaction?.id) {
      try {
        console.log('🔄 Modification de transaction - Données:', data);
        
        const updateData = {
          ...data,
          amount: parseFloat(data.amount)
        };
        
        await update(selectedTransaction.id, updateData);
        console.log('✅ Transaction modifiée avec succès');
        
        setShowEditForm(false);
        setSelectedTransaction(null);
        
        alert('✅ Transaction modifiée avec succès !');
        
      } catch (error: any) {
        console.error('❌ Erreur lors de la modification:', error);
        alert('❌ Erreur lors de la modification: ' + error.message);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        console.log('🗑️ Suppression de la transaction ID:', id);
        await remove(id);
        console.log('✅ Transaction supprimée avec succès');
        alert('✅ Transaction supprimée avec succès !');
      } catch (error: any) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert('❌ Erreur lors de la suppression: ' + error.message);
      }
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditForm(true);
  };

  const handleExport = () => {
    const csvContent = [
      'Type,Catégorie,Description,Montant,Date,Mode de Paiement,Statut,Référence,Notes',
      ...filteredTransactions.map(t => [
        t.type,
        t.category,
        t.description,
        t.amount,
        t.date,
        t.paymentMethod,
        t.status,
        t.reference || '',
        t.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erreur: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center sm:justify-between gap-4'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>Encaissements et Décaissements</h1>
          <p className={`${isMobile ? 'text-sm' : ''} text-gray-600`}>Gestion centralisée des flux financiers</p>
          {isSecretary && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Lock className="w-4 h-4 mr-1" />
              <span>Accès en consultation uniquement</span>
            </div>
          )}
          {!isSecretary && (
            <div className="flex items-center space-x-4 mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-600 font-medium">
                Synchronisation automatique avec Écolage et Salaires
              </span>
              <span className="text-xs text-green-600 font-medium">
                Déduplication automatique active
              </span>
            </div>
          )}
        </div>

        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'}`}>
          {canModify && (
            <button
              onClick={handleManualDeduplication}
              disabled={isDeduplicating}
              className={`inline-flex items-center justify-center ${isMobile ? 'px-4 py-3 text-base' : 'px-4 py-2'} border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50`}
            >
              {isDeduplicating ? (
                <div className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2`}></div>
              ) : (
                <Zap className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-2'}`} />
              )}
              {isDeduplicating ? 'Suppression...' : 'Supprimer Doublons'}
            </button>
          )}
          <button
            onClick={handleExport}
            className={`${isMobile ? 'hidden sm:inline-flex' : 'inline-flex'} items-center justify-center ${isMobile ? 'px-4 py-3 text-base' : 'px-4 py-2'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`}
          >
            <Download className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-2'}`} />
            Exporter
          </button>
          {canModify && (
            <button
              onClick={() => {
                console.log('🔘 Ouverture du formulaire d\'ajout de transaction');
                setShowAddForm(true);
              }}
              disabled={creating}
              className={`inline-flex items-center justify-center ${isMobile ? 'px-4 py-3 text-base' : 'px-4 py-2'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50`}
            >
              {creating ? (
                <div className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} border-2 border-white border-t-transparent rounded-full animate-spin mr-2`}></div>
              ) : (
                <Plus className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-2'}`} />
              )}
              Nouvelle Transaction
            </button>
          )}
        </div>
      </div>

      {/* Panneau de Synchronisation Centralisée */}
      <CentralizedSyncPanel />

      {/* Notification de déduplication automatique */}
      {autoDeduplicationEnabled && (
        <div className={`bg-green-50 border border-green-200 ${isMobile ? 'rounded-lg p-4' : 'rounded-xl p-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-green-900`}>
                  🤖 Déduplication Automatique Active
                </h3>
                <p className={`${isMobile ? 'text-sm' : ''} text-green-700`}>
                  Les doublons de transactions sont automatiquement détectés et supprimés en temps réel.
                </p>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-4'} ${isMobile ? 'text-sm' : 'text-sm'} text-green-800 mt-2`}>
                  <div>
                    <h4 className="font-medium mb-1">✅ Protection active contre:</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Transactions identiques multiples</li>
                      <li>• Doublons d'intégration automatique</li>
                      <li>• Erreurs de synchronisation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">🔄 Processus automatisé:</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Détection en temps réel</li>
                      <li>• Conservation de la version la plus récente</li>
                      <li>• Suppression silencieuse des doublons</li>
                      <li>• Notification des actions effectuées</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setAutoDeduplicationEnabled(!autoDeduplicationEnabled)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                autoDeduplicationEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'border border-green-300 text-green-700 hover:bg-green-50'
              }`}
            >
              {autoDeduplicationEnabled ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className={`bg-white ${isMobile ? 'rounded-lg p-4' : 'rounded-xl p-6'} shadow-sm border border-gray-100`}>
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col lg:flex-row gap-4'}`}>
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
              <input
                type="text"
                placeholder="Rechercher par description, catégorie ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isMobile ? 'pl-12 pr-4 py-3 text-base' : 'pl-10 pr-4 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
          
          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'}`}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Tous les types</option>
              <option value="Encaissement">Encaissements</option>
              <option value="Décaissement">Décaissements</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Tous les statuts</option>
              <option value="Validé">Validé</option>
              <option value="En attente">En attente</option>
              <option value="Annulé">Annulé</option>
            </select>
            
            <button className={`${isMobile ? 'hidden sm:inline-flex' : 'inline-flex'} items-center justify-center ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`}>
              <Filter className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-2'}`} />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-4 gap-4'}`}>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total Encaissements</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>{totalEncaissements.toLocaleString()} Ar</p>
            </div>
            <TrendingUp className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-green-600`} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total Décaissements</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-red-600`}>{totalDecaissements.toLocaleString()} Ar</p>
            </div>
            <TrendingDown className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-red-600`} />
          </div>
        </div>
        
        <div className={`bg-white rounded-lg p-4 border border-gray-100 ${isMobile ? 'col-span-2' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Solde Net</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold ${soldeNet >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {soldeNet.toLocaleString()} Ar
              </p>
            </div>
            <DollarSign className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} ${soldeNet >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
          </div>
        </div>
        
        <div className={`bg-white rounded-lg p-4 border border-gray-100 ${isMobile ? 'hidden' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{transactionsEnAttente}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`bg-white ${isMobile ? 'rounded-lg' : 'rounded-xl'} shadow-sm border border-gray-100 overflow-hidden`}>
        {transactions.length === 0 ? (
          <div className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
            <DollarSign className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-gray-300 mx-auto mb-4`} />
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-900 mb-2`}>Aucune transaction enregistrée</h3>
            <p className={`${isMobile ? 'text-sm' : ''} text-gray-500 mb-6`}>
              Les transactions des modules Écolage et Salaires apparaîtront automatiquement ici.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className={`inline-flex items-center ${isMobile ? 'px-6 py-3 text-base' : 'px-4 py-2'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
            >
              <Plus className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-2'}`} />
              Nouvelle Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={`text-left ${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-6'} font-medium text-gray-900`}>Type</th>
                  <th className={`text-left ${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-6'} font-medium text-gray-900`}>Description</th>
                  <th className={`text-left ${isMobile ? 'py-2 px-3 text-sm hidden sm:table-cell' : 'py-3 px-6'} font-medium text-gray-900`}>Catégorie</th>
                  <th className={`text-left ${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-6'} font-medium text-gray-900`}>Montant</th>
                  <th className={`text-left ${isMobile ? 'py-2 px-3 text-sm hidden md:table-cell' : 'py-3 px-6'} font-medium text-gray-900`}>Date</th>
                  <th className={`text-left ${isMobile ? 'py-2 px-3 text-sm hidden lg:table-cell' : 'py-3 px-6'} font-medium text-gray-900`}>Mode</th>
                  <th className={`text-left ${isMobile ? 'py-2 px-3 text-sm hidden sm:table-cell' : 'py-3 px-6'} font-medium text-gray-900`}>Statut</th>
                  <th className={`text-left ${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-6'} font-medium text-gray-900`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`${isMobile ? 'py-3 px-3' : 'py-4 px-6'}`}>
                      <div className="flex items-center space-x-2">
                        {transaction.type === 'Encaissement' ? (
                          <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-600`} />
                        ) : (
                          <TrendingDown className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-600`} />
                        )}
                        <span className={`${isMobile ? 'text-sm' : ''} font-medium ${typeColors[transaction.type]}`}>
                          {transaction.type}
                        </span>
                      </div>
                      {/* Indicateur de source sur mobile */}
                      {isMobile && transaction.relatedModule && (
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            transaction.relatedModule === 'ecolage' ? 'bg-green-100 text-green-800' :
                            transaction.relatedModule === 'salary' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.relatedModule === 'ecolage' ? 'Écolage' :
                             transaction.relatedModule === 'salary' ? 'Salaire' : 'Manuel'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className={`${isMobile ? 'py-3 px-3' : 'py-4 px-6'}`}>
                      <div>
                        <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>{transaction.description}</p>
                        {transaction.reference && (
                          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>{transaction.reference}</p>
                        )}
                        {/* Afficher la catégorie sur mobile */}
                        {isMobile && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {transaction.category}
                          </span>
                        )}
                        {/* Indicateur de source */}
                        {transaction.relatedModule && !isMobile && (
                          <div className="flex items-center space-x-1 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              transaction.relatedModule === 'ecolage' ? 'bg-green-500' :
                              transaction.relatedModule === 'salary' ? 'bg-purple-500' : 'bg-gray-500'
                            }`}></div>
                            <span className="text-xs text-gray-500">
                              {transaction.relatedModule === 'ecolage' ? 'Depuis Écolage' :
                               transaction.relatedModule === 'salary' ? 'Depuis Salaires' : 'Manuel'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`${isMobile ? 'py-3 px-3 hidden sm:table-cell' : 'py-4 px-6'}`}>
                      <span className={`inline-flex items-center ${isMobile ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'} font-medium bg-blue-100 text-blue-800 rounded-full`}>
                        {transaction.category}
                      </span>
                    </td>
                    <td className={`${isMobile ? 'py-3 px-3' : 'py-4 px-6'}`}>
                      <div className="flex items-center space-x-1">
                        {transaction.type === 'Encaissement' ? (
                          <span className="text-green-600">+</span>
                        ) : (
                          <span className="text-red-600">-</span>
                        )}
                        <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-bold text-gray-900`}>
                          {transaction.amount.toLocaleString()} Ar
                        </span>
                      </div>
                    </td>
                    <td className={`${isMobile ? 'py-3 px-3 hidden md:table-cell' : 'py-4 px-6'}`}>
                      <div className="flex items-center space-x-2">
                        <Calendar className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                          {new Date(transaction.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className={`${isMobile ? 'py-3 px-3 hidden lg:table-cell' : 'py-4 px-6'}`}>
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>{transaction.paymentMethod}</span>
                    </td>
                    <td className={`${isMobile ? 'py-3 px-3 hidden sm:table-cell' : 'py-4 px-6'}`}>
                      <span className={`inline-flex items-center ${isMobile ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'} font-medium rounded-full ${statusColors[transaction.status]}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className={`${isMobile ? 'py-3 px-3' : 'py-4 px-6'}`}>
                      <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
                        <button
                          onClick={() => handleViewTransaction(transaction)}
                          className={`${isMobile ? 'p-2' : 'p-1.5'} text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors`}
                          title="Consulter"
                        >
                          <Eye className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                        </button>
                        {!isMobile && canModify && (
                          <>
                            <button
                              onClick={() => handleEditClick(transaction)}
                              disabled={updating}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => transaction.id && handleDeleteTransaction(transaction.id)}
                              disabled={deleting}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {/* Menu mobile pour les actions supplémentaires */}
                        {isMobile && (
                          <button 
                            onClick={() => {
                              const choice = confirm('Modifier cette transaction ?');
                              if (choice) {
                                handleEditClick(transaction);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Plus d'actions"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Nouvelle Transaction"
        size={isMobile ? "xl" : "lg"}
      >
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={creating}
        />
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedTransaction(null);
        }}
        title="Modifier la Transaction"
        size={isMobile ? "xl" : "lg"}
      >
        {selectedTransaction && (
          <TransactionForm
            onSubmit={handleEditTransaction}
            onCancel={() => {
              setShowEditForm(false);
              setSelectedTransaction(null);
            }}
            initialData={selectedTransaction}
            isSubmitting={updating}
          />
        )}
      </Modal>

      {/* View Transaction Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTransaction(null);
        }}
        title="Détails de la Transaction"
        size={isMobile ? "xl" : "lg"}
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full flex items-center justify-center ${
                selectedTransaction.type === 'Encaissement' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {selectedTransaction.type === 'Encaissement' ? (
                  <TrendingUp className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-green-600`} />
                ) : (
                  <TrendingDown className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-red-600`} />
                )}
              </div>
              <div>
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>{selectedTransaction.description}</h3>
                <p className={`${isMobile ? 'text-sm' : ''} text-gray-600`}>{selectedTransaction.category}</p>
                {selectedTransaction.reference && (
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>Réf: {selectedTransaction.reference}</p>
                )}
              </div>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
              <div>
                <h4 className={`font-medium text-gray-900 ${isMobile ? 'text-sm mb-2' : 'mb-2'}`}>Informations financières</h4>
                <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <p><span className="font-medium">Type:</span> {selectedTransaction.type}</p>
                  <p><span className="font-medium">Montant:</span> 
                    <span className={`ml-2 font-bold ${typeColors[selectedTransaction.type]}`}>
                      {selectedTransaction.type === 'Encaissement' ? '+' : '-'}{selectedTransaction.amount.toLocaleString()} Ar
                    </span>
                  </p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedTransaction.date).toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-medium">Mode de paiement:</span> {selectedTransaction.paymentMethod}</p>
                </div>
              </div>
              
              <div>
                <h4 className={`font-medium text-gray-900 ${isMobile ? 'text-sm mb-2' : 'mb-2'}`}>Statut et informations</h4>
                <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <p><span className="font-medium">Statut:</span> 
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded ${isMobile ? 'text-xs' : 'text-xs'} font-medium ${statusColors[selectedTransaction.status]}`}>
                      {selectedTransaction.status}
                    </span>
                  </p>
                  {selectedTransaction.relatedModule && (
                    <p><span className="font-medium">Source:</span> 
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        selectedTransaction.relatedModule === 'ecolage' ? 'bg-green-100 text-green-800' :
                        selectedTransaction.relatedModule === 'salary' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTransaction.relatedModule === 'ecolage' ? 'Écolage' :
                         selectedTransaction.relatedModule === 'salary' ? 'Salaires' : 'Manuel'}
                      </span>
                    </p>
                  )}
                  {selectedTransaction.notes && (
                    <p><span className="font-medium">Notes:</span> {selectedTransaction.notes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Deduplication Result Modal */}
      <Modal
        isOpen={showDeduplicationModal}
        onClose={() => {
          setShowDeduplicationModal(false);
          setDeduplicationResult(null);
        }}
        title="Résultat de la Déduplication"
        size={isMobile ? "xl" : "lg"}
      >
        {deduplicationResult && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              deduplicationResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {deduplicationResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <h3 className={`font-medium ${
                  deduplicationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {deduplicationResult.success 
                    ? '✅ Déduplication Réussie' 
                    : '❌ Erreurs lors de la Déduplication'
                  }
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{deduplicationResult.totalTransactions}</p>
                <p className="text-sm text-blue-700">Total Transactions</p>
              </div>
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{deduplicationResult.duplicatesRemoved}</p>
                <p className="text-sm text-red-700">Doublons Supprimés</p>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{deduplicationResult.uniqueTransactionsKept}</p>
                <p className="text-sm text-green-700">Transactions Uniques</p>
              </div>
            </div>

            {deduplicationResult.errors && deduplicationResult.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Erreurs Rencontrées</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {deduplicationResult.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">📊 Résumé</h4>
              <p className="text-blue-700 text-sm">
                La base de données a été nettoyée avec succès. Les totaux financiers sont maintenant corrects 
                et reflètent les vraies données sans duplication.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeduplicationModal(false);
                  setDeduplicationResult(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}