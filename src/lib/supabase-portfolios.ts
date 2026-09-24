import { supabase } from '@/components/providers/app-provider';
import { PortfolioData } from '@/components/portfolio/portfolio-themes';

export const fetchPortfolio = async (userId: string) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching portfolio:', error.message || error);
    }
    return data;
  } catch (err) {
    console.warn('Network or Supabase error fetching portfolio:', err);
    return null;
  }
};

export const fetchPublicPortfolio = async (slug: string) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('data, theme')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn('Failed to fetch public portfolio:', error.message || error);
      }
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Network error or failed to fetch public portfolio:', err);
    return null;
  }
};

export const savePortfolio = async (
  userId: string,
  portfolioData: PortfolioData,
  theme: string,
  slug: string,
  isPublished: boolean
) => {
  if (!supabase) return;

  try {
    const { data: existing, error: findError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error("Error finding portfolio:", findError);
    }

    if (existing) {
      const { error } = await supabase
        .from('portfolios')
        .update({
          data: portfolioData,
          theme,
          slug,
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      if (error) {
        console.error("Supabase Update Error:", error.message || error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('portfolios')
        .insert({
          user_id: userId,
          data: portfolioData,
          theme,
          slug,
          is_published: isPublished
        });
      if (error) {
        console.error("Supabase Insert Error:", error.message || error);
        throw error;
      }
    }
  } catch (err) {
    console.error("Failed to save portfolio to Supabase:", err);
    throw err;
  }
};
