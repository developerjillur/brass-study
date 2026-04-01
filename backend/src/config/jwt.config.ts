export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'brass-study-jwt-secret-change-in-production-2026',
  signOptions: {
    expiresIn: '30m', // HIPAA 30-minute session timeout
  },
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'brass-study-refresh-secret-change-in-production-2026',
  refreshExpiresIn: '7d',
};
