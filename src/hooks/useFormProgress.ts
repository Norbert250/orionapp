import { useEffect, useCallback } from 'react';
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

  const updateProgress = useCallback(async (
    currentStep: number,
    stepName: string,
    status: 'in_progress' | 'completed' | 'abandoned' = 'in_progress',
    phoneNumber?: string
  ) => {
    if (!user?.id) return;

    const progressPercentage = Math.round((currentStep / totalSteps) * 100);

    try {
      // Try to update existing record first
      const { data: existing } = await supabase
        .from('form_progress')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .single();

      const progressData = {
        user_id: user.id,
        form_type: formType,
        current_step: currentStep,
        total_steps: totalSteps,
        step_name: stepName,
        progress_percentage: progressPercentage,
        status,
        last_activity: new Date().toISOString(),
        time_spent: existing ? 
          Math.round((Date.now() - new Date(existing.created_at).getTime()) / 60000) : 0,
        phone_number: phoneNumber || existing?.phone_number
      };

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('form_progress')
          .update(progressData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Create new record for new session
        const { error } = await supabase
          .from('form_progress')
          .insert({
            ...progressData,
            created_at: new Date().toISOString()
          });
        if (error) throw error;
      }
      
      console.log('✅ Progress updated successfully:', { 
        userId: user.id, 
        formType, 
        currentStep, 
        stepName, 
        progressPercentage,
        status 
      });
    } catch (error) {
      console.error('❌ Error updating form progress:', error);
      console.error('Error details:', error.message);
      // Silently fail - progress tracking shouldn't break the form
    }
  }, [user?.id, formType, totalSteps]);

  // Send heartbeat every 30 seconds when form is active
  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (user?.id) {
        supabase
          .from('form_progress')
          .update({ last_activity: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('form_type', formType)
          .eq('status', 'in_progress')
          .then(() => console.log('Heartbeat sent'))
          .catch(console.error);
      }
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [user?.id, formType]);

  const markCompleted = useCallback(async () => {
    await updateProgress(totalSteps, 'Completed', 'completed');
  }, [updateProgress, totalSteps]);

  const markAbandoned = useCallback(async (currentStepName?: string) => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('form_progress')
        .update({ 
          status: 'abandoned',
          abandoned_at: new Date().toISOString(),
          abandoned_at_step: currentStepName || 'Unknown',
          last_activity: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .eq('status', 'in_progress');
    } catch (error) {
      console.error('Error marking form as abandoned:', error);
    }
  }, [user?.id, formType]);

  // Track when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Mark as abandoned when browser closes
      if (user?.id) {
        navigator.sendBeacon(
          `${supabase.supabaseUrl}/rest/v1/form_progress?user_id=eq.${user.id}&form_type=eq.${formType}`,
          JSON.stringify({ status: 'abandoned' })
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && user?.id) {
        // Get current step name from latest progress
        supabase
          .from('form_progress')
          .select('step_name')
          .eq('user_id', user.id)
          .eq('form_type', formType)
          .eq('status', 'in_progress')
          .single()
          .then(({ data }) => {
            // Mark as abandoned with current step info
            return supabase
              .from('form_progress')
              .update({ 
                status: 'abandoned',
                abandoned_at: new Date().toISOString(),
                abandoned_at_step: data?.step_name || 'Unknown',
                last_activity: new Date().toISOString() 
              })
              .eq('user_id', user.id)
              .eq('form_type', formType)
              .eq('status', 'in_progress');
          })
          .then(() => console.log('Form marked as abandoned'))
          .catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, formType, supabase.supabaseUrl]);

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
    trackActivity
  };
};