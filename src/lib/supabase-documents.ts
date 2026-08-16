import { supabase } from '@/components/providers/app-provider';
import { ResumeData } from '@/components/resume/resume-templates';

export const fetchResume = async (userId: string): Promise<ResumeData | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'Resume')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  if (data && data.metadata) {
    return data.metadata as unknown as ResumeData;
  }
  
  return null;
};

export const saveResume = async (userId: string, resumeData: ResumeData) => {
  if (!supabase) return;
  
  // Try to find existing
  const { data: existing } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'Resume')
    .single();

  if (existing) {
    const { error } = await supabase
      .from('documents')
      .update({
        title: 'My Resume',
        metadata: resumeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        type: 'Resume',
        title: 'My Resume',
        metadata: resumeData
      });
    if (error) throw error;
  }
};
