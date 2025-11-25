import express, { Request, Response, NextFunction } from 'express';
import { spawn, ChildProcess } from 'child_process';
import { previewClient } from './graphql-client-preview';
import {
  renderContent,
  renderContentFragment,
  renderNotFound,
  renderConfigError,
  renderError,
  setContextMode,
} from './renderer';

const app = express();

// Middleware: CORS for CMS iframe embedding
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Middleware: No caching for preview
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

// Health check endpoint
app.get('/preview/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', mode: 'preview' });
});

// Webhook endpoint for Optimizely Content Graph
// Triggers 11ty rebuild when content is published
let rebuildProcess: ChildProcess | null = null;
let rebuildTimeout: NodeJS.Timeout | null = null;
const REBUILD_DEBOUNCE_MS = 5000; // Wait 5 seconds before rebuilding to batch multiple updates

app.use(express.json()); // Parse JSON body for webhook payload

app.post('/webhook/content-published', (req: Request, res: Response) => {
  console.log('[Webhook] Received content published notification');
  console.log('[Webhook] Payload:', JSON.stringify(req.body, null, 2));

  // Optional: Validate webhook secret if configured
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${webhookSecret}`) {
      console.warn('[Webhook] Invalid webhook secret');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  // Debounce rebuilds - wait for rapid webhook calls to settle
  if (rebuildTimeout) {
    console.log('[Webhook] Debouncing rebuild...');
    clearTimeout(rebuildTimeout);
  }

  rebuildTimeout = setTimeout(() => {
    triggerRebuild();
    rebuildTimeout = null;
  }, REBUILD_DEBOUNCE_MS);

  res.json({ status: 'ok', message: 'Rebuild scheduled' });
});

function triggerRebuild(): void {
  // Don't start a new rebuild if one is already running
  if (rebuildProcess) {
    console.log('[Webhook] Rebuild already in progress, skipping...');
    return;
  }

  console.log('[Webhook] Triggering 11ty rebuild...');

  rebuildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  });

  rebuildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('[Webhook] Rebuild completed successfully');
    } else {
      console.error(`[Webhook] Rebuild failed with exit code ${code}`);
    }
    rebuildProcess = null;
  });

  rebuildProcess.on('error', (err) => {
    console.error('[Webhook] Rebuild error:', err);
    rebuildProcess = null;
  });
}

// API endpoint for fetching content fragment (for AJAX updates without full page refresh)
app.get('/preview/api/content', async (req: Request, res: Response) => {
  const { key, url, preview_token, ctx } = req.query;

  try {
    // Set context mode for Visual Builder
    const contextMode = ctx === 'edit' ? 'edit' : ctx === 'preview' ? 'preview' : null;
    setContextMode(contextMode);

    // Set preview token if provided
    if (preview_token && typeof preview_token === 'string') {
      const decodedToken = decodeURIComponent(preview_token);
      previewClient.setPreviewToken(decodedToken);
    } else {
      previewClient.setPreviewToken(null);
    }

    let content = null;

    if (key && typeof key === 'string') {
      content = await previewClient.getContentByKey(key);
    } else if (url && typeof url === 'string') {
      content = await previewClient.getContentByUrl(url);
    }

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    // Return just the content fragment HTML
    const html = renderContentFragment(content);
    res.json({
      html,
      metadata: {
        key: content._metadata.key,
        version: content._metadata.version,
        lastModified: content._metadata.lastModified,
      }
    });
  } catch (error) {
    console.error('Preview API error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Debug endpoint to list available content
app.get('/preview/debug/list', async (req: Request, res: Response) => {
  try {
    if (!checkPreviewConfig(res)) return;

    const items = await previewClient.listContent(10);
    res.json({
      count: items.length,
      items: items.map(item => ({
        key: item._metadata.key,
        displayName: item._metadata.displayName,
        type: item.__typename,
        url: item._metadata.url?.default,
      }))
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Helper to check preview configuration
function checkPreviewConfig(res: Response): boolean {
  if (!process.env.OPTIMIZELY_GRAPH_APP_KEY || !process.env.OPTIMIZELY_GRAPH_SECRET) {
    res.status(503).send(renderConfigError());
    return false;
  }
  return true;
}

// Preview with query parameters (most flexible for Optimizely CMS)
// Supports: /preview?url=/path/to/content OR /preview?key=content-key
// Also accepts preview_token from Optimizely CMS for draft content
// ctx parameter controls Visual Builder mode: 'edit' shows property overlays, 'preview' hides them
app.get('/preview', async (req: Request, res: Response) => {
  const { url, key, path, preview_token, ctx } = req.query;

  try {
    // Set context mode for Visual Builder (edit mode shows property overlays)
    const contextMode = ctx === 'edit' ? 'edit' : ctx === 'preview' ? 'preview' : null;
    setContextMode(contextMode);
    console.log('[Preview] Context mode:', contextMode || 'default');

    // Set preview token if provided (enables draft content access)
    if (preview_token && typeof preview_token === 'string') {
      // Decode the token in case it was URL-encoded
      const decodedToken = decodeURIComponent(preview_token);
      console.log('[Preview] Received preview_token, length:', decodedToken.length);
      previewClient.setPreviewToken(decodedToken);
    } else {
      previewClient.setPreviewToken(null);
      console.log('[Preview] No preview_token provided, using Basic auth');
      // Check for basic auth config if no preview token
      if (!checkPreviewConfig(res)) return;
    }

    let content = null;

    // Try by key first
    if (key && typeof key === 'string') {
      content = await previewClient.getContentByKey(key);
      if (!content) {
        res.status(404).send(renderNotFound(key));
        return;
      }
    }
    // Then try by URL/path
    else if ((url || path) && typeof (url || path) === 'string') {
      const urlPath = (url || path) as string;
      content = await previewClient.getContentByUrl(urlPath);
      if (!content) {
        res.status(404).send(renderError('Content Not Found', `No content found at URL: ${urlPath}`));
        return;
      }
    }
    // No valid parameter provided
    else {
      res.status(400).send(renderError(
        'Missing Parameter',
        `Please provide either:\n- ?key=content-key\n- ?url=/path/to/content\n- ?path=/path/to/content`
      ));
      return;
    }

    const html = renderContent(content);
    res.send(html);
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).send(renderError('Server Error', String(error)));
  }
});

// Preview by content key in path (for Optimizely CMS integration)
// Accepts preview_token as query param for draft content
// ctx parameter controls Visual Builder mode
app.get('/preview/:contentKey', async (req: Request, res: Response) => {
  const { contentKey } = req.params;
  const { preview_token, ctx } = req.query;

  try {
    // Set context mode for Visual Builder
    const contextMode = ctx === 'edit' ? 'edit' : ctx === 'preview' ? 'preview' : null;
    setContextMode(contextMode);

    // Set preview token if provided (enables draft content access)
    if (preview_token && typeof preview_token === 'string') {
      previewClient.setPreviewToken(preview_token);
    } else {
      previewClient.setPreviewToken(null);
      if (!checkPreviewConfig(res)) return;
    }

    const content = await previewClient.getContentByKey(contentKey);

    if (!content) {
      res.status(404).send(renderNotFound(contentKey));
      return;
    }

    const html = renderContent(content);
    res.send(html);
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).send(renderError('Server Error', String(error)));
  }
});

// Preview by URL path (alternative method)
// Accepts preview_token as query param for draft content
// ctx parameter controls Visual Builder mode
app.get('/preview-url/*', async (req: Request, res: Response) => {
  const urlPath = '/' + (req.params[0] || '');
  const { preview_token, ctx } = req.query;

  try {
    // Set context mode for Visual Builder
    const contextMode = ctx === 'edit' ? 'edit' : ctx === 'preview' ? 'preview' : null;
    setContextMode(contextMode);

    // Set preview token if provided (enables draft content access)
    if (preview_token && typeof preview_token === 'string') {
      previewClient.setPreviewToken(preview_token);
    } else {
      previewClient.setPreviewToken(null);
      if (!checkPreviewConfig(res)) return;
    }

    const content = await previewClient.getContentByUrl(urlPath);

    if (!content) {
      res.status(404).send(renderError('Content Not Found', `No content found at URL: ${urlPath}`));
      return;
    }

    const html = renderContent(content);
    res.send(html);
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).send(renderError('Server Error', String(error)));
  }
});

// Export for use in combined server
export { app as previewApp };

// Standalone server (for preview-only mode)
export function startPreviewServer(port: number = 3001): void {
  app.listen(port, () => {
    console.log(`Preview server running at http://localhost:${port}`);
    console.log(`  - By key:   http://localhost:${port}/preview/{contentKey}`);
    console.log(`  - By URL:   http://localhost:${port}/preview?url=/path/to/content`);
    console.log(`  - By path:  http://localhost:${port}/preview-url/path/to/content`);
  });
}

// Run standalone if executed directly
if (require.main === module) {
  require('dotenv').config();
  const port = parseInt(process.env.PREVIEW_PORT || '3001', 10);
  startPreviewServer(port);
}
