export interface Guarantor {
  fullName: string;
  nationality: string;
  idNumber: string;
  passportNumber?: string;
  contact: string;
}

export interface Asset {
  file: File;
  value?: number;
  requiresLicense?: boolean;
  license?: File;
}

export interface LoanFormData {
  sector: "formal" | "informal";
  amountRequested: number;
  repaymentDate: string;

  hasBankAccount: boolean;
  bankStatements?: File[];
  bankStatementPassword?: string;    // 🔑 shared password

  hasRetailBusiness: boolean;
  businessRegistrationNumber?: string;
  businessLocation?: string;

  guarantors: Guarantor[];
  assets: Asset[];

  homeFloorPhoto?: File;             // optional, single file
  proofOfIllness?: File;             // optional
  shopPicture?: File;

  mpesaStatements: File[];
  mpesaStatementPassword?: string;   // 🔑 shared password

  callLogs: File[];

  salaryPayslips?: File[];
  payslipPasswords?: string[];       // ✅ per-file passwords

  // 🔹 Analysis results from APIs
  bankAnalysisResults?: any[];
  payslipAnalysisResults?: any[];
  callLogsAnalysisResults?: any[];
  mpesaAnalysisResults?: any[];
  guarantorAnalysisResults?: any[];
  guarantorFiles?: File[];
  callLogsAnalysis?: any;
  mpesaAnalysis?: any;
  imagesAnalysis?: any;
  assetAnalysisResults?: {
    batch_id: string;
    total_value: number;
    status: string;
    files: number;
    shopAnalysis?: {
      batch_id: string;
      total_value: number;
      status: string;
      files: number;
    };
  };
}

export interface Loan {
  id: string;
  principal: number;
  interest: number;
  dueDate: string;
  status: 'active' | 'completed' | 'pending' | 'overdue';
  sector: 'formal' | 'informal';
  createdAt: string;
}


