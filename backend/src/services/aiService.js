/**
 * AI-Assisted Credit Decision Service with Robust Rule-Based Fallback
 * Grounded strictly in canonical customer, exposure, and risk engine calculations.
 */

const axios = require('axios');
const config = require('../config/environment');
const { calculateRisk, formatINR } = require('./riskEngine');

class AIService {
  /**
   * Generates grounded AI credit assessment or falls back seamlessly to rule-based engine
   * @param {Object} order Canonical SalesOrder
   * @param {Object} customer Canonical Customer & CreditProfile
   * @returns {Promise<Object>} RiskAssessment
   */
  async assessCreditRisk(order, customer) {
    // 1. Calculate deterministic base risk
    const baseRisk = calculateRisk(order, customer);

    // 2. If AI_MODE is mock or no API key, use transparent grounded fallback immediately
    if (config.ai.mode === 'mock' || !config.ai.apiKey) {
      return this.generateRuleBasedFallback(order, customer, baseRisk, 'Rule-based deterministic engine (Demo Mode).');
    }

    // 3. Attempt LLM call with strict grounded prompt
    try {
      if (config.ai.mode === 'gemini') {
        return await this.callGemini(order, customer, baseRisk);
      } else if (config.ai.mode === 'openai') {
        return await this.callOpenAI(order, customer, baseRisk);
      } else {
        return this.generateRuleBasedFallback(order, customer, baseRisk, `Unsupported AI provider ${config.ai.mode}. Used rule-based fallback.`);
      }
    } catch (err) {
      console.warn(`[AI Service] External AI call failed: ${err.message}. Engaging automatic rule-based fallback.`);
      return this.generateRuleBasedFallback(
        order,
        customer,
        baseRisk,
        `AI service unavailable (${err.message}). Showing rule-based risk assessment.`
      );
    }
  }

  /**
   * Constructs the strict grounded prompt
   */
  buildPrompt(order, customer, baseRisk) {
    return `
You are an expert SAP S/4HANA Credit Analyst assisting a Credit Manager.
Analyze the following verified business data from the SAP system of record:

CUSTOMER: ${customer.name} (ID: ${customer.customerId})
INDUSTRY: ${customer.industry || 'N/A'}
CREDIT LIMIT: ${formatINR(customer.creditLimit)}
CURRENT EXPOSURE: ${formatINR(customer.currentExposure)}
OVERDUE AMOUNT: ${formatINR(customer.overdueAmount)}
PAYMENT HISTORY: ${customer.paymentHistory}

SALES ORDER: ${order.orderId}
ORDER VALUE: ${formatINR(order.orderValue)} (${order.currency})
ITEMS COUNT: ${order.items?.length || 0}
CURRENT STATUS: ${order.status}

DETERMINISTIC RISK SCORE: ${baseRisk.score} / 100
DETERMINISTIC RISK LEVEL: ${baseRisk.level}
FACTORS IDENTIFIED BY SYSTEM:
${baseRisk.factors.map(f => `- ${f}`).join('\n')}

INSTRUCTIONS:
1. Ground your analysis ONLY on the provided financial numbers above.
2. DO NOT invent financial values, fictitious background history, or unlisted terms.
3. Recommend one of: RELEASE, HOLD, or ESCALATE.
4. If risk level is HIGH and overdue amount exists, you MUST NOT recommend automatic RELEASE.
5. Provide a crisp 2-3 sentence executive rationale for the Credit Manager.
6. Return your answer strictly in valid JSON matching this schema:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "recommendation": "RELEASE" | "HOLD" | "ESCALATE",
  "explanation": "Executive explanation string",
  "keyFactors": ["factor 1", "factor 2"]
}
`;
  }

  /**
   * Gemini API integration
   */
  async callGemini(order, customer, baseRisk) {
    const prompt = this.buildPrompt(order, customer, baseRisk);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.ai.model}:generateContent?key=${config.ai.apiKey}`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    }, { timeout: 8000 });

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return {
      orderId: order.orderId,
      riskScore: baseRisk.score,
      riskLevel: parsed.riskLevel || baseRisk.level,
      factors: Array.isArray(parsed.keyFactors) && parsed.keyFactors.length > 0 ? parsed.keyFactors : baseRisk.factors,
      recommendation: parsed.recommendation || baseRisk.recommendation,
      explanation: parsed.explanation,
      source: 'AI_ASSISTED',
      model: config.ai.model,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * OpenAI API integration
   */
  async callOpenAI(order, customer, baseRisk) {
    const prompt = this.buildPrompt(order, customer, baseRisk);
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are an SAP S/4HANA Credit Management AI assistant. Return JSON only.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: { Authorization: `Bearer ${config.ai.apiKey}` },
      timeout: 8000
    });

    const parsed = JSON.parse(response.data.choices[0].message.content);

    return {
      orderId: order.orderId,
      riskScore: baseRisk.score,
      riskLevel: parsed.riskLevel || baseRisk.level,
      factors: parsed.keyFactors || baseRisk.factors,
      recommendation: parsed.recommendation || baseRisk.recommendation,
      explanation: parsed.explanation,
      source: 'AI_ASSISTED',
      model: 'gpt-4o-mini',
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Deterministic grounded rule-based fallback
   */
  generateRuleBasedFallback(order, customer, baseRisk, note = '') {
    let explanation = '';

    if (baseRisk.level === 'HIGH') {
      explanation = `Order ${order.orderId} for ${customer.name} presents high credit risk (Score: ${baseRisk.score}/100). Total exposure (${formatINR(customer.currentExposure + order.orderValue)}) exceeds approved credit limit of ${formatINR(customer.creditLimit)}. ${customer.overdueAmount > 0 ? `Unsettled overdue balance of ${formatINR(customer.overdueAmount)} requires immediate escalation.` : 'Recommend placing order on temporary hold until collateral or payment is received.'}`;
    } else if (baseRisk.level === 'MEDIUM') {
      explanation = `Order ${order.orderId} for ${customer.name} has moderate risk (Score: ${baseRisk.score}/100). Exposure is nearing credit thresholds (${Math.round(((customer.currentExposure + order.orderValue) / (customer.creditLimit || 1)) * 100)}% utilization). Recommend hold pending credit review or partial prepayment.`;
    } else {
      explanation = `Order ${order.orderId} for ${customer.name} is within low risk tolerance (Score: ${baseRisk.score}/100). Available credit buffer is adequate (${formatINR(Math.max(0, customer.creditLimit - customer.currentExposure))}) with zero overdue amounts. Recommend standard release.`;
    }

    return {
      orderId: order.orderId,
      riskScore: baseRisk.score,
      riskLevel: baseRisk.level,
      factors: baseRisk.factors,
      recommendation: baseRisk.recommendation,
      explanation,
      source: 'RULE_BASED_FALLBACK',
      note: note || 'AI service unavailable. Showing rule-based risk assessment.',
      evaluatedAt: new Date().toISOString()
    };
  }
}

module.exports = new AIService();
