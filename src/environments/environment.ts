// Production environment - uses environment variables from hosting platform
export const environment = {
  production: true,
  supabaseUrl: process.env['supabaseUrl'] ?? '',
  supabaseKey: process.env['supabaseKey'] ?? '',
};
