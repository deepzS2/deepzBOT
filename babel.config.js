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
          '@models': './src/bot/models',
          '@commands': './src/bot/commands',
          '@reactions': './src/bot/reactions',
          '@database': './src/database',
          '@assets': './src/bot/assets',
          '@utils': './src/bot/utils',
          '@services': './src/bot/services',
          '@bot': './src/bot',
        },
      },
    ],
  ],
}