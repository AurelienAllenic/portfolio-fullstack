const PRODUCTION_API_URL = 'https://back-aurelienallenic-fr.vercel.app';

export const getApiUrl = (): string => {
  const url =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? PRODUCTION_API_URL : 'http://localhost:3000');

  return url.replace(/\/$/, '');
};
