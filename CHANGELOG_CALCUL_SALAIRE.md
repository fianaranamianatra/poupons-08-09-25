# Changelog - Refonte Complète du Système de Calcul des Salaires

**Date**: 15 Octobre 2025
**Version**: 2.0
**Base de données**: Firebase

---

## Vue d'ensemble

Refonte complète des modules "Gestion des Salaires" et "Gestion des Employés" pour intégrer les nouveaux calculs de cotisations et impôts malgaches conformément aux spécifications de la législation fiscale en vigueur.

---

## Modifications Majeures

### 1. Service IRSA (`src/lib/services/irsaService.ts`)

#### Changements Principaux:

**Ancien système:**
- Calcul IRSA basique sans minimum de perception
- Pas de distinction claire entre les étapes
- Barème incomplet

**Nouveau système:**
```typescript
// Nouvelle méthode calculerSalaireComplet()
static calculerSalaireComplet(salaireBrut: number): {
  salaireBrut: number;
  ostie: number;        // 2% du salaire brut
  cnaps: number;        // 1% du salaire brut
  salaireImposable: number;  // Avec minimum de perception 3 000 Ar
  irsa: number;         // IRSA progressif
  irsaDetail: IRSACalculation;
  totalDeductions: number;
  salaireNet: number;
}
```

#### Nouveaux Calculs:

**ÉTAPE 1: Cotisations Obligatoires**
- OSTIE: 2% du salaire brut (au lieu de charge patronale)
- CNAPS: 1% du salaire brut (au lieu de 1,8%)

**ÉTAPE 2: Salaire Imposable**
```typescript
Salaire imposable = Salaire Brut - CNAPS
SI (Salaire Brut - CNAPS) < 3 000 Ar
  ALORS Salaire imposable = 3 000 Ar (minimum de perception)
```

**ÉTAPE 3: IRSA Progressif**
```
Barème officiel Madagascar:
- 0 - 150 000 Ar: 0% (Exonéré)
- 150 001 - 250 000 Ar: 5%
- 250 001 - 400 000 Ar: 10%
- 400 001 - 600 000 Ar: 15%
- Au-delà de 600 000 Ar: 20%
```

---

### 2. Formulaire de Calcul (`src/components/forms/SalaryCalculationForm.tsx`)

#### Améliorations:

1. **Calcul en Temps Réel Amélioré**
   - Affichage détaillé des 3 étapes
   - Logs console détaillés pour debug
   - Vérification du minimum de perception

2. **Interface Utilisateur Enrichie**
   - Étapes clairement séparées avec badges colorés
   - Affichage du détail des tranches IRSA applicables
   - Indicateurs visuels pour minimum de perception
   - Résumé complet avant validation

3. **Nouvelles Sections**
   ```tsx
   // ÉTAPE 1: Cotisations (Orange)
   - OSTIE (2%)
   - CNAPS (1%)

   // ÉTAPE 2: Salaire Imposable (Violet)
   - Formule affichée
   - Application minimum de perception
   - Vérification visuelle

   // ÉTAPE 3: IRSA Progressif (Rouge)
   - Barème complet affiché
   - Tranches applicables en temps réel
   - Calcul détaillé
   ```

4. **Charges Patronales Informatives**
   - CNAPS Employeur: 13% (au lieu de 8,2%)
   - OSTIE Employeur: 5% (au lieu de 1,5%)
   - Coût total employeur calculé

---

### 3. Gestion des Employés (`src/pages/HumanResources.tsx`)

#### Refonte de la Section Salariale:

**Avant:**
- Calcul simplifié et inexact
- CNAPS à 13% (confusion avec charge patronale)
- OSTIE à 5% (confusion avec charge patronale)
- IRSA basique

**Après:**
```tsx
Nouvelle présentation en 3 étapes:

1. ÉTAPE 1 (Badge Orange): Cotisations Obligatoires
   - OSTIE (2%): Formule + Calcul
   - CNAPS (1%): Formule + Calcul

2. ÉTAPE 2 (Badge Violet): Salaire Imposable
   - Formule détaillée
   - Calcul avec vérification
   - Application automatique minimum 3 000 Ar
   - Indicateurs visuels (⚠️ ou ✓)

3. ÉTAPE 3 (Badge Rouge): IRSA Progressif
   - Barème complet affiché
   - Calcul par tranches
   - Résultat détaillé

RÉSULTAT FINAL (Vert):
   - Grande carte avec salaire net
   - Formule claire
   - Mise en valeur visuelle
```

---

## Nouveaux Fichiers Créés

### 1. Guide Complet (`GUIDE_CALCUL_SALAIRE_MADAGASCAR.md`)
Contenu:
- Vue d'ensemble du système
- Explication détaillée des 3 étapes
- Formules mathématiques complètes
- 4 exemples de calcul complets:
  - 100 000 Ar (Salaire faible)
  - 250 000 Ar (Exemple de référence)
  - 500 000 Ar (Salaire moyen)
  - 1 000 000 Ar (Salaire élevé)
