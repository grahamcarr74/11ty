import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn, ChildProcess } from 'child_process';
import { previewApp } from './src/preview/server';

const PORT = parseInt(process.env.PORT || '8080', 10);
const ELEVENTY_PORT = 8081;

const app = express();

// Mount preview routes at root (previewApp already has /preview paths)
app.use(previewApp);

// Start 11ty dev server on a different port
function startEleventy(): ChildProcess {
  console.log('Starting 11ty dev server...');

  const eleventy = spawn('npx', [
    'tsx',
    'node_modules/@11ty/eleventy/cmd.js',
    '--serve',
    `--port=${ELEVENTY_PORT}`,
  ], {
    stdio: 'inherit',
    shell: true,
  });

  eleventy.on('error', (err) => {
    console.error('Failed to start 11ty:', err);
  });

  eleventy.on('close', (code) => {
    if (code !== 0) {
      console.error(`11ty exited with code ${code}`);
    }
  });

  return eleventy;
}

// Wait for 11ty to be ready
async function waitForEleventy(maxRetries = 30): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`http://localhost:${ELEVENTY_PORT}`);
      if (response.ok) {
        return true;
      }
    } catch {
      // Not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// Proxy all other requests to 11ty
app.use('/', createProxyMiddleware({
  target: `http://localhost:${ELEVENTY_PORT}`,
  changeOrigin: true,
  ws: true, // Enable WebSocket for live reload
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (res.writeHead) {
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>11ty Starting...</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1>11ty is starting up...</h1>
            <p>Please wait a moment and refresh the page.</p>
            <script>setTimeout(() => location.reload(), 2000)</script>
          </body>
        </html>
      `);
    }
  },
}));

// Main entry point
async function main() {
  const eleventy = startEleventy();

  // Handle shutdown gracefully
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    eleventy.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    eleventy.kill();
    process.exit(0);
  });

  // Start combined server
  app.listen(PORT, () => {
    console.log(`\nCombined server running at http://localhost:${PORT}`);
    console.log(`  Preview:`);
    console.log(`    - By key: http://localhost:${PORT}/preview/{contentKey}`);
    console.log(`    - By URL: http://localhost:${PORT}/preview?url={path}`);
    console.log(`  Static:  http://localhost:${PORT}/`);
    console.log(`\nWaiting for 11ty to start...`);
  });

  // Wait for 11ty and notify
  const ready = await waitForEleventy();
  if (ready) {
    console.log(`11ty is ready! Site available at http://localhost:${PORT}`);
  } else {
    console.warn('Warning: 11ty may not have started correctly');
  }
}

main().catch(console.error);
