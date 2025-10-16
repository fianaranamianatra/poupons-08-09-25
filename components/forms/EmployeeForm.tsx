import React, { useState } from 'react';
import { User, Mail, Phone, Briefcase, Building, Users, DollarSign, Calendar, Shield, Calculator, Clock } from 'lucide-react';
import { useFirebaseCollection } from '../../hooks/useFirebaseCollection';
import { hierarchyService, teachersService } from '../../lib/firebase/firebaseService';
import { IRSAService } from '../../lib/services/irsaService';

interface EmployeeFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function EmployeeForm({ onSubmit, onCancel, initialData }: EmployeeFormProps) {
  // Hook Firebase pour charger les employés existants (pour la liste des superviseurs)
  const { data: employees, loading: employeesLoading } = useFirebaseCollection(hierarchyService, true);
  // Hook Firebase pour charger les enseignants existants
  const { data: teachers, loading: teachersLoading } = useFirebaseCollection(teachersService, true);

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    level: initialData?.level || 1,
    parentId: initialData?.parentId || '',
    salary: initialData?.salary || '',
    entryDate: initialData?.entryDate || '',
    contractType: initialData?.contractType || '',
    experience: initialData?.experience || '',
    retirementDate: initialData?.retirementDate || '',
    status: initialData?.status || 'active'
  });

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [isTeacherPosition, setIsTeacherPosition] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    age: 0,
    calculatedExperience: 0,
    experienceText: '',
    calculatedRetirementDate: '',
    salaireImposable: 0,
    irsa: 0,
    salaireNet: 0
  });

  // Options prédéfinies pour les postes
  const positionOptions = [
    // Direction
    { value: 'Directeur Général', label: 'Directeur Général', department: 'Direction', level: 1 },
    { value: 'Directrice Pédagogique', label: 'Directrice Pédagogique', department: 'Direction', level: 2 },
    { value: 'Sous-Directeur', label: 'Sous-Directeur', department: 'Direction', level: 2 },
    
    // Administration
    { value: 'Comptable', label: 'Comptable', department: 'Administration', level: 3 },
    { value: 'Secrétaire Générale', label: 'Secrétaire Générale', department: 'Administration', level: 3 },
    { value: 'Assistant Administratif', label: 'Assistant Administratif', department: 'Administration', level: 4 },
    { value: 'Responsable Financier', label: 'Responsable Financier', department: 'Administration', level: 3 },
    
    // Enseignement - Maternelle
    { value: 'Institutrice TPSA', label: 'Institutrice TPSA (Très Petite Section A)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice TPSB', label: 'Institutrice TPSB (Très Petite Section B)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice PSA', label: 'Institutrice PSA (Petite Section A)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice PSB', label: 'Institutrice PSB (Petite Section B)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice PSC', label: 'Institutrice PSC (Petite Section C)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice MS_A', label: 'Institutrice MS_A (Moyenne Section A)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice MSB', label: 'Institutrice MSB (Moyenne Section B)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice GSA', label: 'Institutrice GSA (Grande Section A)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice GSB', label: 'Institutrice GSB (Grande Section B)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice GSC', label: 'Institutrice GSC (Grande Section C)', department: 'Enseignement', level: 3 },
    
    // Enseignement - Primaire
    { value: 'Instituteur 11_A (CP)', label: 'Instituteur 11_A (CP)', department: 'Enseignement', level: 3 },
    { value: 'Instituteur 11B (CP)', label: 'Instituteur 11B (CP)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice 10_A (CE1)', label: 'Institutrice 10_A (CE1)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice 10_B (CE1)', label: 'Institutrice 10_B (CE1)', department: 'Enseignement', level: 3 },
    { value: 'Instituteur 9A (CE2)', label: 'Instituteur 9A (CE2)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice 9_B (CE2)', label: 'Institutrice 9_B (CE2)', department: 'Enseignement', level: 3 },
    { value: 'Instituteur 8 (CM1)', label: 'Instituteur 8 (CM1)', department: 'Enseignement', level: 3 },
    { value: 'Institutrice 7 (CM2)', label: 'Institutrice 7 (CM2)', department: 'Enseignement', level: 3 },
    
    // Enseignement - Spécialisé
    { value: 'Éducatrice Spécialisée CS', label: 'Éducatrice Spécialisée CS', department: 'Enseignement', level: 3 },
    { value: 'Responsable Garderie', label: 'Responsable Garderie', department: 'Enseignement', level: 3 },
    { value: 'Professeur d\'Anglais', label: 'Professeur d\'Anglais', department: 'Enseignement', level: 3 },
    { value: 'Professeur d\'Éducation Physique', label: 'Professeur d\'Éducation Physique', department: 'Enseignement', level: 3 },
    { value: 'Professeur d\'Arts Plastiques', label: 'Professeur d\'Arts Plastiques', department: 'Enseignement', level: 3 },
    { value: 'Professeur de Musique', label: 'Professeur de Musique', department: 'Enseignement', level: 3 },
    
    // Service
    { value: 'Gardien Principal', label: 'Gardien Principal', department: 'Service', level: 4 },
    { value: 'Gardien de Nuit', label: 'Gardien de Nuit', department: 'Service', level: 4 },
    { value: 'Femme de Ménage Principal', label: 'Femme de Ménage Principal', department: 'Service', level: 4 },
    { value: 'Femme de Ménage', label: 'Femme de Ménage', department: 'Service', level: 4 },
    { value: 'Agent de Maintenance', label: 'Agent de Maintenance', department: 'Service', level: 4 },
    { value: 'Cuisinière', label: 'Cuisinière', department: 'Service', level: 4 },
    { value: 'Aide Cuisinière', label: 'Aide Cuisinière', department: 'Service', level: 4 },
    { value: 'Chauffeur', label: 'Chauffeur', department: 'Service', level: 4 }
  ];

  // Fonction pour calculer l'âge
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Fonction pour calculer l'expérience
  const calculateExperience = (entryDate: string): { years: number; months: number; text: string } => {
    if (!entryDate) return { years: 0, months: 0, text: '' };
    
    const today = new Date();
    const entry = new Date(entryDate);
    
    let years = today.getFullYear() - entry.getFullYear();
    let months = today.getMonth() - entry.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (today.getDate() < entry.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    
    // Générer le texte d'affichage
    let text = '';
    if (years > 0 && months > 0) {
      text = `${years} an${years > 1 ? 's' : ''} ${months} mois`;
    } else if (years > 0) {
      text = `${years} an${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      text = `${months} mois`;
    } else {
      text = 'Moins d\'un mois';
    }
    
    return { years: Math.max(0, years), months: Math.max(0, months), text };
  };

  // Fonction pour calculer la date de retraite
  const calculateRetirementDate = (dateOfBirth: string, contractType: string): string => {
    if (!dateOfBirth || !contractType) return '';
    
    const birthDate = new Date(dateOfBirth);
    let retirementAge = 60; // Tous à 60 ans pour l'instant
    
    // Règles de retraite selon le type de contrat (tous à 60 ans actuellement)
    switch (contractType) {
      case 'FRAM':
      case 'CDI':
      case 'CDD':
        retirementAge = 60;
        break;
      default:
        retirementAge = 60;
    }
    
    const retirementDate = new Date(birthDate);
    retirementDate.setFullYear(birthDate.getFullYear() + retirementAge);
    
    return retirementDate.toISOString().split('T')[0];
  };

  // Effet pour recalculer automatiquement les valeurs
  React.useEffect(() => {
    const age = calculateAge(formData.dateOfBirth);
    const experienceData = calculateExperience(formData.entryDate);
    const calculatedRetirementDate = calculateRetirementDate(formData.dateOfBirth, formData.contractType);
    
    // Calculs salariaux
    const salary = parseFloat(formData.salary) || 0;
    const cnaps = Math.round(salary * 0.01); // 1% salarié
    const ostie = Math.round(salary * 0.01); // 1% salarié
    const salaireImposable = salary - cnaps - ostie;
    const irsaCalculation = IRSAService.calculerIRSA(salary, cnaps);
    const salaireNet = salaireImposable - irsaCalculation.montantTotal;
    
    setCalculatedValues({
      age,
      calculatedExperience: experienceData.years,
      experienceText: experienceData.text,
      calculatedRetirementDate,
      salaireImposable,
      irsa: irsaCalculation.montantTotal,
      salaireNet
    });
    
    // Mettre à jour automatiquement l'expérience et la date de retraite dans le formulaire
    setFormData(prev => ({
      ...prev,
      experience: experienceData.years.toString(),
      retirementDate: calculatedRetirementDate
    }));
  }, [formData.dateOfBirth, formData.entryDate, formData.contractType, formData.salary]);

  // Effet pour détecter si le poste sélectionné est "Enseignant"
  React.useEffect(() => {
    const isTeacher = formData.position.toLowerCase().includes('enseignant') || 
                     formData.position.toLowerCase().includes('professeur') ||
                     formData.position.toLowerCase().includes('instituteur') ||
                     formData.position.toLowerCase().includes('institutrice');
    setIsTeacherPosition(isTeacher);
    
    // Réinitialiser la sélection d'enseignant si ce n'est plus un poste d'enseignant
    if (!isTeacher) {
      setSelectedTeacher('');
    }
  }, [formData.position]);

  // Fonction pour pré-remplir le formulaire avec les données de l'enseignant sélectionné
  const handleTeacherSelection = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    
    if (teacherId) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher) {
        console.log('🔄 Pré-remplissage avec les données de l\'enseignant:', teacher);
        
        setFormData(prev => ({
          ...prev,
          firstName: teacher.firstName || prev.firstName,
          lastName: teacher.lastName || prev.lastName,
          email: teacher.email || prev.email,
          phone: teacher.phone || prev.phone,
          dateOfBirth: teacher.dateOfBirth || prev.dateOfBirth,
          entryDate: teacher.entryDate || prev.entryDate,
          contractType: teacher.status || prev.contractType,
          // Garder le poste et département déjà sélectionnés
          // position et department restent inchangés
        }));
        
        console.log('✅ Formulaire pré-rempli avec succès');
      }
    }
  };
  // Options pour les départements
  const departmentOptions = [
    { value: 'Direction', label: 'Direction', icon: '👑' },
    { value: 'Administration', label: 'Administration', icon: '📋' },
    { value: 'Enseignement', label: 'Enseignement', icon: '🎓' },
    { value: 'Service', label: 'Service', icon: '🔧' }
  ];

  // Options pour les niveaux hiérarchiques
  const levelOptions = [
    { value: 1, label: 'Niveau 1 - Direction Générale', description: 'Directeur Général' },
    { value: 2, label: 'Niveau 2 - Direction Adjointe', description: 'Directeurs adjoints, Responsables de départements' },
    { value: 3, label: 'Niveau 3 - Personnel Qualifié', description: 'Enseignants, Comptables, Secrétaires' },
    { value: 4, label: 'Niveau 4 - Personnel de Service', description: 'Gardiens, Personnel de ménage, Assistants' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Un email valide est requis';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!formData.position) newErrors.position = 'Le poste est requis';
    if (!formData.department) newErrors.department = 'Le département est requis';
    if (!formData.salary || parseFloat(formData.salary) <= 0) newErrors.salary = 'Le salaire doit être supérieur à 0';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('🚀 Soumission du formulaire employé:', formData);
      await onSubmit(formData);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erreur lors de la soumission du formulaire' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si le poste change, mettre à jour automatiquement le département et le niveau
    if (name === 'position') {
      const selectedPosition = positionOptions.find(pos => pos.value === value);
      if (selectedPosition) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          department: selectedPosition.department,
          level: selectedPosition.level
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Filtrer les employés pour la liste des superviseurs (exclure l'employé actuel en mode édition)
  const availableSupervisors = employees.filter(emp => 
    emp.id !== initialData?.id && // Exclure l'employé actuel
    emp.level < formData.level // Un superviseur doit être d'un niveau supérieur
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Prénom *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Prénom de l'employé"
          />
          {errors.firstName && (
            <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nom *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nom de famille"
          />
          {errors.lastName && (
            <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date de naissance (optionnel)
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {calculatedValues.age > 0 && (
            <p className="text-blue-600 text-xs mt-1">
              <Calculator className="w-3 h-3 inline mr-1" />
              Âge calculé: {calculatedValues.age} ans
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="email@lespoupons.mg"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Téléphone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+261 34 12 345 67"
          />
          {errors.phone && (
            <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Poste *
          </label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.position ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner un poste</option>
            <optgroup label="Direction">
              {positionOptions.filter(pos => pos.department === 'Direction').map(pos => (
                <option key={pos.value} value={pos.value}>{pos.label}</option>
              ))}
            </optgroup>
            <optgroup label="Administration">
              {positionOptions.filter(pos => pos.department === 'Administration').map(pos => (
                <option key={pos.value} value={pos.value}>{pos.label}</option>
              ))}
            </optgroup>
            <optgroup label="Enseignement">
              {positionOptions.filter(pos => pos.department === 'Enseignement').map(pos => (
                <option key={pos.value} value={pos.value}>{pos.label}</option>
              ))}
              <option value="Enseignant">Enseignant (Sélectionner depuis la liste existante)</option>
            </optgroup>
            <optgroup label="Service">
              {positionOptions.filter(pos => pos.department === 'Service').map(pos => (
                <option key={pos.value} value={pos.value}>{pos.label}</option>
              ))}
            </optgroup>
          </select>
          {errors.position && (
            <p className="text-red-600 text-xs mt-1">{errors.position}</p>
          )}
        </div>

        {/* Sélection d'enseignant existant - Affiché uniquement si poste = Enseignant */}
        {isTeacherPosition && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Sélectionner un enseignant existant (Optionnel - pour pré-remplissage)
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => handleTeacherSelection(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
            >
              <option value="">Choisir un enseignant existant (optionnel)</option>
              {teachersLoading ? (
                <option disabled>Chargement des enseignants...</option>
              ) : (
                teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} - {teacher.subject}
                    {teacher.experience ? ` (${teacher.experience} ans d'exp.)` : ''}
                  </option>
                ))
              )}
            </select>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>💡 Note importante :</strong> Cette sélection ne fait que pré-remplir le formulaire. 
                L'employé sera créé dans <strong>Ressources Humaines</strong> et sera automatiquement disponible 
                dans le module <strong>Gestion des Salaires</strong>.
              </p>
            </div>
            {selectedTeacher && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Formulaire pré-rempli avec les données de l'enseignant sélectionné
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            Département *
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.department ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner un département</option>
            {departmentOptions.map(dept => (
              <option key={dept.value} value={dept.value}>
                {dept.icon} {dept.label}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-600 text-xs mt-1">{errors.department}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de contrat (optionnel)
          </label>
          <select
            name="contractType"
            value={formData.contractType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner un type de contrat</option>
            <option value="FRAM">FRAM - Fonctionnaire</option>
            <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
            <option value="CDD">CDD - Contrat à Durée Déterminée</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Détermine l'âge de retraite (actuellement 60 ans pour tous)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Niveau hiérarchique *
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {levelOptions.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {levelOptions.find(l => l.value === parseInt(formData.level.toString()))?.description}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Superviseur (optionnel)
          </label>
          <select
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Aucun superviseur (poste de direction)</option>
            {employeesLoading ? (
              <option disabled>Chargement des employés...</option>
            ) : (
              availableSupervisors.map(emp => (
                <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                  {emp.firstName} {emp.lastName} - {emp.position}
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Seuls les employés de niveau supérieur peuvent être superviseurs
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Salaire mensuel (Ariary) *
          </label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            min="0"
            step="1000"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.salary ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="ex: 1200000"
          />
          {errors.salary && (
            <p className="text-red-600 text-xs mt-1">{errors.salary}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date d'entrée (optionnel)
          </label>
          <input
            type="date"
            name="entryDate"
            value={formData.entryDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {calculatedValues.experienceText && (
            <p className="text-blue-600 text-xs mt-1">
              <Calculator className="w-3 h-3 inline mr-1" />
              Expérience calculée: {calculatedValues.experienceText}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Années d'expérience (calculé automatiquement)
          </label>
          <input
            type="text"
            name="experience"
            value={calculatedValues.experienceText || 'Non calculé'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Calculé automatiquement à partir de la date d'entrée
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date de retraite (calculée automatiquement)
          </label>
          <input
            type="date"
            name="retirementDate"
            value={formData.retirementDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Calculée automatiquement (60 ans pour tous les types de contrat)
          </p>
          {calculatedValues.calculatedRetirementDate && (
            <p className="text-blue-600 text-xs mt-1">
              <Calculator className="w-3 h-3 inline mr-1" />
              Retraite prévue: {new Date(calculatedValues.calculatedRetirementDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-2" />
            Statut
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      {/* Informations sur la hiérarchie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Informations hiérarchiques</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Département :</strong> {formData.department || 'Aucun'}</p>
            <p><strong>Niveau hiérarchique :</strong> {formData.level}</p>
            <p><strong>Superviseur :</strong> {formData.parentId || 'Aucun (poste de direction)'}</p>
          </div>
        </div>
        
        {/* Résumé des calculs */}
        {(calculatedValues.age > 0 || calculatedValues.experienceText || calculatedValues.calculatedRetirementDate || calculatedValues.salaireNet > 0) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Calculs automatiques (Personnel & Salaire)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm text-green-700 space-y-1">
                <h5 className="font-medium text-green-800 mb-1">Informations personnelles</h5>
                {calculatedValues.age > 0 && (
                  <p><strong>Âge actuel:</strong> {calculatedValues.age} ans</p>
                )}
                {calculatedValues.experienceText && (
                  <p><strong>Expérience:</strong> {calculatedValues.experienceText}</p>
                )}
                {calculatedValues.calculatedRetirementDate && (
                  <p><strong>Retraite prévue:</strong> {new Date(calculatedValues.calculatedRetirementDate).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
              
              {calculatedValues.salaireNet > 0 && (
                <div className="text-sm text-green-700 space-y-1">
                  <h5 className="font-medium text-green-800 mb-1">Calculs salariaux</h5>
                  <p><strong>Salaire imposable:</strong> {calculatedValues.salaireImposable.toLocaleString()} MGA</p>
                  <p><strong>IRSA (Impôt):</strong> -{calculatedValues.irsa.toLocaleString()} MGA</p>
                  <p><strong>Salaire net estimé:</strong> {calculatedValues.salaireNet.toLocaleString()} MGA</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Informations sur l'enseignant sélectionné */}
        {isTeacherPosition && selectedTeacher && (
          <div className="md:col-span-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Enseignant sélectionné
              </h4>
              {(() => {
                const teacher = teachers.find(t => t.id === selectedTeacher);
                return teacher ? (
                  <div className="text-sm text-emerald-700 space-y-1">
                    <p><strong>Nom complet:</strong> {teacher.firstName} {teacher.lastName}</p>
                    <p><strong>Matière:</strong> {teacher.subject}</p>
                    <p><strong>Expérience:</strong> {teacher.experience} ans</p>
                    <p><strong>Statut:</strong> {teacher.status}</p>
                    {teacher.email && <p><strong>Email:</strong> {teacher.email}</p>}
                    {teacher.phone && <p><strong>Téléphone:</strong> {teacher.phone}</p>}
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {initialData ? 'Modification...' : 'Ajout...'}
            </div>
          ) : (
            initialData ? 'Modifier l\'Employé' : 'Ajouter l\'Employé'
          )}
        </button>
      </div>
    </form>
  );
}