- Section charges patronales
- Références légales

### 2. Calculateur Interactif (`src/components/calculators/SalaryCalculatorMadagascar.tsx`)
Fonctionnalités:
- Saisie interactive du salaire
- Affichage temps réel des 3 étapes
- Barème IRSA visualisé
- Détail des tranches avec option afficher/masquer
- Analyse complète (taux de prélèvement, taux effectif)
- Section charges patronales
- Design moderne avec dégradés de couleurs

---

## Exemple de Calcul - Référence 250 000 Ar

### Données d'entrée:
```
Salaire de Base: 250 000 Ar
```

### ÉTAPE 1: Cotisations Obligatoires
```
OSTIE = 250 000 × 2% = 5 000 Ar
CNAPS = 250 000 × 1% = 2 500 Ar
```

### ÉTAPE 2: Salaire Imposable
```
Salaire imposable = 250 000 - 2 500 = 247 500 Ar
Vérification: 247 500 Ar > 3 000 Ar ✓
Salaire imposable = 247 500 Ar
```

### ÉTAPE 3: IRSA Progressif
```
Tranche 1 (0 - 150 000): 150 000 × 0% = 0 Ar
Tranche 2 (150 001 - 247 500): 97 500 × 5% = 4 875 Ar
IRSA Total = 4 875 Ar
Taux effectif = 1,97%
```

### RÉSULTAT FINAL:
```
Salaire Brut:        250 000 Ar
- OSTIE:              -5 000 Ar
- CNAPS:              -2 500 Ar
- IRSA:               -4 875 Ar
= Total déductions:  -12 375 Ar
= SALAIRE NET:       237 625 Ar

Taux de prélèvement: 4,95%
```

---

## Charges Patronales (Non déduites du salaire)

```
Pour un salaire brut de 250 000 Ar:

CNAPS Employeur (13%): 32 500 Ar
OSTIE Employeur (5%):  12 500 Ar
Total charges:         45 000 Ar

Coût total employeur: 250 000 + 45 000 = 295 000 Ar
```

---

## Conformité Légale

### Références:
- **OSTIE**: 2% salaire brut (cotisation salariale)
- **CNAPS**: 1% salaire brut (cotisation salariale)
- **Minimum de perception IRSA**: 3 000 Ar
- **Barème IRSA**: Tranches progressives officielles Madagascar
- **CNAPS Employeur**: 13% (charge patronale)
- **OSTIE Employeur**: 5% (charge patronale)

---

## Migration depuis l'Ancien Système

### Pour les Utilisateurs:

1. **Recalcul Automatique**
   - Tous les nouveaux calculs utilisent le nouveau système
   - Anciens calculs conservés pour historique

2. **Différences Attendues**
   - OSTIE: Maintenant déduit (2%)
   - CNAPS: Réduit de 1,8% à 1%
   - IRSA: Calcul plus précis avec minimum de perception
   - Salaire net: Peut différer légèrement

3. **Vérification Recommandée**
   - Comparer quelques calculs avec l'ancien système
   - Valider les montants avec votre comptable
   - Utiliser le calculateur interactif pour tester

---

## Tests Recommandés

### Cas de Test:

1. **Salaire Minimum (< 3 000 Ar)**
   - Vérifier application minimum de perception

2. **Salaire dans Tranche Exonérée (≤ 150 000 Ar)**
   - IRSA doit être 0

3. **Salaire dans Tranche 2 (150 001 - 250 000 Ar)**
   - Vérifier calcul IRSA 5%

4. **Salaire Multi-Tranches (> 250 000 Ar)**
   - Vérifier calcul progressif correct

5. **Salaire Élevé (> 600 000 Ar)**
   - Vérifier application tranche 20%

---

## Logs et Debugging

Le nouveau système inclut des logs console détaillés:

```typescript
console.log(`
🧮 === NOUVEAU CALCUL DE SALAIRE ===
📊 Salaire de Base: 250 000 Ar
🔵 OSTIE (2%): 5 000 Ar
🔵 CNAPS (1%): 2 500 Ar
💰 Salaire imposable: 247 500 Ar
🔴 IRSA: 4 875 Ar
✅ Salaire NET: 237 625 Ar
Taux de prélèvement: 4.95%
`);
```

---

## Support Technique

Pour toute question ou problème:
1. Consulter le `GUIDE_CALCUL_SALAIRE_MADAGASCAR.md`
2. Utiliser le calculateur interactif pour vérifier
3. Vérifier les logs console pour les détails des calculs
4. Contacter l'équipe de développement

---

## Prochaines Évolutions

### Futures améliorations prévues:
- [ ] Export PDF des bulletins de paie
- [ ] Historique des changements de barème
- [ ] Simulation annuelle
- [ ] Graphiques d'évolution des déductions
- [ ] Comparateur multi-salaires
- [ ] API pour intégration externe

---

**Développé avec ❤️ pour Madagascar**
