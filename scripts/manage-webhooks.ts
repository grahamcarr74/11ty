import 'dotenv/config';

/**
 * Manage webhooks registered with Optimizely Content Graph
 *
 * Usage:
 *   npx tsx scripts/manage-webhooks.ts list     - List all registered webhooks
 *   npx tsx scripts/manage-webhooks.ts delete <id> - Delete a specific webhook
 *
 * Required environment variables:
 * - OPTIMIZELY_GRAPH_APP_KEY
 * - OPTIMIZELY_GRAPH_SECRET
 */

const WEBHOOKS_API = 'https://cg.optimizely.com/api/webhooks';

function getAuthHeader(): string {
  const appKey = process.env.OPTIMIZELY_GRAPH_APP_KEY;
  const secret = process.env.OPTIMIZELY_GRAPH_SECRET;

  if (!appKey || !secret) {
    console.error('Error: OPTIMIZELY_GRAPH_APP_KEY and OPTIMIZELY_GRAPH_SECRET are required');
    process.exit(1);
  }

  return 'Basic ' + Buffer.from(`${appKey}:${secret}`).toString('base64');
}

async function listWebhooks(): Promise<void> {
  console.log('Fetching registered webhooks...\n');

  try {
    const response = await fetch(WEBHOOKS_API, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch webhooks:', response.status, response.statusText);
      console.error('Response:', errorText);
      process.exit(1);
    }

    const webhooks = await response.json();

    if (!webhooks || webhooks.length === 0) {
      console.log('No webhooks registered.');
      return;
    }

    console.log(`Found ${webhooks.length} webhook(s):\n`);

    webhooks.forEach((webhook: any, index: number) => {
      console.log(`${index + 1}. ID: ${webhook.id}`);
      console.log(`   URL: ${webhook.request?.url}`);
      console.log(`   Method: ${webhook.request?.method}`);
      console.log(`   Topics: ${JSON.stringify(webhook.topic)}`);
      console.log(`   Disabled: ${webhook.disabled}`);
      console.log(`   Filters: ${JSON.stringify(webhook.filters)}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error fetching webhooks:', error);
    process.exit(1);
  }
}

async function deleteWebhook(id: string): Promise<void> {
  console.log(`Deleting webhook with ID: ${id}...\n`);

  try {
    const response = await fetch(`${WEBHOOKS_API}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete webhook:', response.status, response.statusText);
      console.error('Response:', errorText);
      process.exit(1);
    }

    console.log('Webhook deleted successfully!');

  } catch (error) {
    console.error('Error deleting webhook:', error);
    process.exit(1);
  }
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    listWebhooks();
    break;

  case 'delete':
    const webhookId = args[1];
    if (!webhookId) {
      console.error('Error: Please provide a webhook ID to delete');
      console.error('Usage: npx tsx scripts/manage-webhooks.ts delete <webhook-id>');
      process.exit(1);
    }
    deleteWebhook(webhookId);
    break;

  default:
    console.log('Optimizely Content Graph Webhook Manager\n');
    console.log('Usage:');
    console.log('  npx tsx scripts/manage-webhooks.ts list           - List all webhooks');
    console.log('  npx tsx scripts/manage-webhooks.ts delete <id>    - Delete a webhook');
    break;
}
