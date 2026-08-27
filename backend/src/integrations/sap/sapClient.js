const axios = require('axios');
const config = require('../../config/environment');

/**
 * SAP S/4HANA Axios Client
 * Handles authentication, base URLs, standard SAP headers, and CSRF token fetching.
 */
class SapClient {
  constructor() {
    this.baseUrl = config.sap.baseUrl;
    this.clientNumber = config.sap.client;
    this.authType = config.sap.authType;
    this.timeout = config.sap.timeoutMs;
    this.csrfToken = null;
    this.csrfCookies = null;
  }

  /**
   * Builds an authenticated axios instance with SAP headers
   */
  createAxiosInstance() {
    if (!this.baseUrl) {
      throw new Error(
        'SAP S/4HANA Base URL is not configured. Please set SAP_BASE_URL in your environment or switch to SAP_MODE=mock.'
      );
    }

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'sap-client': this.clientNumber
    };

    if (this.authType === 'basic' && config.sap.username && config.sap.password) {
      const token = Buffer.from(`${config.sap.username}:${config.sap.password}`).toString('base64');
      headers['Authorization'] = `Basic ${token}`;
    } else if (this.authType === 'apiKey' && config.sap.apiKey) {
      headers['APIKey'] = config.sap.apiKey;
    }

    return axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers
    });
  }

  /**
   * Fetches an X-CSRF-Token from SAP S/4HANA required for non-GET OData operations.
   */
  async fetchCsrfToken(serviceEndpoint) {
    try {
      const client = this.createAxiosInstance();
      const response = await client.get(serviceEndpoint, {
        headers: {
          'x-csrf-token': 'Fetch'
        }
      });

      this.csrfToken = response.headers['x-csrf-token'];
      this.csrfCookies = response.headers['set-cookie'];
      return { token: this.csrfToken, cookies: this.csrfCookies };
    } catch (error) {
      throw new Error(
        `Failed to fetch SAP CSRF token from ${serviceEndpoint}: ${error.response?.data?.error?.message?.value || error.message}`
      );
    }
  }

  /**
   * Performs an authenticated request to SAP S/4HANA
   * @param {Object} options Axios request config
   */
  async request(options) {
    const client = this.createAxiosInstance();

    // If making a state-modifying call, include CSRF token and session cookies
    if (['post', 'patch', 'put', 'delete'].includes(options.method?.toLowerCase())) {
      if (!this.csrfToken) {
        await this.fetchCsrfToken(options.url);
      }
      options.headers = {
        ...options.headers,
        'x-csrf-token': this.csrfToken,
        'Cookie': Array.isArray(this.csrfCookies) ? this.csrfCookies.join('; ') : this.csrfCookies
      };
    }

    try {
      return await client(options);
    } catch (error) {
      // Re-throw formatted enterprise integration error
      const sapMsg = error.response?.data?.error?.message?.value || error.response?.data?.error?.message || error.message;
      const status = error.response?.status || 502;
      const sapError = new Error(`SAP S/4HANA Error (${status}): ${sapMsg}`);
      sapError.status = status;
      sapError.isSapError = true;
      sapError.sapResponse = error.response?.data;
      throw sapError;
    }
  }
}

module.exports = new SapClient();
