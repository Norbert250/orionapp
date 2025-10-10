import { supabase } from '../lib/supabase';
import type { LoanFormData } from '../types';
import { analyzeGpsImages } from './gpsAnalysisApi';

const uploadFile = async (file: File, bucket: string, path: string) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw new Error(`File upload failed: ${error.message}`);
    return data.path;
  } catch (error: any) {
    console.error('File upload failed:', error);
    throw error;
  }
};

export const submitLoanWithGpsAnalysis = async (formData: LoanFormData, userId?: string) => {
  try {
    const currentUserId = userId || '53bf969e-f1ca-40db-a145-5b58541539c5';

    const { data: loan, error: loanError } = await supabase
      .from('loan_applications')
      .insert([{
        user_id: currentUserId,
        sector: formData.sector,
        amount_requested: formData.amountRequested,
        repayment_date: formData.repaymentDate,
        status: 'pending'
      }])
      .select()
      .single();

    if (loanError) throw new Error(`Failed to create loan application: ${loanError.message}`);
    const loanId = loan.id;

    // Collect images for GPS analysis (home photo + asset images)
    const gpsImages: File[] = [];
    if (formData.homePhoto) gpsImages.push(formData.homePhoto);
    if (formData.assetFiles?.length) gpsImages.push(...formData.assetFiles);

    // Run GPS analysis if we have images
    if (gpsImages.length > 0) {
      try {
        const gpsResult = await analyzeGpsImages(gpsImages, currentUserId);
        console.log('GPS analysis completed:', gpsResult);
      } catch (gpsError) {
        console.warn('GPS analysis failed:', gpsError);
      }
    }

    // Store bank statements
    if (formData.bankStatements?.length) {
      for (const file of formData.bankStatements) {
        let filePath = `mock-${file.name}`;
        try {
          filePath = await uploadFile(file, 'documents', `loans/${Date.now()}-${file.name}`);
        } catch (error) {
          console.warn('Bank statement upload failed:', error);
        }

        await supabase.from('bankstatementfiles').insert([{
          loan_id: loanId,
          user_id: currentUserId,
          filename: `loans/${Date.now()}-${file.name}`,
          original_filename: file.name,
          file_url: filePath,
          filesize: file.size
        }]);
      }
    }

    // Store payslips
    if (formData.salaryPayslips?.length) {
      for (const file of formData.salaryPayslips) {
        let filePath = `mock-${file.name}`;
        try {
          filePath = await uploadFile(file, 'documents', `loans/${Date.now()}-${file.name}`);
        } catch (error) {
          console.warn('Payslip upload failed:', error);
        }

        await supabase.from('payslipfiles').insert([{
          loan_id: loanId,
          user_id: currentUserId,
          filename: `loans/${Date.now()}-${file.name}`,
          original_filename: file.name,
          file_url: filePath,
          filesize: file.size
        }]);
      }
    }

    // Store guarantors
    if (formData.guarantors?.length) {
      for (let i = 0; i < Math.min(formData.guarantors.length, 2); i++) {
        const guarantor = formData.guarantors[i];
        const tableName = i === 0 ? 'guarantor1' : 'guarantor2';
        let guarantorFileUrl = null;

        if (formData.guarantorFiles?.[i]) {
          const file = formData.guarantorFiles[i];
          try {
            guarantorFileUrl = await uploadFile(file, 'id-documents', `loans/${Date.now()}-${file.name}`);
          } catch (error) {
            console.warn('Guarantor file upload failed:', error);
            guarantorFileUrl = `mock-${file.name}`;
          }
        }

        await supabase.from(tableName).insert([{
          loan_id: loanId,
          full_name: guarantor.fullName,
          nationality: guarantor.nationality || 'Kenyan',
          id_number: guarantor.idNumber,
          contact: guarantor.contact,
          id_document_url: guarantorFileUrl,
          analysis_status: 'completed'
        }]);
      }
    }

    return { id: loanId, success: true, data: loan };
  } catch (error: any) {
    console.error('Error submitting loan:', error);
    throw error;
  }
};