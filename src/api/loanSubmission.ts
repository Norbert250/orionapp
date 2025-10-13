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

    // Store call logs
    if (formData.callLogs?.length) {
      for (const file of formData.callLogs) {
        let filePath = `mock-${file.name}`;
        try {
          filePath = await uploadFile(file, 'documents', `loans/${Date.now()}-${file.name}`);
        } catch (error) {
          console.warn('Call logs upload failed:', error);
        }

        const { error } = await supabase.from('calllogfiles').insert([{
          loan_id: loanId,
          user_id: '12345678-1234-1234-1234-123456789012',
          filename: `loans/${Date.now()}-${file.name}`,
          file_url: filePath
        }]);
        
        if (error && !error.message.includes('duplicate')) {
          console.warn('Call logs file insert error:', error);
        }
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

    // Store API analysis results in corresponding tables
    await storeAnalysisResults(loanId, finalUserId, formData);

    return { id: loanId, success: true, data: loan };
  } catch (error: any) {
    console.error('Error submitting loan:', error);
    throw error;
  }
};

// Function to store all API analysis results
const storeAnalysisResults = async (loanId: string, userId: string, formData: LoanFormData) => {
  try {
    // Store bank statement analysis
    if (formData.bankAnalysisResults?.length) {
      for (const result of formData.bankAnalysisResults) {
        const features = result.credit_score_ready_values?.features || result.features || {};
        const timings = result.credit_score_ready_values?.timings || result.timings || {};
        await supabase.from('bank_statement_analysis').insert([{
          loan_id: loanId,
          user_id: null,
          opening_balance: features.opening_balance || 0,
          closing_balance: features.closing_balance || 0,
          average_balance: features.average_balance || 0,
          total_deposits: features.total_deposits || 0,
          total_withdrawals: features.total_withdrawals || 0,
          main_withdrawals: features.main_withdrawals || 0,
          bank_charges: features.bank_charges || 0,
          count_deposits: features.count_deposits || 0,
          count_withdrawals: features.count_withdrawals || 0,
          avg_deposit: features.avg_deposit || 0,
          max_deposit: features.max_deposit || 0,
          min_deposit: features.min_deposit || 0,
          std_deposit: features.std_deposit || 0,
          avg_withdrawal: features.avg_withdrawal || 0,
          max_withdrawal: features.max_withdrawal || 0,
          min_withdrawal: features.min_withdrawal || 0,
          std_withdrawal: features.std_withdrawal || 0,
          balance_volatility: features.balance_volatility || 0,
          active_days: features.active_days || 0,
          days_since_last_transaction: features.days_since_last_transaction || 0,
          closing_opening_ratio: features.closing_opening_ratio || 0,
          avg_closing_ratio: features.avg_closing_ratio || 0,
          withdrawals_opening_ratio: features.withdrawals_opening_ratio || 0,
          mobile_money_transfers: features.mobile_money_transfers || 0,
          dominant_beneficiary: features.dominant_beneficiary || null,
          salary_inflow: features.salary_inflow || false,
          student_status: features.student_status || false,
          loan_repayments: features.loan_repayments || false,
          betting_transactions: features.betting_transactions || false,
          bounced_cheques: features.bounced_cheques || false,
          avg_time_between_large_deposit_and_withdrawal_days: features.avg_time_between_large_deposit_and_withdrawal_days || 0,
          other_features: features.other_features || {},
          processing_timings: timings,
          credit_score: result.score?.bank_statement_credit_score || result.score?.credit_score || 0
        }]);
      }
    }

    // Store call logs analysis
    if (formData.callLogsAnalysisResults?.length) {
      for (const result of formData.callLogsAnalysisResults) {
        const details = result.details || {};
        const awarded = result.awarded || {};
        const { error } = await supabase.from('call_logs_analysis').insert([{
          loan_id: loanId,
          user_id: null,
          call_frequency: details.calls_per_day || 0,
          call_duration: details.avg_duration || 0,
          active_behavior: details.daytime_share || 0,
          stable_contacts_ratio: details.stable_contact_ratio || 0,
          night_vs_day: details.night_share || 0,
          missed_only: details.missed_ratio || 0,
          regular_patterns_std: awarded.regular_consistent || 0,
          geographic_pattern: awarded.weekday_consistent || 0,
          total_calls: details.total_real || 0,
          unique_contacts: details.distinct_weekdays || 0,
          credit_score: result.score || 0
        }]);
        if (error && !error.message.includes('duplicate')) {
          console.warn('Call logs analysis insert error:', error);
        }
      }
    }

    // Store payslip analysis
    if (formData.payslipAnalysisResults?.length) {
      for (const result of formData.payslipAnalysisResults) {
        const features = result.features || result;
        await supabase.from('payslip_analysis').insert([{
          loan_id: loanId,
          user_id: null,
          employee_name: features.employee_name || null,
          employer_name: features.employer_name || null,
          pay_period: features.pay_period || null,
          pay_frequency: features.pay_frequency || null,
          employment_id: features.employment_id || null,
          department: features.department || null,
          position_title: features.position_title || null,
          employment_start_date: features.employment_start_date || null,
          basic_salary: features.basic_salary || 0,
          gross_salary: features.gross_salary || 0,
          net_salary: features.net_salary || 0,
          taxes: features.taxes || 0,
          pension: features.pension || 0,
          health_insurance: features.health_insurance || 0,
          other_deductions: features.other_deductions || 0,
          allowances: features.allowances || 0,
          overtime_pay: features.overtime_pay || 0,
          bonuses: features.bonuses || 0,
          loan_deductions: features.loan_deductions || 0,
          garnishments: features.garnishments || 0,
          indicators: features.indicators || {},
          currency: features.currency || 'KES',
          notes: features.notes || null,
          processing_time_seconds: result.processing_time_seconds || 0,
          credit_score: result.credit_score || 0
        }]);
      }
    }

    // Store M-Pesa analysis
    if (formData.mpesaAnalysisResults?.length) {
      for (const result of formData.mpesaAnalysisResults) {
        const { error } = await supabase.from('mpesa_analysis_results').insert([{
          loan_id: loanId,
          user_id: null,
          total_transactions: result.total_transactions || 0,
          total_inflow: result.total_inflow || 0,
          total_outflow: result.total_outflow || 0,
          avg_balance: result.avg_balance || 0,
          avg_transaction_size: result.avg_transaction_size || 0,
          merchant_spend_total: result.merchant_spend_total || 0,
          analysis: result.analysis || {}
        }]);
        if (error && !error.message.includes('duplicate')) {
          console.warn('M-Pesa analysis insert error:', error);
        }
      }
    }

    // Store assets analysis
    if (formData.assetAnalysisResults) {
      const creditFeatures = formData.assetAnalysisResults.analysis_result?.credit_features || {};
      const { error } = await supabase.from('assets_analysis_results').insert([{
        loan_id: loanId,
        user_id: null,
        batch_id: formData.assetAnalysisResults.batch_id || 'batch-' + Date.now(),
        total_asset_value: creditFeatures.total_asset_value || 0,
        asset_diversity_score: creditFeatures.asset_diversity_score || 0,
        has_transport_asset: creditFeatures.has_transport_asset || false,
        has_electronics_asset: creditFeatures.has_electronics_asset || false,
        has_livestock_asset: creditFeatures.has_livestock_asset || false,
        has_property_asset: creditFeatures.has_property_asset || false,
        has_high_value_assets: creditFeatures.has_high_value_assets || false,
        high_value_asset_count: creditFeatures.high_value_asset_count || 0,
        average_asset_condition: creditFeatures.average_asset_condition || 0,
        total_images_processed: formData.assetAnalysisResults.total_files || 0,
        total_assets_detected: formData.assetAnalysisResults.analysis_result?.total_assets_detected || 0,
        analysis_result: formData.assetAnalysisResults
      }]);
      if (error && !error.message.includes('duplicate')) {
        console.warn('Assets analysis insert error:', error);
      }
    }

    // Store GPS analysis
    if (formData.gpsAnalysisResults) {
      const { error } = await supabase.from('gps_analysis_results').insert([{
        loan_id: loanId,
        user_id: null,
        credit_score: formData.gpsAnalysisResults.score || 0,
        analysis_result: formData.gpsAnalysisResults
      }]);
      if (error && !error.message.includes('duplicate')) {
        console.warn('GPS analysis insert error:', error);
      }
    }

  } catch (error) {
    console.error('Error storing analysis results:', error);
    // Don't throw error to avoid breaking loan submission
  }
};