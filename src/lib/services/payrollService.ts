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
    const cnapsSalarieRate = 1.8; // Part salariale CNAPS
    const cnapsEmployeurRate = 8.2; // Part patronale CNAPS
    const ostieRate = 1.5; // OSTIE (sur le salaire brut)

    // CNAPS : 10% du salaire brut (1,8% salarié + 8,2% employeur)
    const cnapsEmployeeContribution = Math.round(grossSalary * cnapsSalarieRate / 100);
    const cnapsEmployerContribution = Math.round(grossSalary * cnapsEmployeurRate / 100);

    // OSTIE : 1,5% du salaire brut
    const ostieContribution = Math.round(grossSalary * ostieRate / 100);

    // Calcul du salaire imposable (Salaire brut - CNAPS salariale)
    const salaireImposable = grossSalary - cnapsEmployeeContribution;

    // Calcul de l'IRSA
    const irsaCalculation = IRSAService.calculerIRSA(salaireImposable);
    console.log(`💰 IRSA calculé: ${irsaCalculation.montantTotal.toLocaleString()} MGA`);

    const totalEmployeeContributions = cnapsEmployeeContribution + irsaCalculation.montantTotal;
    const totalEmployerContributions = cnapsEmployerContribution + ostieContribution;
    const netSalary = grossSalary - cnapsEmployeeContribution - irsaCalculation.montantTotal;
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
          employee: 0, // OSTIE n'est pas une charge salariale
          employer: ostieRate
        },
        employeeContribution: 0,
        employerContribution: ostieContribution,
        total: ostieContribution
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

SALAIRE IMPOSABLE:      ${summary.calculation.salaireImposable.toLocaleString()} Ar

IMPÔTS:
- IRSA (${summary.calculation.irsa.calculation.tauxEffectif.toFixed(1)}%):         -${summary.calculation.irsa.montant.toLocaleString()} Ar
                        ─────────────────
TOTAL COTISATIONS:      -${summary.calculation.totalEmployeeContributions.toLocaleString()} Ar

SALAIRE NET:            ${summary.calculation.netSalary.toLocaleString()} Ar

========================================
CHARGES PATRONALES:
- CNAPS (${summary.calculation.cnaps.rate.employer}%):       +${summary.calculation.cnaps.employerContribution.toLocaleString()} Ar
- OSTIE (${summary.calculation.ostie.rate.employer}%):        +${summary.calculation.ostie.employerContribution.toLocaleString()} Ar
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