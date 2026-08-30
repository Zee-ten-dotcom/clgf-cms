export function validateEnv(
  config: Record<string, unknown>,
) {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  for (const key of required) {
    const value = config[key];

    if (
      typeof value !== 'string' ||
      value.trim().length === 0
    ) {
      throw new Error(
        `${key} environment variable is required`,
      );
    }
  }

  const portValue = config.PORT ?? '3000';
  const port = Number(portValue);

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      'PORT must be a valid TCP port number',
    );
  }

  return {
    ...config,
    PORT: String(port),
  };
}
