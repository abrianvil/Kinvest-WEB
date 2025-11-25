import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    ignores: ['eslint.config.mjs'],
  },
];

export default config;
