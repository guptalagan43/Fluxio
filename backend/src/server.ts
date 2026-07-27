// src/server.ts
// Server entry point — starts Express and handles graceful shutdown.

import app from './app.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const server = app.listen(PORT, () => {
  console.info(`[SERVER] Listening on port ${PORT}`);
  console.info(`[SERVER] Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('[SERVER] SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.info('[SERVER] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.info('[SERVER] SIGINT received — shutting down');
  server.close(() => {
    process.exit(0);
  });
});
