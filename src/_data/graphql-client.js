require('dotenv').config();
const fetch = require('node-fetch');

class OptimizelyGraphClient {
  constructor() {
    this.gateway = process.env.OPTIMIZELY_GRAPH_GATEWAY;
    this.singleKey = process.env.OPTIMIZELY_GRAPH_SINGLE_KEY;
    this.appKey = process.env.OPTIMIZELY_GRAPH_APP_KEY;
    this.secret = process.env.OPTIMIZELY_GRAPH_SECRET;
  }

  async query(graphqlQuery, variables = {}) {
    if (!this.gateway || !this.singleKey) {
      console.warn('Optimizely Content Graph credentials not configured. Using mock data.');
      return null;
    }

    try {
      const response = await fetch(`${this.gateway}?auth=${this.singleKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: variables
        })
      });

      const result = await response.json();

      if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching from Content Graph:', error);
      return null;
    }
  }
}

module.exports = new OptimizelyGraphClient();
