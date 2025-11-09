import { useEffect, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FormProgressData {
  form_type: 'informal' | 'formal';
  current_step: number;
  total_steps: number;
  step_name: string;
  progress_percentage: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export const useFormProgress = (formType: 'informal' | 'formal', totalSteps: number) => {
  const { user } = useAuth();
  const [sessionId] = useState(() => {
    const id = crypto.randomUUID();
    console.log('🆔 New session created:', id);
    return id;
  });

  const updateProgress = useCallback(async (
    currentStep: number,
    stepName: string,
    status: 'in_progress' | 'completed' | 'abandoned' = 'in_progress',
    phoneNumber?: string
  ) => {
    console.log('🔄 updateProgress called:', { currentStep, stepName, userId: user?.id });
    
    if (!user?.id) {
      console.error('❌ No user ID, cannot update progress');
      return;
    }

    const progressPercentage = Math.round((currentStep / totalSteps) * 100);
    const now = new Date().toISOString();

    try {
      // Get existing session to calculate time spent
      const { data: existing } = await supabase
        .from('form_progress')
        .select('created_at, phone_number')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .maybeSingle();

      const timeSpent = existing ? 
        Math.round((Date.now() - new Date(existing.created_at).getTime()) / 60000) : 0;

      // Check if this session already exists
      const { data: existingSession } = await supabase
        .from('form_progress')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .eq('session_id', sessionId)
        .maybeSingle();

      let error;
      if (existingSession) {
        // Update existing session only if it's still in progress
        if (existingSession.status === 'in_progress') {
          const { error: updateError } = await supabase
            .from('form_progress')
            .update({
              current_step: currentStep,
              total_steps: totalSteps,
              step_name: stepName,
              progress_percentage: progressPercentage,
              status,
              last_activity: now,
              phone_number: phoneNumber
            })
            .eq('id', existingSession.id);
          error = updateError;
        }
      } else {
        // Insert new session
        const { error: insertError } = await supabase
          .from('form_progress')
          .insert({
            user_id: user.id,
            form_type: formType,
            session_id: sessionId,
            current_step: currentStep,
            total_steps: totalSteps,
            step_name: stepName,
            progress_percentage: progressPercentage,
            status,
            last_activity: now,
            time_spent: 0,
            phone_number: phoneNumber,
            created_at: now
          });
        error = insertError;
      }
      
      console.log('📝 Form progress insert result:', { error: error?.message, user_id: user.id, stepName });
      
      if (error) {
        console.error('❌ Insert failed:', error);
      } else {
        console.log('✅ Progress inserted successfully');
      }

      if (error) throw error;
      
      console.log('✅ Progress updated:', { currentStep, stepName, progressPercentage });
    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  }, [user?.id, formType, totalSteps]);



  const markCompleted = useCallback(async () => {
    await updateProgress(totalSteps, 'Completed', 'completed');
  }, [updateProgress, totalSteps]);

  const markAbandoned = useCallback(async (currentStepName?: string) => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('form_progress')
        .update({ status: 'abandoned' })
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .eq('session_id', sessionId)
        .eq('status', 'in_progress');
    } catch (error) {
      console.error('Error marking form as abandoned:', error);
    }
  }, [user?.id, formType, sessionId]);



  // Auto-update activity when user interacts with form
  const trackActivity = useCallback(() => {
    if (user?.id) {
      supabase
        .from('form_progress')
        .update({ last_activity: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .eq('status', 'in_progress')
        .then(() => console.log('Activity tracked'))
        .catch(console.error);
    }
  }, [user?.id, formType]);

  return {
    updateProgress,
    markCompleted,
    markAbandoned,
    trackActivity,
    sessionId
  };
};