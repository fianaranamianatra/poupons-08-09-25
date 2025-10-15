# Guide de Calcul des Salaires - Législation Malgache

## Vue d'ensemble
Ce document décrit le système de calcul automatisé des salaires selon la législation fiscale et sociale malgache en vigueur.

## Principe de Calcul

### Données d'entrée
- **Salaire de Base**: Montant mensuel brut en Ariary (Ar)

### Processus de Calcul en 3 Étapes

---

## ÉTAPE 1: Calcul des Cotisations Obligatoires

### 1.1 OSTIE (Contribution Sociale Généralisée)
**Formule**: `OSTIE = Salaire Brut × 2%`

**Exemple avec Salaire de Base: 250 000 Ar**
```
OSTIE = 250 000 × 2% = 5 000 Ar
```

### 1.2 CNAPS (Cotisation à la Caisse Nationale de Prévoyance Sociale)
**Formule**: `CNAPS = Salaire Brut × 1%`

**Exemple**:
```
CNAPS = 250 000 × 1% = 2 500 Ar
```

---

## ÉTAPE 2: Calcul du Salaire Imposable (IRSA)

**Formule de Base**:
```
Salaire imposable = Salaire Brut - CNAPS salariale
```

**Minimum de Perception**: Si le résultat est inférieur à 3 000 Ar, le salaire imposable sera fixé à 3 000 Ar minimum.

### Application de la règle:
```
SI (Salaire Brut - CNAPS) < 3 000 Ar
   ALORS Salaire imposable = 3 000 Ar
   SINON Salaire imposable = Salaire Brut - CNAPS
```

**Exemple avec 250 000 Ar**:
```
Salaire imposable = 250 000 - 2 500 = 247 500 Ar
Comparaison: 247 500 Ar > 3 000 Ar ✓
Résultat: Salaire imposable = 247 500 Ar
```

---

## ÉTAPE 3: Application de l'IRSA Progressif

### Barème IRSA Madagascar

| Tranche | De (Ar) | À (Ar) | Taux |
|---------|---------|---------|------|
| 1 | 0 | 150 000 | 0% (Exonéré) |
| 2 | 150 001 | 250 000 | 5% |
| 3 | 250 001 | 400 000 | 10% |
| 4 | 400 001 | 600 000 | 15% |
| 5 | 600 001 | ∞ | 20% |

### Méthode de Calcul Progressif

L'IRSA est calculé par tranche successive. On applique le taux correspondant uniquement à la portion du salaire qui se trouve dans chaque tranche.

### Exemple Détaillé avec 247 500 Ar

**Tranche 1 (0 - 150 000 Ar) - 0%**
```
Montant dans la tranche: 150 000 Ar
Impôt: 150 000 × 0% = 0 Ar
```

**Tranche 2 (150 001 - 250 000 Ar) - 5%**
```
Montant dans la tranche: 247 500 - 150 000 = 97 500 Ar
Impôt: 97 500 × 5% = 4 875 Ar
```

**IRSA Total**:
```
IRSA = 0 + 4 875 = 4 875 Ar
Taux effectif = (4 875 / 247 500) × 100 = 1,97%
```

---

## RÉSULTAT FINAL

### Décomposition Complète pour 250 000 Ar

| Élément | Calcul | Montant |
|---------|---------|---------|
| Salaire de Base | | **250 000 Ar** |
| - OSTIE (2%) | 250 000 × 2% | -5 000 Ar |
| - CNAPS (1%) | 250 000 × 1% | -2 500 Ar |
| = Salaire Imposable | 250 000 - 2 500 | **247 500 Ar** |
| - IRSA (progressif) | Selon barème | -4 875 Ar |
| **= SALAIRE NET** | | **237 625 Ar** |

### Récapitulatif des Déductions

```
Total des déductions = OSTIE + CNAPS + IRSA
Total des déductions = 5 000 + 2 500 + 4 875 = 12 375 Ar

Taux de prélèvement global = (12 375 / 250 000) × 100 = 4,95%
```

---

## Exemples Additionnels

### Exemple 1: Salaire Faible (100 000 Ar)

