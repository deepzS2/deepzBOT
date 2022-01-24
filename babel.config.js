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
          '@models': './src/models',
          '@commands': './src/commands',
          '@reactions': './src/reactions',
          '@database': './src/database',
          '@assets': './src/assets',
          '@utils': './src/utils',
          '@services': './src/services',
          '@bot': './src',
        },
      },
    ],
  ],
}