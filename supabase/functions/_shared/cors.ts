/**
 * CORS configuration for Supabase functions
 * @see https://supabase.com/docs/guides/functions/cors
 */
export const functionCORS = {
    origin: [
        'https://project-flight-tracking.vercel.app',
        'https://project-flight-tracking-*-arrow-air.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Authorization', 'apikey', 'Content-Type', 'x-client-info'],
      exposeHeaders: ['Content-Length', 'X-JSON', 'X-Total-Count'],
      maxAge: 600,
      credentials: true,
}