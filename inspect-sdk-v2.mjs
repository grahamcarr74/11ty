import { GraphClient } from '@optimizely/cms-sdk';

console.log('GraphClient constructor:', GraphClient.prototype.constructor.toString());

const client = new GraphClient('dummy-key', { graphUrl: 'https://example.com' });
console.log('Client instance:', client);

// Check if we can pass headers to request or config
// Inspecting internal properties if possible
console.log('Client keys:', Object.keys(client));
