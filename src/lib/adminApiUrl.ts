const CONFIG_ERROR =
  'Admin API URL is not configured. Set NEXT_PUBLIC_API_URL in your environment.';

export function getAdminApiUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  return url || null;
}

export function getAdminApiConfigError(): string {
  return CONFIG_ERROR;
}
