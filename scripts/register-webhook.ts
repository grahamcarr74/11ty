import 'dotenv/config';

/**
 * Register a webhook with Optimizely Content Graph
 * This webhook will be called when content is published
 *
 * Usage: npx tsx scripts/register-webhook.ts
 *
 * Required environment variables:
 * - OPTIMIZELY_GRAPH_APP_KEY
 * - OPTIMIZELY_GRAPH_SECRET
 * - PUBLIC_URL (your server's public URL)
 */

const WEBHOOKS_API = 'https://cg.optimizely.com/api/webhooks';

async function registerWebhook(): Promise<void> {
  const appKey = process.env.OPTIMIZELY_GRAPH_APP_KEY;
  const secret = process.env.OPTIMIZELY_GRAPH_SECRET;
  const publicUrl = process.env.PUBLIC_URL;

  if (!appKey || !secret) {
    console.error('Error: OPTIMIZELY_GRAPH_APP_KEY and OPTIMIZELY_GRAPH_SECRET are required');
    process.exit(1);
  }

  if (!publicUrl) {
    console.error('Error: PUBLIC_URL is required (e.g., https://your-domain.com)');
    console.error('This is the public URL where Optimizely will send webhook notifications');
    process.exit(1);
  }

  const webhookUrl = `${publicUrl}/webhook/content-published`;

  // Create Basic auth header
  const authHeader = 'Basic ' + Buffer.from(`${appKey}:${secret}`).toString('base64');

  const payload = {
    disabled: false,
    request: {
      url: webhookUrl,
      method: 'post',
    },
    topic: ['doc.updated'],
    filters: [
      { status: { eq: 'Published' } }
    ],
  };

  console.log('Registering webhook with Optimizely Content Graph...');
  console.log('Webhook URL:', webhookUrl);
  console.log('Topic: doc.updated (Published content only)');

  try {
    const response = await fetch(WEBHOOKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to register webhook:', response.status, response.statusText);
      console.error('Response:', errorText);
      process.exit(1);
    }

    const result = await response.json();
    console.log('\nWebhook registered successfully!');
    console.log('Webhook ID:', result.id);
    console.log('\nFull response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error registering webhook:', error);
    process.exit(1);
  }
}

registerWebhook();
