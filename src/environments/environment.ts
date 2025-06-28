// Production environment - values will be replaced during build
// DO NOT commit actual keys to version control
export const environment = {
  production: true,
  supabaseUrl: '${SUPABASE_URL}',
  supabaseKey: '${SUPABASE_KEY}',
};
