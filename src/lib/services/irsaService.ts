/**
 * Service de calcul IRSA (Impôt sur les Revenus Salariaux et Assimilés)
 * Conforme à la réglementation fiscale malgache
 *
 * BARÈME OFFICIEL MADAGASCAR:
 * - 0 à 350 000 Ar: 0%
 * - 350 001 à 400 000 Ar: 5%
 * - 400 001 à 500 000 Ar: 10%
 * - 500 001 à 600 000 Ar: 15%
 * - Au-delà de 600 000 Ar: 20%
 *
 * MINIMUM DE PERCEPTION: 3 000 Ar
 */

export interface TrancheFiscale {
  min: number;
  max: number | null;
  taux: number;
  description: string;
  montantMaxTranche: number;
  cumulPrecedent: number;
}

export interface DetailTranche {
  min: number;
  max: number;
  taux: number;
  montantDansTranche: number;
  impotTranche: number;
  formule: string;
}

export interface IRSACalculation {
  revenuImposable: number;
  tranches: DetailTranche[];
  irsaAvantMinimum: number;
  minimumPerception: number;
  irsaFinal: number;
  tauxEffectif: number;
  notes: string[];
}

export interface CalculSalaireComplet {
  salaireBrut: number;
  ostie: number;
  cnaps: number;
  revenuImposable: number;
  irsa: number;
  irsaDetail: IRSACalculation;
  totalDeductions: number;
  salaireNet: number;
}

export class IRSAService {
  /**
   * BARÈME IRSA OFFICIEL - MADAGASCAR 2024
   * Tranches progressives conformes à la législation fiscale
   */
  private static readonly BAREME: TrancheFiscale[] = [
    {
      min: 0,
      max: 350000,
      taux: 0,
      description: "0 à 350 000 Ar - Exonéré",
      montantMaxTranche: 0,
      cumulPrecedent: 0
    },
    {
      min: 350001,
      max: 400000,
      taux: 5,
      description: "350 001 à 400 000 Ar - 5%",
      montantMaxTranche: 2500,
      cumulPrecedent: 0
    },
    {
      min: 400001,
      max: 500000,
      taux: 10,
      description: "400 001 à 500 000 Ar - 10%",
      montantMaxTranche: 10000,
      cumulPrecedent: 2500
    },
    {
      min: 500001,
      max: 600000,
      taux: 15,
      description: "500 001 à 600 000 Ar - 15%",
      montantMaxTranche: 15000,
      cumulPrecedent: 12500
    },
    {
      min: 600001,
      max: null,
      taux: 20,
      description: "Au-delà de 600 000 Ar - 20%",
      montantMaxTranche: 0,
      cumulPrecedent: 27500
    }
  ];

  private static readonly MINIMUM_PERCEPTION = 3000;
  private static readonly TAUX_OSTIE = 0.02;
  private static readonly TAUX_CNAPS = 0.01;

  /**
   * Calcule le revenu imposable
   * Formule: Revenu Imposable = Salaire Brut - OSTIE - CNaPS
   *         RI = Salaire Brut × 0,97
   */
  static calculerRevenuImposable(salaireBrut: number): number {
    const ostie = Math.round(salaireBrut * this.TAUX_OSTIE);
    const cnaps = Math.round(salaireBrut * this.TAUX_CNAPS);
    return salaireBrut - ostie - cnaps;
  }

