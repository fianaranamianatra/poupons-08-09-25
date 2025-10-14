# Système de Calcul des Cotisations Sociales

## Règles de Calcul

### 1. OSTIE (Contribution Sociale Généralisée)
- **Part salariale uniquement** : 2% du salaire brut
- Formule : OSTIE = Salaire Brut × 2%

### 2. CNAPS (Caisse Nationale de Prévoyance Sociale)
- **Part salariale** : 1% du salaire brut
- **Part patronale** : 13% du salaire brut
- Formule : CNAPS = Salaire Brut × 1%

### 3. IRSA (Impôt sur les Revenus Salariaux et Assimilés)

#### Base de calcul
- **Salaire imposable** = Salaire brut - CNAPS salariale (1%)
- **Minimum de perception** : Si (Salaire Brut - CNAPS) < 3 000 Ar, alors Salaire imposable = 3 000 Ar

#### Barème progressif par tranches

| Tranche | De (Ar) | À (Ar) | Taux |
|---------|---------|--------|------|
| 1 | 0 | 150 000 | 0% |
| 2 | 150 001 | 250 000 | 5% |
| 3 | 250 001 | 400 000 | 10% |
| 4 | 400 001 | 600 000 | 15% |
| 5 | 600 001 | ∞ | 20% |

## Exemple de Calcul 1 : Salaire Brut = 250 000 Ar

1. **OSTIE (2%)** : 250 000 × 2% = **5 000 Ar**
2. **CNAPS salariale (1%)** : 250 000 × 1% = **2 500 Ar**
3. **Salaire imposable** : 250 000 - 2 500 = 247 500 Ar
   - Comparaison : 247 500 Ar > 3 000 Ar ✓
   - Salaire imposable = **247 500 Ar**
4. **Calcul IRSA** :
   - Tranche 1 (0 - 150 000) : 150 000 × 0% = 0 Ar
   - Tranche 2 (150 001 - 247 500) : 97 500 × 5% = 4 875 Ar
   - **IRSA total** : **4 875 Ar**
5. **Salaire net** : 250 000 - 5 000 - 2 500 - 4 875 = **237 625 Ar**

### Charges patronales
- **CNAPS patronale (13%)** : 250 000 × 13% = **32 500 Ar**
- **Coût total employeur** : 250 000 + 32 500 = **282 500 Ar**

## Exemple de Calcul 2 : Salaire Brut = 1 000 000 Ar

1. **OSTIE (2%)** : 1 000 000 × 2% = **20 000 Ar**
2. **CNAPS salariale (1%)** : 1 000 000 × 1% = **10 000 Ar**
3. **Salaire imposable** : 1 000 000 - 10 000 = **990 000 Ar**
4. **Calcul IRSA** :
   - Tranche 1 (0 - 150 000) : 150 000 × 0% = 0 Ar
   - Tranche 2 (150 001 - 250 000) : 100 000 × 5% = 5 000 Ar
   - Tranche 3 (250 001 - 400 000) : 150 000 × 10% = 15 000 Ar
   - Tranche 4 (400 001 - 600 000) : 200 000 × 15% = 30 000 Ar
   - Tranche 5 (600 001 - 990 000) : 390 000 × 20% = 78 000 Ar
   - **IRSA total** : 5 000 + 15 000 + 30 000 + 78 000 = **128 000 Ar**
5. **Salaire net** : 1 000 000 - 20 000 - 10 000 - 128 000 = **842 000 Ar**

### Charges patronales
- **CNAPS patronale (13%)** : 1 000 000 × 13% = **130 000 Ar**
- **Coût total employeur** : 1 000 000 + 130 000 = **1 130 000 Ar**

## Résumé des Déductions

### Déductions Salariales (prélevées sur le salaire)
1. OSTIE : 2% du salaire brut
2. CNAPS : 1% du salaire brut
3. IRSA : Calculé sur le salaire imposable selon barème progressif

### Charges Patronales (payées par l'employeur)
1. CNAPS : 13% du salaire brut

## Fichiers Modifiés

### Services
- `src/lib/services/irsaService.ts` - Barème IRSA progressif
- `src/lib/services/payrollService.ts` - Taux CNAPS 1%, OSTIE 2%, minimum de perception 3 000 Ar
