module.exports = [
  {
    script: 'dist/index.js',
    name: 'bot',
    exec_mode: 'cluster',
    instances: 1,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  },
]