  /**
   * Calcule l'IRSA selon le barème progressif par tranches
   * Méthode A: Calcul par tranches marginales
   */
  static calculerIRSA(revenuImposable: number): IRSACalculation {
    const notes: string[] = [];
    const tranches: DetailTranche[] = [];
    let irsaTotal = 0;

    if (revenuImposable <= 0) {
      return {
        revenuImposable: 0,
        tranches: [],
        irsaAvantMinimum: 0,
        minimumPerception: this.MINIMUM_PERCEPTION,
        irsaFinal: this.MINIMUM_PERCEPTION,
        tauxEffectif: 0,
        notes: ["Revenu imposable nul, application du minimum de perception"]
      };
    }

    notes.push(`Revenu imposable: ${revenuImposable.toLocaleString()} Ar`);

    for (const tranche of this.BAREME) {
      if (revenuImposable <= tranche.min) {
        continue;
      }

      const maxTranche = tranche.max || Infinity;
      const montantDansTranche = Math.min(
        revenuImposable - tranche.min,
        maxTranche - tranche.min
      );

      if (montantDansTranche <= 0) {
        continue;
      }

      const impotTranche = Math.round((montantDansTranche * tranche.taux) / 100);
      irsaTotal += impotTranche;

      const maxDisplay = tranche.max || revenuImposable;
      const formule = `(${Math.min(revenuImposable, maxDisplay).toLocaleString()} - ${tranche.min.toLocaleString()}) × ${tranche.taux}%`;

      tranches.push({
        min: tranche.min,
        max: maxDisplay,
        taux: tranche.taux,
        montantDansTranche,
        impotTranche,
        formule
      });

      if (impotTranche > 0) {
        notes.push(
          `Tranche ${tranche.min.toLocaleString()} - ${maxDisplay.toLocaleString()}: ` +
          `${montantDansTranche.toLocaleString()} Ar × ${tranche.taux}% = ${impotTranche.toLocaleString()} Ar`
        );
      }
    }

    const irsaAvantMinimum = irsaTotal;
    notes.push(`IRSA calculé: ${irsaAvantMinimum.toLocaleString()} Ar`);

    let irsaFinal = irsaAvantMinimum;
    if (irsaAvantMinimum < this.MINIMUM_PERCEPTION) {
      irsaFinal = this.MINIMUM_PERCEPTION;
      notes.push(
        `⚠️ IRSA (${irsaAvantMinimum.toLocaleString()} Ar) < Minimum (${this.MINIMUM_PERCEPTION.toLocaleString()} Ar)`,
        `→ Application du minimum de perception: ${this.MINIMUM_PERCEPTION.toLocaleString()} Ar`
      );
    }

    const tauxEffectif = revenuImposable > 0 ? (irsaFinal / revenuImposable) * 100 : 0;

    return {
      revenuImposable,
      tranches,
      irsaAvantMinimum,
      minimumPerception: this.MINIMUM_PERCEPTION,
      irsaFinal,
      tauxEffectif: Math.round(tauxEffectif * 100) / 100,
      notes
    };
  }

  /**
   * Calcule le salaire complet avec toutes les déductions
   * Processus complet conforme aux spécifications:
   *
   * ÉTAPE 1: Calcul des cotisations
   *   - OSTIE = 2% du salaire brut
   *   - CNaPS = 1% du salaire brut
   *
   * ÉTAPE 2: Calcul du revenu imposable
   *   - RI = Salaire Brut - OSTIE - CNaPS
   *   - RI = Salaire Brut × 0,97
   *
   * ÉTAPE 3: Calcul de l'IRSA par tranches progressives
   *   - Application du barème officiel
   *   - Minimum de perception: 3 000 Ar
   *
   * ÉTAPE 4: Calcul du salaire net
   *   - Salaire Net = Salaire Brut - OSTIE - CNaPS - IRSA
   */
  static calculerSalaireComplet(salaireBrut: number): CalculSalaireComplet {
    if (salaireBrut <= 0) {
      return {
        salaireBrut: 0,
        ostie: 0,
        cnaps: 0,
        revenuImposable: 0,
        irsa: 0,
        irsaDetail: this.calculerIRSA(0),
        totalDeductions: 0,
        salaireNet: 0
      };
    }

    const ostie = Math.round(salaireBrut * this.TAUX_OSTIE);
    const cnaps = Math.round(salaireBrut * this.TAUX_CNAPS);
    const revenuImposable = salaireBrut - ostie - cnaps;
    const irsaDetail = this.calculerIRSA(revenuImposable);
    const irsa = irsaDetail.irsaFinal;
    const totalDeductions = ostie + cnaps + irsa;
    const salaireNet = salaireBrut - totalDeductions;

    return {
      salaireBrut,
      ostie,
      cnaps,
      revenuImposable,
      irsa,
      irsaDetail,
      totalDeductions,
      salaireNet
    };
  }

  /**
   * Obtient le barème IRSA officiel
   */
  static getBareme(): TrancheFiscale[] {
    return [...this.BAREME];
  }

  /**
   * Obtient le minimum de perception
   */
  static getMinimumPerception(): number {
    return this.MINIMUM_PERCEPTION;
  }

