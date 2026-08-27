/**
 * Realistic SAP S/4HANA Seed Data for O2C Credit Release Cockpit
 * Models standard SAP Customer, Credit Account, and Sales Order entities.
 */

const customers = [
  {
    customerId: 'C001',
    name: 'ABC Manufacturing Ltd',
    industry: 'Heavy Machinery & Industrial Equipment',
    country: 'IN',
    creditLimit: 1000000, // ₹10,00,000
    currentExposure: 800000, // ₹8,00,000 (80% utilization)
    overdueAmount: 200000,  // ₹2,00,000 overdue
    paymentHistory: 'Mostly on-time payments historically; recent delay and overdue amount observed in Q2.',
    creditSegment: '1000 - Domestic Enterprise',
    riskClass: 'C - High Risk',
    lastCreditReviewDate: '2026-06-15'
  },
  {
    customerId: 'C002',
    name: 'Nexus Global Retail Corp',
    industry: 'Consumer Goods & Retail',
    country: 'IN',
    creditLimit: 2500000, // ₹25,00,000
    currentExposure: 450000, // ₹4,50,000 (18% utilization)
    overdueAmount: 0,
    paymentHistory: 'Flawless payment track record; consistent settlement within 15 days of invoice date.',
    creditSegment: '1000 - Domestic Enterprise',
    riskClass: 'A - Prime Low Risk',
    lastCreditReviewDate: '2026-07-10'
  },
  {
    customerId: 'C003',
    name: 'Zenith Automotive Solutions',
    industry: 'Automotive Components',
    country: 'IN',
    creditLimit: 1800000, // ₹18,00,000
    currentExposure: 1650000, // ₹16,50,000 (91% utilization)
    overdueAmount: 450000,  // ₹4,50,000 critical overdue
    paymentHistory: 'Multiple delinquent invoices exceeding 60+ days; undergoing restructuring review.',
    creditSegment: '1000 - Domestic Enterprise',
    riskClass: 'D - Critical Risk',
    lastCreditReviewDate: '2026-05-20'
  },
  {
    customerId: 'C004',
    name: 'Apex HealthTech Innovations',
    industry: 'Medical Devices & Healthcare',
    country: 'IN',
    creditLimit: 1200000, // ₹12,00,000
    currentExposure: 600000, // ₹6,00,000 (50% utilization)
    overdueAmount: 50000,   // ₹50,000 mild overdue
    paymentHistory: 'Occasional administrative delays; payments cleared within 45 days.',
    creditSegment: '1000 - Domestic Enterprise',
    riskClass: 'B - Moderate Risk',
    lastCreditReviewDate: '2026-08-01'
  },
  {
    customerId: 'C005',
    name: 'Orion Energy Systems',
    industry: 'Renewable Energy & Infrastructure',
    country: 'IN',
    creditLimit: 3000000, // ₹30,00,000
    currentExposure: 2400000, // ₹24,00,000 (80% utilization)
    overdueAmount: 120000,  // ₹1,20,000 overdue
    paymentHistory: 'Seasonal milestone payment delays tied to project completion schedules.',
    creditSegment: '1000 - Domestic Enterprise',
    riskClass: 'B - Moderate Risk',
    lastCreditReviewDate: '2026-07-25'
  }
];

