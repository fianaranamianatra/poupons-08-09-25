// Service de calcul IRSA (Impôt sur les Revenus Salariaux et Assimilés)
// Selon la réglementation fiscale malgache en vigueur

export interface IRSACalculation {
  salaireImposable: number;
  tranches: Array<{
    min: number;
    max: number;
    taux: number;
    montantTranche: number;
    impotTranche: number;
  }>;
  montantTotal: number;
  tauxEffectif: number;
}

export interface IRSABareme {
  tranches: Array<{
    min: number;
    max: number | null; // null pour la dernière tranche (illimitée)
    taux: number;
    description: string;
  }>;
  abattementBase: number;
  minimumPerception: number;
  isActive: boolean;
}

export class IRSAService {
  // Barème IRSA Madagascar - Tranches progressives
  private static readonly BAREME_IRSA: IRSABareme = {
    tranches: [
      { min: 0, max: 150000, taux: 0, description: "Exonéré" },
      { min: 150001, max: 250000, taux: 5, description: "5%" },
      { min: 250001, max: 400000, taux: 10, description: "10%" },
      { min: 400001, max: 600000, taux: 15, description: "15%" },
      { min: 600001, max: null, taux: 20, description: "20%" }
    ],
    abattementBase: 0,
    minimumPerception: 3000, // Minimum de perception IRSA
    isActive: true
  };

  /**
   * Calcule l'IRSA selon le barème progressif malgache
   * Applique le minimum de perception de 3 000 Ar
   * @param salaireBrut Salaire brut
   * @param cnaps CNAPS salariale
   * @returns Calcul détaillé de l'IRSA
   */
  static calculerIRSA(salaireBrut: number, cnaps: number): IRSACalculation {
    console.log(`🧮 Calcul IRSA - Salaire brut: ${salaireBrut.toLocaleString()} Ar, CNAPS: ${cnaps.toLocaleString()} Ar`);

    // Étape 1: Calcul du salaire imposable
    let salaireImposable = salaireBrut - cnaps;

    // Application du minimum de perception
    if (salaireImposable < this.BAREME_IRSA.minimumPerception) {
      salaireImposable = this.BAREME_IRSA.minimumPerception;
      console.log(`📌 Application du minimum de perception: ${this.BAREME_IRSA.minimumPerception.toLocaleString()} Ar`);
    }

    console.log(`💰 Salaire imposable final: ${salaireImposable.toLocaleString()} Ar`);

    if (salaireImposable <= 0) {
      return {
        salaireImposable: 0,
        tranches: [],
        montantTotal: 0,
        tauxEffectif: 0
      };
    }

    const tranches = [];
    let montantTotal = 0;
    let salaireRestant = salaireImposable;

    // Parcourir chaque tranche du barème
    for (const tranche of this.BAREME_IRSA.tranches) {
      if (salaireRestant <= 0) break;

      const montantTranche = this.calculerMontantTranche(salaireImposable, tranche);
      const impotTranche = Math.round(montantTranche * tranche.taux / 100);

      if (montantTranche > 0) {
        tranches.push({
          min: tranche.min,
          max: tranche.max || salaireImposable,
          taux: tranche.taux,
          montantTranche,
          impotTranche
        });

        montantTotal += impotTranche;
        salaireRestant -= montantTranche;
      }
    }

    const tauxEffectif = salaireImposable > 0 ? (montantTotal / salaireImposable) * 100 : 0;

    console.log(`✅ IRSA calculé: ${montantTotal.toLocaleString()} Ar (taux effectif: ${tauxEffectif.toFixed(2)}%)`);

    return {
      salaireImposable,
      tranches,
      montantTotal: Math.round(montantTotal),
      tauxEffectif: Math.round(tauxEffectif * 100) / 100
    };
  }

  /**
   * Calcule le montant imposable dans une tranche donnée
   */
  private static calculerMontantTranche(salaireImposable: number, tranche: any): number {
    const minTranche = tranche.min;
    const maxTranche = tranche.max;

    // Le salaire n'atteint pas cette tranche
    if (salaireImposable < minTranche) {
      return 0;
    }

    // Dernière tranche (illimitée)
    if (maxTranche === null) {
      return Math.max(0, salaireImposable - minTranche + 1);
    }

    // Le salaire dépasse cette tranche
    if (salaireImposable > maxTranche) {
      return maxTranche - minTranche + 1;
    }

    // Le salaire est dans cette tranche
    return salaireImposable - minTranche + 1;
  }

