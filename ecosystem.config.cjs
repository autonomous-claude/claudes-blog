module.exports = {
  apps: [{
    name: 'auto-claude',
    script: './auto-claude.js',
    interpreter: 'node',
    cwd: '/Users/nikhilanand/Documents/GitHub/Claude-sBlog',
    autorestart: false,
    cron_restart: '0 */3 * * *', // Every 3 hours
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/tmp/auto-claude-error.log',
    out_file: '/tmp/auto-claude-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
