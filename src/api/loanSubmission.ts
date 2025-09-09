import { supabase } from '../lib/supabase';
import type { LoanFormData } from '../types';

const uploadFile = async (file: File, bucket: string, path: string) => {
  console.log('Uploading file to storage');
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  
  if (error) {
    console.error('Upload error occurred');
    throw error;
  }
  console.log('Upload successful');
  return data.path;
};

import { submitBankStatement } from './bankStatementApi';
import { submitPayslipDocument } from './payslipApi';
import { analyzeIdDocument } from './idAnalyzerApi';

export const submitLoanToSupabase = async (formData: LoanFormData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not logged in');
    }

    const userId = user.id;
    const timestamp = Date.now();
    let fileUrls: any = {};

    // Upload assets
    if (formData.homeFloorPhoto) {
      fileUrls.home_photo = await uploadFile(
        formData.homeFloorPhoto,
        'assets',
        `${userId}/home_${timestamp}.jpg`
      );
    }

    if (formData.shopPicture) {
      fileUrls.shop_photo = await uploadFile(
        formData.shopPicture,
        'assets',
        `${userId}/shop_${timestamp}.jpg`
      );
    }

    if (formData.assets?.length > 0) {
      fileUrls.assets = [];
      for (let i = 0; i < formData.assets.length; i++) {
        const path = await uploadFile(
          formData.assets[i].file,
          'assets',
          `${userId}/asset_${timestamp}_${i}.jpg`
        );
        fileUrls.assets.push(path);
      }
    }

    // Upload and process documents
    if (formData.bankStatements?.length > 0) {
      fileUrls.bank_statements = [];
      for (let i = 0; i < formData.bankStatements.length; i++) {
        const path = await uploadFile(
          formData.bankStatements[i],
          'documents',
          `${userId}/bank_${timestamp}_${i}.pdf`
        );
        fileUrls.bank_statements.push(path);
      }
    }

    if (formData.salaryPayslips?.length > 0) {
      fileUrls.payslips = [];
      for (let i = 0; i < formData.salaryPayslips.length; i++) {
        const path = await uploadFile(
          formData.salaryPayslips[i],
          'documents',
          `${userId}/payslip_${timestamp}_${i}.pdf`
        );
        fileUrls.payslips.push(path);
      }
    }

    if (formData.mpesaStatements?.length > 0) {
      fileUrls.mpesa_statements = [];
      for (let i = 0; i < formData.mpesaStatements.length; i++) {
        const path = await uploadFile(
          formData.mpesaStatements[i],
          'documents',
          `${userId}/mpesa_${timestamp}_${i}.pdf`
        );
        fileUrls.mpesa_statements.push(path);
      }
    }

    if (formData.callLogs?.length > 0) {
      fileUrls.call_logs = [];
      for (let i = 0; i < formData.callLogs.length; i++) {
        const path = await uploadFile(
          formData.callLogs[i],
          'documents',
          `${userId}/calls_${timestamp}_${i}.csv`
        );
        fileUrls.call_logs.push(path);
      }
    }

    // Insert loan application
    const { data: loanApp, error: loanError } = await supabase
      .from('loan_applications')
      .insert({
        user_id: userId,
        sector: formData.sector,
        amount_requested: formData.amountRequested,
        repayment_date: formData.repaymentDate,
        has_bank_account: formData.hasBankAccount || false,
        has_retail_business: formData.hasRetailBusiness || false,
        business_registration_number: formData.businessRegistrationNumber || null,
        business_location: formData.businessLocation || null,
        home_photo_url: fileUrls.home_photo || null,
        shop_photo_url: fileUrls.shop_photo || null,
        assets_urls: fileUrls.assets || null,
        bank_statements_urls: fileUrls.bank_statements || null,
        payslips_urls: fileUrls.payslips || null,
        mpesa_statements_urls: fileUrls.mpesa_statements || null,
        call_logs_urls: fileUrls.call_logs || null,
        status: 'pending'
      })
      .select()
      .single();

    if (loanError) {
      throw new Error(loanError.message);
    }

    // Save bank statement analysis
    if (formData.bankAnalysisResults?.length > 0) {
      for (const bankResult of formData.bankAnalysisResults) {
        if (bankResult.success && bankResult.features) {
          await supabase.from('bank_statement_analysis').insert({
            loan_id: loanApp.id,
            user_id: userId,
            opening_balance: bankResult.features.opening_balance,
            closing_balance: bankResult.features.closing_balance,
            average_balance: bankResult.features.average_balance,
            total_deposits: bankResult.features.total_deposits,
            total_withdrawals: bankResult.features.total_withdrawals,
            main_withdrawals: bankResult.features.main_withdrawals,
            bank_charges: bankResult.features.bank_charges,
            count_deposits: bankResult.features.count_deposits,
            count_withdrawals: bankResult.features.count_withdrawals,
            avg_deposit: bankResult.features.avg_deposit,
            max_deposit: bankResult.features.max_deposit,
            min_deposit: bankResult.features.min_deposit,
            std_deposit: bankResult.features.std_deposit,
            avg_withdrawal: bankResult.features.avg_withdrawal,
            max_withdrawal: bankResult.features.max_withdrawal,
            min_withdrawal: bankResult.features.min_withdrawal,
            std_withdrawal: bankResult.features.std_withdrawal,
            balance_volatility: bankResult.features.balance_volatility,
            active_days: bankResult.features.active_days,
            days_since_last_transaction: bankResult.features.days_since_last_transaction,
            closing_opening_ratio: bankResult.features.closing_opening_ratio,
            avg_closing_ratio: bankResult.features.avg_closing_ratio,
            withdrawals_opening_ratio: bankResult.features.withdrawals_opening_ratio,
            mobile_money_transfers: bankResult.features.mobile_money_transfers,
            dominant_beneficiary: bankResult.features.dominant_beneficiary,
            salary_inflow: bankResult.features.salary_inflow,
            student_status: bankResult.features.student_status,
            loan_repayments: bankResult.features.loan_repayments,
            betting_transactions: bankResult.features.betting_transactions,
            bounced_cheques: bankResult.features.bounced_cheques,
            avg_time_between_large_deposit_and_withdrawal_days: bankResult.features.avg_time_between_large_deposit_and_withdrawal_days,
            other_features: bankResult.features,
            processing_timings: bankResult.processing_timings
          });
        }
      }
    }

    // Save payslip analysis
    if (formData.payslipAnalysisResults?.length > 0) {
      for (const payslipResult of formData.payslipAnalysisResults) {
        if (payslipResult.success && payslipResult.features) {
          await supabase.from('payslip_analysis').insert({
            loan_id: loanApp.id,
            user_id: userId,
            payslipfile_id: payslipResult.payslipfile_id,
            employee_name: payslipResult.features.employee_name,
            employer_name: payslipResult.features.employer_name,
            pay_period: payslipResult.features.pay_period,
            pay_frequency: payslipResult.features.pay_frequency,
            employment_id: payslipResult.features.employment_id,
            department: payslipResult.features.department,
            position_title: payslipResult.features.position_title,
            employment_start_date: payslipResult.features.employment_start_date,
            basic_salary: payslipResult.features.basic_salary,
            gross_salary: payslipResult.features.gross_salary,
            net_salary: payslipResult.features.net_salary,
            taxes: payslipResult.features.taxes,
            pension: payslipResult.features.pension,
            health_insurance: payslipResult.features.health_insurance,
            other_deductions: payslipResult.features.other_deductions,
            allowances: payslipResult.features.allowances,
            overtime_pay: payslipResult.features.overtime_pay,
            bonuses: payslipResult.features.bonuses,
            loan_deductions: payslipResult.features.loan_deductions,
            garnishments: payslipResult.features.garnishments,
            indicators: payslipResult.features.indicators,
            currency: payslipResult.features.currency,
            notes: payslipResult.features.notes,
            storage_bucket: payslipResult.storage?.bucket,
            storage_path: payslipResult.storage?.path,
            processing_time_seconds: payslipResult.processing_time_seconds
          });
        }
      }
    }

    // Save call logs analysis
    if (formData.callLogsAnalysisResults?.length > 0) {
      for (const callResult of formData.callLogsAnalysisResults) {
        if (callResult.success && callResult.analysis) {
          await supabase.from('call_logs_analysis').insert({
            loan_id: loanApp.id,
            user_id: userId,
            call_frequency: callResult.analysis.call_frequency,
            call_duration: callResult.analysis.call_duration,
            active_behavior: callResult.analysis.active_behavior,
            stable_contacts_ratio: callResult.analysis.stable_contacts_ratio,
            night_vs_day: callResult.analysis.night_vs_day,
            missed_only: callResult.analysis.missed_only,
            regular_patterns_std: callResult.analysis.regular_patterns_std,
            geographic_pattern: callResult.analysis.geographic_pattern
          });
        }
      }
    }

    // Save M-Pesa analysis results
    if (formData.mpesaAnalysisResults?.length > 0) {
      for (const mpesaResult of formData.mpesaAnalysisResults) {
        if (mpesaResult.success) {
          await supabase.from('mpesa_analysis_results').insert({
            loan_id: loanApp.id,
            user_id: userId,
            total_transactions: mpesaResult.total_transactions,
            total_inflow: mpesaResult.total_inflow,
            total_outflow: mpesaResult.total_outflow,
            avg_balance: mpesaResult.avg_balance,
            avg_transaction_size: mpesaResult.avg_transaction_size,
            merchant_spend_total: mpesaResult.merchant_spend_total,
            analysis: mpesaResult.analysis || mpesaResult
          });
        }
      }
    }

    // Save assets analysis results
    if (formData.assetAnalysisResults) {
      const assetResult = formData.assetAnalysisResults;
      if (assetResult.batch_id && assetResult.analysis_result) {
        const creditFeatures = assetResult.analysis_result.credit_features;
        await supabase.from('assets_analysis_results').insert({
          loan_id: loanApp.id,
          user_id: userId,
          batch_id: assetResult.batch_id,
          total_asset_value: creditFeatures?.total_asset_value,
          asset_diversity_score: creditFeatures?.asset_diversity_score,
          has_transport_asset: creditFeatures?.has_transport_asset,
          has_electronics_asset: creditFeatures?.has_electronics_asset,
          has_livestock_asset: creditFeatures?.has_livestock_asset,
          has_property_asset: creditFeatures?.has_property_asset,
          has_high_value_assets: creditFeatures?.has_high_value_assets,
          high_value_asset_count: creditFeatures?.high_value_asset_count,
          average_asset_condition: creditFeatures?.average_asset_condition,
          total_images_processed: assetResult.analysis_result.total_images_processed,
          total_assets_detected: assetResult.analysis_result.total_assets_detected,
          analysis_result: assetResult.analysis_result
        });
      }
    }

    // Validate and insert guarantors to separate tables
    if (!formData.guarantors || formData.guarantors.length !== 2) {
      throw new Error('Exactly two guarantors are required');
    }

    // Insert Guarantor 1
    const guarantor1 = formData.guarantors[0];
    if (!guarantor1.contact || !guarantor1.fullName || !guarantor1.nationality || !guarantor1.idNumber) {
      throw new Error('Guarantor 1 data incomplete');
    }

    let guarantor1IdUrl = null;
    if (formData.guarantorFiles?.[0]) {
      guarantor1IdUrl = await uploadFile(
        formData.guarantorFiles[0],
        'id-documents',
        `${userId}/guarantor1_${timestamp}.jpg`
      );
    }

    await supabase.from('guarantor1').insert({
      loan_id: loanApp.id,
      full_name: guarantor1.fullName,
      nationality: guarantor1.nationality,
      id_number: guarantor1.idNumber,
      contact: guarantor1.contact,
      id_document_url: guarantor1IdUrl
    });

    // Insert Guarantor 2
    const guarantor2 = formData.guarantors[1];
    if (!guarantor2.contact || !guarantor2.fullName || !guarantor2.nationality || !guarantor2.idNumber) {
      throw new Error('Guarantor 2 data incomplete');
    }

    let guarantor2IdUrl = null;
    if (formData.guarantorFiles?.[1]) {
      guarantor2IdUrl = await uploadFile(
        formData.guarantorFiles[1],
        'id-documents',
        `${userId}/guarantor2_${timestamp}.jpg`
      );
    }

    await supabase.from('guarantor2').insert({
      loan_id: loanApp.id,
      full_name: guarantor2.fullName,
      nationality: guarantor2.nationality,
      id_number: guarantor2.idNumber,
      contact: guarantor2.contact,
      id_document_url: guarantor2IdUrl
    });

    return { id: loanApp.id, success: true };
  } catch (error) {
    throw error;
  }
};