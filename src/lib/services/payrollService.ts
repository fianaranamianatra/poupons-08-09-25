// Payroll calculation service
import { IRSAService, IRSACalculation } from './irsaService';

export interface PayrollCalculation {
  grossSalary: number;
  cnaps: {
    isActive: boolean;
    rate: {
      employee: number;
      employer: number;
    };
    employeeContribution: number;
    employerContribution: number;
    total: number;
  };
  ostie: {
    isActive: boolean;
    rate: {
      employee: number;
      employer: number;
    };
    employeeContribution: number;
    employerContribution: number;
    total: number;
  };
  irsa: {
    isActive: boolean;
    salaireImposable: number;
    calculation: IRSACalculation;
    montant: number;
  };
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  salaireImposable: number;
  netSalary: number;
  totalEmployerCost: number;
}

export interface PayrollSummary {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  calculation: PayrollCalculation;
  status: 'draft' | 'approved' | 'paid';
}

export class PayrollService {
  static async calculatePayroll(employeeId: string, grossSalary: number): Promise<PayrollCalculation> {
    // Taux officiels selon la réglementation malgache
    const cnapsSalarieRate = 1; // Part salariale CNAPS
    const cnapsEmployeurRate = 13; // Part patronale CNAPS
    const ostieRate = 2; // OSTIE (sur le salaire brut)

    // CNAPS : 1% du salaire brut (part salariale)
    const cnapsEmployeeContribution = Math.round(grossSalary * cnapsSalarieRate / 100);
    const cnapsEmployerContribution = Math.round(grossSalary * cnapsEmployeurRate / 100);

    // OSTIE : 2% du salaire brut (part salariale)
    const ostieEmployeeContribution = Math.round(grossSalary * ostieRate / 100);

    // Calcul du salaire imposable (Salaire brut - CNAPS salariale)
    // Avec minimum de perception de 3 000 Ar
    let salaireImposable = grossSalary - cnapsEmployeeContribution;
    if (salaireImposable < 3000) {
      salaireImposable = 3000;
    }

    // Calcul de l'IRSA
    const irsaCalculation = IRSAService.calculerIRSA(grossSalary, cnapsEmployeeContribution);
    console.log(`💰 IRSA calculé: ${irsaCalculation.montantTotal.toLocaleString()} MGA`);

    const totalEmployeeContributions = cnapsEmployeeContribution + ostieEmployeeContribution + irsaCalculation.montantTotal;
    const totalEmployerContributions = cnapsEmployerContribution;
    const netSalary = grossSalary - cnapsEmployeeContribution - ostieEmployeeContribution - irsaCalculation.montantTotal;
    const totalEmployerCost = grossSalary + totalEmployerContributions;

    return {
      grossSalary,
      cnaps: {
        isActive: true,
        rate: {
          employee: cnapsSalarieRate,
          employer: cnapsEmployeurRate
        },
        employeeContribution: cnapsEmployeeContribution,
        employerContribution: cnapsEmployerContribution,
        total: cnapsEmployeeContribution + cnapsEmployerContribution
      },
      ostie: {
        isActive: true,
        rate: {
          employee: ostieRate,
          employer: 0
        },
        employeeContribution: ostieEmployeeContribution,
        employerContribution: 0,
        total: ostieEmployeeContribution
      },
      irsa: {
        isActive: true,
        salaireImposable,
        calculation: irsaCalculation,
        montant: irsaCalculation.montantTotal
      },
      salaireImposable,
      totalEmployeeContributions,
      totalEmployerContributions,
      netSalary,
      totalEmployerCost
    };
  }

  static async calculateBulkPayroll(employees: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    salary: number;
  }>): Promise<PayrollSummary[]> {
    const results: PayrollSummary[] = [];
    
    for (const employee of employees) {
      const calculation = await this.calculatePayroll(employee.id, employee.salary);
      results.push({
        employeeId: employee.id,
        employeeName: employee.name,
        position: employee.position,
        department: employee.department,
        calculation,
        status: 'draft'
      });
    }
    
    return results;
  }

  static formatPayslip(summary: PayrollSummary): string {
    const date = new Date().toLocaleDateString('fr-FR');
    
    return `
ÉCOLE LES POUPONS
Bulletin de Paie - ${date}

========================================
EMPLOYÉ: ${summary.employeeName}
POSTE: ${summary.position}
DÉPARTEMENT: ${summary.department}
========================================

SALAIRE BRUT:           ${summary.calculation.grossSalary.toLocaleString()} Ar

COTISATIONS SALARIALES:
- CNAPS (${summary.calculation.cnaps.rate.employee}%):        -${summary.calculation.cnaps.employeeContribution.toLocaleString()} Ar
- OSTIE (${summary.calculation.ostie.rate.employee}%):        -${summary.calculation.ostie.employeeContribution.toLocaleString()} Ar

SALAIRE IMPOSABLE:      ${summary.calculation.salaireImposable.toLocaleString()} Ar

IMPÔTS:
- IRSA (${summary.calculation.irsa.calculation.tauxEffectif.toFixed(1)}%):         -${summary.calculation.irsa.montant.toLocaleString()} Ar
                        ─────────────────
TOTAL COTISATIONS:      -${summary.calculation.totalEmployeeContributions.toLocaleString()} Ar

SALAIRE NET:            ${summary.calculation.netSalary.toLocaleString()} Ar

========================================
CHARGES PATRONALES:
- CNAPS (${summary.calculation.cnaps.rate.employer}%):      +${summary.calculation.cnaps.employerContribution.toLocaleString()} Ar
                        ─────────────────
TOTAL CHARGES:          +${summary.calculation.totalEmployerContributions.toLocaleString()} Ar

COÛT TOTAL EMPLOYEUR:   ${summary.calculation.totalEmployerCost.toLocaleString()} Ar
========================================

Généré le ${date}
    `.trim();
  }

  static exportToCSV(bulkPayroll: PayrollSummary[]): string {
    const csvContent = [
      'Employé,Poste,Département,Salaire Brut,CNAPS Salarié,CNAPS Employeur,OSTIE Salarié,OSTIE Employeur,Salaire Imposable,IRSA,Total Déductions,Salaire Net,Coût Employeur',
      ...bulkPayroll.map(summary => [
        summary.employeeName,
        summary.position,
        summary.department,
        summary.calculation.grossSalary,
        summary.calculation.cnaps.employeeContribution,
        summary.calculation.cnaps.employerContribution,
        summary.calculation.ostie.employeeContribution,
        summary.calculation.ostie.employerContribution,
        summary.calculation.salaireImposable,
        summary.calculation.irsa.montant,
        summary.calculation.totalEmployeeContributions,
        summary.calculation.netSalary,
        summary.calculation.totalEmployerCost
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
}