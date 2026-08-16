import { supabase } from '@/components/providers/app-provider';
import { PortfolioData } from '@/components/portfolio/portfolio-themes';

export const fetchPortfolio = async (userId: string) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
};

export const fetchPublicPortfolio = async (slug: string) => {
  // We use createBrowserClient in app-provider, so this can be used client side
  // Alternatively we can fetch without auth for public view
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('portfolios')
    .select('data, theme')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const savePortfolio = async (
  userId: string,
  portfolioData: PortfolioData,
  theme: string,
  slug: string,
  isPublished: boolean
) => {
  if (!supabase) return;
  
  const { data: existing } = await supabase
    .from('portfolios')
    .select('id')
    .eq('user_id', userId)
    .single();

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
    if (error) throw error;
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
    if (error) throw error;
  }
};
