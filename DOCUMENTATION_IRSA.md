# Module de Calcul IRSA - Madagascar

## Vue d'ensemble

Le module de calcul automatique de l'IRSA (Impôt sur les Revenus Salariaux et Assimilés) est intégré dans les modules **Gestion Salaire** et **Ressources Humaines**. Il est conforme à la réglementation fiscale malgache 2024.

## Barème IRSA Officiel Madagascar

| Tranche de Revenu Imposable | Taux | Montant Max par Tranche | Cumul |
|------------------------------|------|-------------------------|-------|
| 0 à 350 000 Ar | 0% | 0 Ar | 0 Ar |
| 350 001 à 400 000 Ar | 5% | 2 500 Ar | 2 500 Ar |
| 400 001 à 500 000 Ar | 10% | 10 000 Ar | 12 500 Ar |
| 500 001 à 600 000 Ar | 15% | 15 000 Ar | 27 500 Ar |
| Au-delà de 600 000 Ar | 20% | Variable | 27 500 + ... |

**Minimum de perception:** 3 000 Ar

---

## Processus de Calcul

### Étape 1: Calcul du Revenu Imposable

```
Revenu Imposable (RI) = Salaire Brut - OSTIE - CNaPS
RI = Salaire Brut × (1 - 0,02 - 0,01)
RI = Salaire Brut × 0,97
```

**Déductions obligatoires:**
- **OSTIE:** 2% du salaire brut (Œuvres Sociales)
- **CNaPS:** 1% du salaire brut (Caisse Nationale de Prévoyance Sociale)

### Étape 2: Calcul IRSA par Tranches Marginales

Le calcul est progressif, chaque tranche est imposée à son propre taux:

```
Tranche 1: 0 Ar (exonéré)

Tranche 2: (min(RI, 400 000) - 350 000) × 5% si RI > 350 000

Tranche 3: (min(RI, 500 000) - 400 000) × 10% si RI > 400 000

Tranche 4: (min(RI, 600 000) - 500 000) × 15% si RI > 500 000

Tranche 5: (RI - 600 000) × 20% si RI > 600 000

IRSA Total = Somme des 5 tranches
```

### Étape 3: Application du Minimum de Perception

Si l'IRSA calculé est inférieur à 3 000 Ar, le minimum de perception de 3 000 Ar est appliqué automatiquement.

```
IRSA Final = max(IRSA Calculé, 3 000 Ar)
```

### Étape 4: Calcul du Salaire Net

```
Salaire Net = Salaire Brut - OSTIE - CNaPS - IRSA
```

---

## Exemple de Validation

### Pour un salaire brut de 1 800 000 Ar:

**Étape 1: Calcul du revenu imposable**
```
Salaire brut:       1 800 000 Ar
OSTIE (2%):           -36 000 Ar
CNaPS (1%):           -18 000 Ar
─────────────────────────────────
RI:                 1 746 000 Ar
```

**Étape 2: Calcul IRSA par tranches**
```
Tranche 1 (0 - 350 000):                           0 Ar
Tranche 2 (350 001 - 400 000): 50 000 × 5%    = 2 500 Ar
Tranche 3 (400 001 - 500 000): 100 000 × 10%  = 10 000 Ar
Tranche 4 (500 001 - 600 000): 100 000 × 15%  = 15 000 Ar
Tranche 5 (600 001+): 1 146 000 × 20%         = 229 200 Ar
─────────────────────────────────────────────────────────
IRSA Total:                                      256 700 Ar
```

**Résultat final:**
```
Salaire brut:       1 800 000 Ar
Total déductions:    -310 700 Ar
─────────────────────────────────
Salaire net:        1 489 300 Ar
```

---

## Utilisation du Module

### Dans le Code TypeScript

```typescript
import { IRSAService } from './lib/services/irsaService';

// Calcul complet avec toutes les déductions
const resultat = IRSAService.calculerSalaireComplet(1800000);

console.log('Salaire brut:', resultat.salaireBrut);
console.log('OSTIE:', resultat.ostie);
console.log('CNaPS:', resultat.cnaps);
console.log('Revenu imposable:', resultat.revenuImposable);
console.log('IRSA:', resultat.irsa);
console.log('Salaire net:', resultat.salaireNet);

// Accès au détail des tranches
resultat.irsaDetail.tranches.forEach(tranche => {
  console.log(`Tranche ${tranche.min} - ${tranche.max}: ${tranche.impotTranche} Ar`);
});
```

### Dans les Composants React

```typescript
import { SalaryCalculatorMadagascar } from './components/calculators/SalaryCalculatorMadagascar';

function MaPage() {
  return <SalaryCalculatorMadagascar />;
}
```

---

## Fonctionnalités du Module

### ✅ Validation des Données
- Vérification des montants saisis
- Gestion des valeurs nulles ou négatives
- Arrondis automatiques à l'Ariary près

### ✅ Calcul Détaillé
- Affichage tranche par tranche
- Formules de calcul explicites
- Notes explicatives

### ✅ Export et Impression
- Export en format texte
- Bulletin de paie formaté
- Détails complets du calcul

### ✅ Interface Utilisateur
- Interface claire et professionnelle
- Couleurs différenciées par étape
- Affichage/masquage des détails
- Responsive design

### ✅ Minimum de Perception
- Application automatique du minimum de 3 000 Ar
- Affichage des alertes si applicable
- Traçabilité complète

---

## Structure des Données

### Interface IRSACalculation
```typescript
interface IRSACalculation {
  revenuImposable: number;
  tranches: DetailTranche[];
  irsaAvantMinimum: number;
  minimumPerception: number;
  irsaFinal: number;
  tauxEffectif: number;
  notes: string[];
}
```

### Interface CalculSalaireComplet
```typescript
interface CalculSalaireComplet {
  salaireBrut: number;
  ostie: number;
  cnaps: number;
  revenuImposable: number;
  irsa: number;
  irsaDetail: IRSACalculation;
  totalDeductions: number;
  salaireNet: number;
}
```

---

## Tests de Validation

Le module inclut une fonction de validation automatique:

```typescript
const validation = IRSAService.validerExemple();
console.log('Conforme:', validation.conforme); // true si tous les calculs sont corrects
```

### Résultats Attendus

| Salaire Brut | OSTIE | CNaPS | RI | IRSA | Salaire Net |
|--------------|-------|-------|-----|------|-------------|
| 50 000 | 1 000 | 500 | 48 500 | 3 000 | 45 500 |
| 250 000 | 5 000 | 2 500 | 242 500 | 3 000 | 239 500 |
| 500 000 | 10 000 | 5 000 | 485 000 | 11 000 | 474 000 |
| 1 000 000 | 20 000 | 10 000 | 970 000 | 101 500 | 868 500 |
| 1 800 000 | 36 000 | 18 000 | 1 746 000 | 256 700 | 1 489 300 |

---

## Conformité Légale

✅ Barème officiel Madagascar 2024  
✅ Minimum de perception: 3 000 Ar  
✅ Calcul progressif par tranches  
✅ Taux OSTIE: 2%  
✅ Taux CNaPS: 1%  
✅ Formule: RI = Salaire Brut × 0,97

---

## Maintenance et Mises à Jour

Le barème IRSA peut être mis à jour dans le fichier:
```
src/lib/services/irsaService.ts
```

Modifier la constante `BAREME` pour changer les tranches et taux.

---

## Support et Contact

Pour toute question concernant le module IRSA, consultez:
- Le code source: `src/lib/services/irsaService.ts`
- Les composants: `src/components/calculators/`
- Cette documentation: `DOCUMENTATION_IRSA.md`
