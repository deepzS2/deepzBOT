module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@config': './src/config',
          '@models': './src/models',
          '@commands': './src/commands',
          '@reactions': './src/reactions',
          '@database': './src/database',
          '@assets': './src/assets',
        },
      },
    ],
  ],
  ignore: ['**/tests/*.spec.ts'],
}