  /**
   * Valide un exemple de calcul (pour tests)
   * Exemple du cahier des charges: Salaire brut 1 800 000 Ar
   */
  static validerExemple(): {
    salaireBrut: number;
    ostie: number;
    cnaps: number;
    revenuImposable: number;
    detailTranches: string[];
    irsaTotal: number;
    salaireNet: number;
    conforme: boolean;
  } {
    const salaireBrut = 1800000;
    const resultat = this.calculerSalaireComplet(salaireBrut);

    const detailTranches = [
      `Tranche 1 (0 - 350 000): 0 Ar`,
      `Tranche 2 (350 001 - 400 000): (400 000 - 350 000) × 5% = 2 500 Ar`,
      `Tranche 3 (400 001 - 500 000): (500 000 - 400 000) × 10% = 10 000 Ar`,
      `Tranche 4 (500 001 - 600 000): (600 000 - 500 000) × 15% = 15 000 Ar`,
      `Tranche 5 (600 001+): (1 746 000 - 600 000) × 20% = 229 200 Ar`
    ];

    const attendu = {
      ostie: 36000,
      cnaps: 18000,
      revenuImposable: 1746000,
      irsa: 256700,
      salaireNet: 1489300
    };

    const conforme =
      resultat.ostie === attendu.ostie &&
      resultat.cnaps === attendu.cnaps &&
      resultat.revenuImposable === attendu.revenuImposable &&
      resultat.irsa === attendu.irsa &&
      resultat.salaireNet === attendu.salaireNet;

    return {
      salaireBrut,
      ostie: resultat.ostie,
      cnaps: resultat.cnaps,
      revenuImposable: resultat.revenuImposable,
      detailTranches,
      irsaTotal: resultat.irsa,
      salaireNet: resultat.salaireNet,
      conforme
    };
  }

  /**
   * Formule simplifiée par palier (Méthode B)
   * Pour vérification et calculs rapides
   */
  static calculerIRSAFormuleSimplifiee(revenuImposable: number): number {
    if (revenuImposable <= 350000) {
      return 0;
    } else if (revenuImposable <= 400000) {
      return Math.round((revenuImposable - 350000) * 0.05);
    } else if (revenuImposable <= 500000) {
      return Math.round(2500 + (revenuImposable - 400000) * 0.10);
    } else if (revenuImposable <= 600000) {
      return Math.round(12500 + (revenuImposable - 500000) * 0.15);
    } else {
      return Math.round(27500 + (revenuImposable - 600000) * 0.20);
    }
  }

  /**
   * Formate le calcul pour affichage ou export
   */
  static formaterCalcul(calcul: CalculSalaireComplet): string {
    let output = "═══════════════════════════════════════════════════\n";
    output += "   BULLETIN DE CALCUL DE SALAIRE - MADAGASCAR\n";
    output += "═══════════════════════════════════════════════════\n\n";

    output += "SALAIRE BRUT\n";
    output += `  ${calcul.salaireBrut.toLocaleString()} Ar\n\n`;

    output += "DÉDUCTIONS OBLIGATOIRES\n";
    output += `  OSTIE (2%)      -${calcul.ostie.toLocaleString()} Ar\n`;
    output += `  CNaPS (1%)      -${calcul.cnaps.toLocaleString()} Ar\n`;
    output += `                  ─────────────────\n`;
    output += `  Revenu imposable: ${calcul.revenuImposable.toLocaleString()} Ar\n\n`;

    output += "CALCUL IRSA (Barème progressif)\n";
    calcul.irsaDetail.tranches.forEach((tranche, index) => {
      if (tranche.impotTranche > 0) {
        output += `  Tranche ${index + 1}: ${tranche.formule} = ${tranche.impotTranche.toLocaleString()} Ar\n`;
      }
    });
    output += `                  ─────────────────\n`;
    output += `  IRSA calculé    -${calcul.irsaDetail.irsaAvantMinimum.toLocaleString()} Ar\n`;

    if (calcul.irsaDetail.irsaFinal > calcul.irsaDetail.irsaAvantMinimum) {
      output += `  Minimum appliqué -${calcul.irsaDetail.irsaFinal.toLocaleString()} Ar\n`;
    }

    output += `\n`;
    output += `TOTAL DÉDUCTIONS  -${calcul.totalDeductions.toLocaleString()} Ar\n\n`;
    output += "═══════════════════════════════════════════════════\n";
    output += `SALAIRE NET À PAYER: ${calcul.salaireNet.toLocaleString()} Ar\n`;
    output += "═══════════════════════════════════════════════════\n";

    return output;
  }
}