  /**
   * Obtient le barème IRSA actuel
   */
  static getBareme(): IRSABareme {
    return this.BAREME_IRSA;
  }

  /**
   * Formate l'affichage du calcul IRSA
   */
  static formaterCalcul(calculation: IRSACalculation): string {
    let result = `Calcul IRSA détaillé:\n`;
    result += `Salaire imposable: ${calculation.salaireImposable.toLocaleString()} MGA\n\n`;

    calculation.tranches.forEach((tranche, index) => {
      const maxDisplay = tranche.max === calculation.salaireImposable ? '∞' : tranche.max.toLocaleString();
      result += `Tranche ${index + 1}: ${tranche.min.toLocaleString()} - ${maxDisplay} MGA (${tranche.taux}%)\n`;
      result += `  Montant dans la tranche: ${tranche.montantTranche.toLocaleString()} MGA\n`;
      result += `  Impôt: ${tranche.impotTranche.toLocaleString()} MGA\n\n`;
    });

    result += `IRSA Total: ${calculation.montantTotal.toLocaleString()} MGA\n`;
    result += `Taux effectif: ${calculation.tauxEffectif}%`;

    return result;
  }

  /**
   * Valide si un montant est soumis à l'IRSA
   */
  static estSoumisIRSA(salaireImposable: number): boolean {
    return salaireImposable > 150000; // Seuil d'exonération
  }

  /**
   * Calcule le salaire complet avec toutes les cotisations et impôts
   * Étape 1: OSTIE (2% du salaire brut)
   * Étape 2: CNAPS (1% du salaire brut)
   * Étape 3: Salaire imposable = Salaire Brut - CNAPS (avec minimum de perception)
   * Étape 4: IRSA progressif
   * @param salaireBrut Salaire de base
   * @returns Calcul complet avec toutes les déductions
   */
  static calculerSalaireComplet(salaireBrut: number): {
    salaireBrut: number;
    ostie: number;
    cnaps: number;
    salaireImposable: number;
    irsa: number;
    irsaDetail: IRSACalculation;
    totalDeductions: number;
    salaireNet: number;
  } {
    console.log(`\n💼 === CALCUL COMPLET DU SALAIRE ===`);
    console.log(`📊 Salaire de Base: ${salaireBrut.toLocaleString()} Ar`);

    // ÉTAPE 1: Calcul OSTIE (2%)
    const ostie = Math.round(salaireBrut * 0.02);
    console.log(`\n🔵 OSTIE (2%): ${ostie.toLocaleString()} Ar`);

    // ÉTAPE 2: Calcul CNAPS (1%)
    const cnaps = Math.round(salaireBrut * 0.01);
    console.log(`🔵 CNAPS (1%): ${cnaps.toLocaleString()} Ar`);

    // ÉTAPE 3: Calcul du salaire imposable
    let salaireImposableBase = salaireBrut - cnaps;
    const salaireImposable = Math.max(salaireImposableBase, this.BAREME_IRSA.minimumPerception);
    console.log(`\n💰 Salaire imposable: ${salaireImposable.toLocaleString()} Ar`);
    if (salaireImposableBase < this.BAREME_IRSA.minimumPerception) {
      console.log(`   (Minimum de perception appliqué: ${this.BAREME_IRSA.minimumPerception.toLocaleString()} Ar)`);
    }

    // ÉTAPE 4: Calcul IRSA progressif
    const irsaDetail = this.calculerIRSA(salaireBrut, cnaps);
    console.log(`\n🔴 IRSA: ${irsaDetail.montantTotal.toLocaleString()} Ar`);
    console.log(`   Taux effectif: ${irsaDetail.tauxEffectif.toFixed(2)}%`);

    // RÉSULTAT FINAL
    const totalDeductions = ostie + cnaps + irsaDetail.montantTotal;
    const salaireNet = salaireBrut - totalDeductions;

    console.log(`\n✅ === RÉSULTAT FINAL ===`);
    console.log(`Total déductions: ${totalDeductions.toLocaleString()} Ar`);
    console.log(`Salaire NET: ${salaireNet.toLocaleString()} Ar`);
    console.log(`Taux de prélèvement: ${((totalDeductions / salaireBrut) * 100).toFixed(2)}%\n`);

    return {
      salaireBrut,
      ostie,
      cnaps,
      salaireImposable,
      irsa: irsaDetail.montantTotal,
      irsaDetail,
      totalDeductions,
      salaireNet
    };
  }
}