```
Salaire de Base: 100 000 Ar
OSTIE (2%): 100 000 × 2% = 2 000 Ar
CNAPS (1%): 100 000 × 1% = 1 000 Ar
Salaire imposable: 100 000 - 1 000 = 99 000 Ar
Comparaison: 99 000 > 3 000 ✓
IRSA: 0 Ar (≤ 150 000 Ar, exonéré)
SALAIRE NET: 100 000 - 2 000 - 1 000 - 0 = 97 000 Ar
```

### Exemple 2: Salaire Moyen (500 000 Ar)

```
Salaire de Base: 500 000 Ar
OSTIE (2%): 500 000 × 2% = 10 000 Ar
CNAPS (1%): 500 000 × 1% = 5 000 Ar
Salaire imposable: 500 000 - 5 000 = 495 000 Ar

IRSA Progressif:
- Tranche 1 (0 - 150 000): 150 000 × 0% = 0 Ar
- Tranche 2 (150 001 - 250 000): 100 000 × 5% = 5 000 Ar
- Tranche 3 (250 001 - 400 000): 150 000 × 10% = 15 000 Ar
- Tranche 4 (400 001 - 495 000): 95 000 × 15% = 14 250 Ar
Total IRSA: 0 + 5 000 + 15 000 + 14 250 = 34 250 Ar

SALAIRE NET: 500 000 - 10 000 - 5 000 - 34 250 = 450 750 Ar
```

### Exemple 3: Salaire Élevé (1 000 000 Ar)

```
Salaire de Base: 1 000 000 Ar
OSTIE (2%): 1 000 000 × 2% = 20 000 Ar
CNAPS (1%): 1 000 000 × 1% = 10 000 Ar
Salaire imposable: 1 000 000 - 10 000 = 990 000 Ar

IRSA Progressif:
- Tranche 1 (0 - 150 000): 150 000 × 0% = 0 Ar
- Tranche 2 (150 001 - 250 000): 100 000 × 5% = 5 000 Ar
- Tranche 3 (250 001 - 400 000): 150 000 × 10% = 15 000 Ar
- Tranche 4 (400 001 - 600 000): 200 000 × 15% = 30 000 Ar
- Tranche 5 (600 001 - 990 000): 390 000 × 20% = 78 000 Ar
Total IRSA: 0 + 5 000 + 15 000 + 30 000 + 78 000 = 128 000 Ar

SALAIRE NET: 1 000 000 - 20 000 - 10 000 - 128 000 = 842 000 Ar
```

---

## Charges Patronales (Information)

Les charges patronales ne sont pas déduites du salaire de l'employé mais sont à la charge de l'employeur:

- **CNAPS Employeur**: 13% du salaire brut
- **OSTIE Employeur**: 5% du salaire brut

**Coût total pour l'employeur**:
```
Coût total = Salaire Brut + CNAPS Employeur + OSTIE Employeur
Coût total = Salaire Brut × (1 + 0,13 + 0,05)
Coût total = Salaire Brut × 1,18
```

**Exemple pour 250 000 Ar**:
```
Coût total employeur = 250 000 × 1,18 = 295 000 Ar
```

---

## Implémentation dans l'Application

Le module **Gestion des Salaires** utilise ces calculs automatiquement:

1. **Sélection de l'employé**: Récupération automatique du salaire de base depuis les RH
2. **Calcul en temps réel**: Affichage instantané de toutes les déductions
3. **Détail des tranches IRSA**: Visualisation du barème progressif appliqué
4. **Salaire net final**: Calcul précis conforme à la législation

### Fonctionnalités
- ✅ Calcul OSTIE automatique (2%)
- ✅ Calcul CNAPS automatique (1%)
- ✅ Application minimum de perception (3 000 Ar)
- ✅ Calcul IRSA progressif selon barème officiel
- ✅ Affichage des tranches fiscales applicables
- ✅ Calcul du salaire net final
- ✅ Informations sur les charges patronales

---

## Sources Légales

Ce système de calcul est basé sur:
- Code des Impôts Malgache (IRSA)
- Lois sur la Sécurité Sociale (CNAPS)
- Contribution Sociale Généralisée (OSTIE)

**Date de mise à jour**: 2025
**Base de données**: Firebase
