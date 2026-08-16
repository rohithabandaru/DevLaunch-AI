console.log('Available process.env keys:');
console.log(Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('STRIPE') || k.includes('OPENAI') || k.includes('POSTGRES') || k.includes('DB')));
