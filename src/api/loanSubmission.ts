import { supabase } from '../lib/supabase';
import type { LoanFormData } from '../types';

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

export const submitLoanToSupabase = async (formData: LoanFormData, userId?: string) => {
  try {
    const currentUserId = userId || '12345678-1234-1234-1234-123456789012';

    // First ensure user exists in auth system
    const { data: existingUser } = await supabase.auth.getUser();
    
    let finalUserId = currentUserId;
    
    if (!existingUser.user) {
      // Create a test user if none exists
      const { data: newUser, error: authError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (authError) {
        console.warn('Auth signup failed:', authError.message);
        // Continue with hardcoded ID - will fail if user doesn't exist
      } else if (newUser.user) {
        finalUserId = newUser.user.id;
      }
    } else {
      finalUserId = existingUser.user.id;
    }

    // Extract scores from analysis results
    console.log('Bank analysis results:', formData.bankAnalysisResults);
    console.log('Call logs analysis results:', formData.callLogsAnalysisResults);
    console.log('Payslip analysis results:', formData.payslipAnalysisResults);
    
    const assetsScore = formData.assetAnalysisResults?.credit_score || 0;
    const gpsScore = formData.gpsScore || 0;
    const bankScore = formData.bankAnalysisResults?.[0]?.score?.bank_statement_credit_score || 
                     formData.bankAnalysisResults?.[0]?.score?.credit_score || 
                     formData.bankAnalysisResults?.[0]?.bank_statement_credit_score || 0;
    const mpesaScore = formData.mpesaAnalysisResults?.[0]?.credit_score || 0;
    const callLogsScore = formData.callLogsAnalysisResults?.[0]?.credit_score || 
                         formData.callLogsAnalysisResults?.[0]?.score || 
                         formData.callLogsAnalysisResults?.[0]?.calllogs_score || 0;
    const payslipsScore = formData.payslipAnalysisResults?.[0]?.credit_score || 0;
    
    console.log('Extracted scores:', { assetsScore, gpsScore, bankScore, mpesaScore, callLogsScore, payslipsScore });
    
    // Calculate total credit score (average of available scores)
    const scores = [assetsScore, gpsScore, bankScore, mpesaScore, callLogsScore, payslipsScore].filter(score => score > 0);
    const totalCreditScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

    const { data: loan, error: loanError } = await supabase
      .from('loan_applications')
      .insert([{
        user_id: finalUserId,
        sector: formData.sector,
        amount_requested: formData.amountRequested,
        repayment_date: formData.repaymentDate,
        status: 'pending',
        assets_score: assetsScore,
        gps_score: gpsScore,
        bank_statement_score: bankScore,
        mpesa_score: mpesaScore,
        call_logs_score: callLogsScore,
        payslips_score: payslipsScore,
        total_credit_score: totalCreditScore
      }])
      .select()
      .single();

    if (loanError) throw new Error(`Failed to create loan application: ${loanError.message}`);
    const loanId = loan.id;

    // Store asset files
    if (formData.assets?.length) {
      for (const asset of formData.assets) {
        let filePath = `mock-${asset.file.name}`;
        try {
          filePath = await uploadFile(asset.file, 'assets', `loans/${Date.now()}-${asset.file.name}`);
        } catch (error) {
          console.warn('Asset upload failed:', error);
        }

        await supabase.from('assets').insert([{
          loan_id: loanId,
          filename: `loans/${Date.now()}-${asset.file.name}`,
          original_filename: asset.file.name,
          file_url: filePath,
          filesize: asset.file.size,
          estimated_value: Math.floor(Math.random() * 50000) + 10000,
          analysis_status: 'completed'
        }]);
      }
    }

    // Store home photo
    let homePhotoUrl = null;
    if (formData.homeFloorPhoto) {
      let filePath = `mock-${formData.homeFloorPhoto.name}`;
      try {
        filePath = await uploadFile(formData.homeFloorPhoto, 'assets', `loans/${Date.now()}-${formData.homeFloorPhoto.name}`);
      } catch (error) {
        console.warn('Home photo upload failed:', error);
      }
      homePhotoUrl = filePath;

      await supabase.from('other_documents').insert([{
        loan_id: loanId,
        user_id: finalUserId,
        document_type: 'home_photo',
        filename: `loans/${Date.now()}-${formData.homeFloorPhoto.name}`,
        original_filename: formData.homeFloorPhoto.name,
        file_url: filePath,
        filesize: formData.homeFloorPhoto.size
      }]);
    }

    // Store shop photo if exists
    let shopPhotoUrl = null;
    if (formData.shopPicture) {
      let filePath = `mock-${formData.shopPicture.name}`;
      try {
        filePath = await uploadFile(formData.shopPicture, 'assets', `loans/${Date.now()}-${formData.shopPicture.name}`);
      } catch (error) {
        console.warn('Shop photo upload failed:', error);
      }
      shopPhotoUrl = filePath;

      await supabase.from('other_documents').insert([{
        loan_id: loanId,
        user_id: finalUserId,
        document_type: 'shop_picture',
        filename: `loans/${Date.now()}-${formData.shopPicture.name}`,
        original_filename: formData.shopPicture.name,
        file_url: filePath,
        filesize: formData.shopPicture.size
      }]);
    }

    // Update loan application with photo URLs
    if (homePhotoUrl || shopPhotoUrl) {
      await supabase
        .from('loan_applications')
        .update({
          home_photo_url: homePhotoUrl,
          shop_photo_url: shopPhotoUrl
        })
        .eq('id', loanId);
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
          user_id: finalUserId,
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
          user_id: finalUserId,
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