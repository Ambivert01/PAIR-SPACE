module.exports = {
  apps: [
    {
      name: "pairspace-api",
      script: "./services/api/src/server.js",
      interpreter: "node",
      interpreter_args: "",
      instances: "max",          // use all CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