const salesOrders = [
  {
    orderId: 'SO1001',
    customerId: 'C001',
    customerName: 'ABC Manufacturing Ltd',
    orderDate: '2026-08-25T10:15:00.000Z',
    orderValue: 850000, // ₹8,50,000
    currency: 'INR',
    status: 'BLOCKED',
    creditStatus: 'CREDIT_LIMIT_EXCEEDED',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-LP-01',
        materialName: 'High-Performance Workstation Laptop',
        quantity: 15,
        unitPrice: 50000,
        totalPrice: 750000
      },
      {
        itemId: '20',
        materialId: 'MAT-MN-02',
        materialName: 'Ultra-Wide 4K IPS Monitor',
        quantity: 10,
        unitPrice: 10000,
        totalPrice: 100000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-001',
        timestamp: '2026-08-25T10:15:05.000Z',
        action: 'ORDER_CREATED',
        previousStatus: 'NEW',
        newStatus: 'BLOCKED',
        decisionMaker: 'SAP S/4HANA Credit Check Engine',
        reason: 'Automated Credit Check Rule #1 failed: Exposure (₹8,00,000) + Order (₹8,50,000) = ₹16,50,000 exceeds Credit Limit (₹10,00,000).'
      }
    ]
  },
  {
    orderId: 'SO1002',
    customerId: 'C002',
    customerName: 'Nexus Global Retail Corp',
    orderDate: '2026-08-25T11:30:00.000Z',
    orderValue: 120000, // ₹1,20,000
    currency: 'INR',
    status: 'RELEASED',
    creditStatus: 'PASSED',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-MN-02',
        materialName: 'Ultra-Wide 4K IPS Monitor',
        quantity: 12,
        unitPrice: 10000,
        totalPrice: 120000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-002',
        timestamp: '2026-08-25T11:30:02.000Z',
        action: 'AUTO_RELEASED',
        previousStatus: 'NEW',
        newStatus: 'RELEASED',
        decisionMaker: 'SAP S/4HANA Credit Check Engine',
        reason: 'Credit check passed. Total exposure remains well below 80% threshold.'
      }
    ]
  },
  {
    orderId: 'SO1003',
    customerId: 'C003',
    customerName: 'Zenith Automotive Solutions',
    orderDate: '2026-08-26T09:00:00.000Z',
    orderValue: 1500000, // ₹15,00,000
    currency: 'INR',
    status: 'BLOCKED',
    creditStatus: 'CRITICAL_OVERDUE_AND_LIMIT',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-SRV-01',
        materialName: 'Industrial Controller Server Blade',
        quantity: 10,
        unitPrice: 120000,
        totalPrice: 1200000
      },
      {
        itemId: '20',
        materialId: 'MAT-LP-01',
        materialName: 'High-Performance Workstation Laptop',
        quantity: 6,
        unitPrice: 50000,
        totalPrice: 300000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-003',
        timestamp: '2026-08-26T09:00:04.000Z',
        action: 'ORDER_BLOCKED',
        previousStatus: 'NEW',
        newStatus: 'BLOCKED',
        decisionMaker: 'SAP S/4HANA Credit Check Engine',
        reason: 'Severe credit block: Combined exposure would reach ₹31,50,000 vs ₹18,00,000 limit, and customer has ₹4,50,000 in 60+ days overdue.'
      }
    ]
  },
  {
    orderId: 'SO1004',
    customerId: 'C004',
    customerName: 'Apex HealthTech Innovations',
    orderDate: '2026-08-26T14:10:00.000Z',
    orderValue: 350000, // ₹3,50,000
    currency: 'INR',
    status: 'UNDER_REVIEW',
    creditStatus: 'WARNING_OVERDUE_PRESENT',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-LP-01',
        materialName: 'High-Performance Workstation Laptop',
        quantity: 7,
        unitPrice: 50000,
        totalPrice: 350000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-004',
        timestamp: '2026-08-26T14:10:05.000Z',
        action: 'ORDER_FLAGGED',
        previousStatus: 'NEW',
        newStatus: 'UNDER_REVIEW',
        decisionMaker: 'SAP S/4HANA Credit Check Engine',
        reason: 'Total exposure within limit (₹9,50,000 / ₹12,00,000), but overdue amount ₹50,000 triggered manual review.'
      }
    ]
  },
  {
    orderId: 'SO1005',
    customerId: 'C005',
    customerName: 'Orion Energy Systems',
    orderDate: '2026-08-26T16:45:00.000Z',
    orderValue: 420000, // ₹4,20,000
    currency: 'INR',
    status: 'HOLD',
    creditStatus: 'HELD_PENDING_COLLATERAL',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-MN-02',
        materialName: 'Ultra-Wide 4K IPS Monitor',
        quantity: 42,
        unitPrice: 10000,
        totalPrice: 420000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-005',
        timestamp: '2026-08-26T16:45:03.000Z',
        action: 'ORDER_BLOCKED',
        previousStatus: 'NEW',
        newStatus: 'BLOCKED',
        decisionMaker: 'SAP S/4HANA Credit Check Engine',
        reason: 'Exposure threshold reached.'
      },
      {
        id: 'AUD-006',
        timestamp: '2026-08-27T08:30:00.000Z',
        action: 'STATUS_CHANGED',
        previousStatus: 'BLOCKED',
        newStatus: 'HOLD',
        decisionMaker: 'Senior Credit Analyst (Emp #4892)',
        reason: 'Awaiting updated bank guarantee or payment for overdue milestone invoice.'
      }
    ]
  },
  {
    orderId: 'SO1006',
    customerId: 'C001',
    customerName: 'ABC Manufacturing Ltd',
    orderDate: '2026-08-27T09:15:00.000Z',
    orderValue: 200000, // ₹2,00,000
    currency: 'INR',
    status: 'BLOCKED',
    creditStatus: 'CREDIT_LIMIT_EXCEEDED',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-MN-02',
        materialName: 'Ultra-Wide 4K IPS Monitor',
        quantity: 20,
        unitPrice: 10000,
        totalPrice: 200000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-007',
        timestamp: '2026-08-27T09:15:02.000Z',
        action: 'ORDER_BLOCKED',
        previousStatus: 'NEW',
        newStatus: 'BLOCKED',
        decisionMaker: 'SAP S/4HANA Credit Check Engine',
        reason: 'Exposure already at ₹8,00,000. Combined ₹10,00,000 equals exact limit with existing ₹2,00,000 overdue.'
      }
    ]
  },
  {
    orderId: 'SO1007',
    customerId: 'C002',
    customerName: 'Nexus Global Retail Corp',
    orderDate: '2026-08-27T10:00:00.000Z',
    orderValue: 60000, // ₹60,000
    currency: 'INR',
    status: 'RELEASED',
    creditStatus: 'PASSED',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-MN-02',
        materialName: 'Ultra-Wide 4K IPS Monitor',
        quantity: 6,
        unitPrice: 10000,
        totalPrice: 60000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-008',
        timestamp: '2026-08-27T10:00:02.000Z',
        action: 'AUTO_RELEASED',
        previousStatus: 'NEW',
        newStatus: 'RELEASED',
        decisionMaker: 'SAP S/4HANA Credit Check Engine',
        reason: 'Low risk tier, prime customer account.'
      }
    ]
  },
  {
    orderId: 'SO1008',
    customerId: 'C003',
    customerName: 'Zenith Automotive Solutions',
    orderDate: '2026-08-27T11:20:00.000Z',
    orderValue: 980000, // ₹9,80,000
    currency: 'INR',
    status: 'ESCALATED',
    creditStatus: 'ESCALATED_TO_CFO',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-SRV-01',
        materialName: 'Industrial Controller Server Blade',
        quantity: 7,
        unitPrice: 120000,
        totalPrice: 840000
      },
      {
        itemId: '20',
        materialId: 'MAT-MN-02',
        materialName: 'Ultra-Wide 4K IPS Monitor',
        quantity: 14,
        unitPrice: 10000,
        totalPrice: 140000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-009',
        timestamp: '2026-08-27T11:20:03.000Z',
        action: 'STATUS_CHANGED',
        previousStatus: 'BLOCKED',
        newStatus: 'ESCALATED',
        decisionMaker: 'Credit Manager (Emp #3102)',
        reason: 'Order value exceeds risk tolerance for customer in overdue workout. Escalated to Chief Risk Officer / Finance Director.'
      }
    ]
  },
  {
    orderId: 'SO1009',
    customerId: 'C004',
    customerName: 'Apex HealthTech Innovations',
    orderDate: '2026-08-27T12:00:00.000Z',
    orderValue: 180000, // ₹1,80,000
    currency: 'INR',
    status: 'RELEASED',
    creditStatus: 'PASSED',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-MN-02',
        materialName: 'Ultra-Wide 4K IPS Monitor',
        quantity: 18,
        unitPrice: 10000,
        totalPrice: 180000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-010',
        timestamp: '2026-08-27T12:00:04.000Z',
        action: 'RELEASED',
        previousStatus: 'UNDER_REVIEW',
        newStatus: 'RELEASED',
        decisionMaker: 'Credit Officer (Emp #5011)',
        reason: 'Customer submitted payment confirmation for ₹50,000 overdue invoice.'
      }
    ]
  },
  {
    orderId: 'SO1010',
    customerId: 'C005',
    customerName: 'Orion Energy Systems',
    orderDate: '2026-08-27T13:40:00.000Z',
    orderValue: 650000, // ₹6,50,000
    currency: 'INR',
    status: 'BLOCKED',
    creditStatus: 'CREDIT_LIMIT_EXCEEDED',
    salesOrganization: '1010',
    distributionChannel: '10',
    division: '00',
    items: [
      {
        itemId: '10',
        materialId: 'MAT-LP-01',
        materialName: 'High-Performance Workstation Laptop',
        quantity: 13,
        unitPrice: 50000,
        totalPrice: 650000
      }
    ],
    auditTrail: [
      {
        id: 'AUD-011',
        timestamp: '2026-08-27T13:40:02.000Z',
        action: 'ORDER_BLOCKED',
        previousStatus: 'NEW',
        newStatus: 'BLOCKED',
        decisionMaker: 'SAP S/4HANA Credit Check Engine',
        reason: 'Total exposure (₹24,00,000) + Order (₹6,50,000) = ₹30,50,000 exceeds ₹30,00,000 Credit Limit.'
      }
    ]
  }
];

module.exports = {
  customers,
  salesOrders
};
