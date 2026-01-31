import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/overview',
        'getting-started/authentication',
        'getting-started/your-first-payment',
        'getting-started/testing',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/payment-intents',
        'concepts/payment-types',
        'concepts/settlement-methods',
        'concepts/status-lifecycle',
        'concepts/escrow-orders',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/payment-flows',
        'guides/delivery-vs-payment',
        'guides/time-based-payouts',
        'guides/milestone-payments',
        'guides/dispute-resolution',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/introduction',
        {
          type: 'category',
          label: 'Payment Intents',
          items: [
            'api-reference/payment-intents/create',
            'api-reference/payment-intents/retrieve',
            'api-reference/payment-intents/confirm',
          ],
        },
        {
          type: 'category',
          label: 'Escrow Orders',
          items: [
            'api-reference/escrow-orders/get',
            'api-reference/escrow-orders/submit-delivery-proof',
            'api-reference/escrow-orders/raise-dispute',
          ],
        },
        {
          type: 'category',
          label: 'Milestones',
          items: [
            'api-reference/milestones/create',
            'api-reference/milestones/complete',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/quickstart',
        'examples/delivery-vs-payment',
        'examples/time-locked-release',
        'examples/milestone-payments',
        'examples/error-handling',
      ],
    },
    {
      type: 'category',
      label: 'Error Handling',
      items: [
        'errors/error-codes',
        'errors/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      items: [
        'resources/webhooks',
        'resources/rate-limits',
        'resources/changelog',
      ],
    },
  ],
};

export default sidebars;
