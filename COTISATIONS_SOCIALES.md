# Système de Calcul des Cotisations Sociales

## Règles de Calcul

### 1. CNAPS (Caisse Nationale de Prévoyance Sociale)
- **Part salariale** : 1,8% du salaire brut
- **Part patronale** : 8,2% du salaire brut
- **Total CNAPS** : 10% du salaire brut

### 2. OSTIE (Organisme Sanitaire Tananarivien Inter-Entreprises)
- **Cotisation patronale uniquement** : 1,5% du salaire brut
- OSTIE n'est **PAS** une déduction sur le salaire de l'employé

### 3. IRSA (Impôt sur les Revenus Salariaux et Assimilés)

#### Base de calcul
- **Salaire imposable** = Salaire brut - CNAPS salariale (1,8%)

#### Barème progressif par tranches

| Tranche | De (Ar) | À (Ar) | Taux |
|---------|---------|--------|------|
| 1 | 0 | 150 000 | 0% |
| 2 | 150 001 | 250 000 | 5% |
| 3 | 250 001 | 400 000 | 10% |
| 4 | 400 001 | 600 000 | 15% |
| 5 | 600 001 | ∞ | 20% |

## Exemple de Calcul

### Salaire brut : 1 000 000 Ar

1. **CNAPS salariale** : 1 000 000 × 1,8% = **18 000 Ar**
2. **Salaire imposable** : 1 000 000 - 18 000 = **982 000 Ar**
3. **Calcul IRSA** :
   - Tranche 1 (0 - 150 000) : 150 000 × 0% = 0 Ar
   - Tranche 2 (150 001 - 250 000) : 100 000 × 5% = 5 000 Ar
   - Tranche 3 (250 001 - 400 000) : 150 000 × 10% = 15 000 Ar
   - Tranche 4 (400 001 - 600 000) : 200 000 × 15% = 30 000 Ar
   - Tranche 5 (600 001 - 982 000) : 382 000 × 20% = 76 400 Ar
   - **IRSA total** : 5 000 + 15 000 + 30 000 + 76 400 = **126 400 Ar**
4. **Salaire net** : 1 000 000 - 18 000 - 126 400 = **855 600 Ar**

### Charges patronales
- **CNAPS patronale** : 1 000 000 × 8,2% = **82 000 Ar**
- **OSTIE** : 1 000 000 × 1,5% = **15 000 Ar**
- **Total charges patronales** : 82 000 + 15 000 = **97 000 Ar**
- **Coût total employeur** : 1 000 000 + 97 000 = **1 097 000 Ar**

## Fichiers Modifiés

### Services
- `src/lib/services/irsaService.ts` - Mise à jour du barème IRSA et des seuils
- `src/lib/services/payrollService.ts` - Mise à jour des taux CNAPS et OSTIE

### Composants
- `src/components/forms/SalaryCalculationForm.tsx` - Mise à jour de l'interface de calcul
- `src/components/IRSABaremeDisplay.tsx` - Mise à jour de l'affichage du barème

### Composants (dossier legacy)
- `components/forms/SalaryCalculationForm.tsx` - Synchronisé avec la version src/
