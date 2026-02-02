# Milestone-Based Payments

Complete example of implementing milestone-based payments with incremental fund releases based on project completion stages.

## Overview

Milestone-based payments allow you to release funds incrementally as project milestones are completed. This is ideal for:

- **Freelance Projects**: Pay developers/designers as they complete project phases
- **Construction Projects**: Release payments as construction milestones are met
- **Service Contracts**: Pay for services as deliverables are completed
- **Consulting Engagements**: Staged payments for consulting work

## Complete Flow

```typescript
import { ethers } from 'ethers';

const API_KEY = process.env.FINTERNET_API_KEY;
const BASE_URL = 'https://api.fmm.finternetlab.io/v1';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Step 1: Create Payment Intent for Milestone-Based Project
async function createMilestoneProject() {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount: '5000.00',
      currency: 'USDC',
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_123',
      description: 'Website Development Project - 3 Milestones',
      metadata: {
        projectType: 'web_development',
        clientId: 'CLIENT-789',
        contractId: 'CONTRACT-456'
      },
      deliveryPeriod: 7776000, // 90 days
      autoRelease: false // Manual release for milestone control
    }),
  });

  console.log('Payment Intent Created:', intent.id);
  console.log('Payment URL:', intent.data.paymentUrl);
  
  return intent;
}

// Step 2: Create Project Milestones
async function createProjectMilestones(intentId: string) {
  // Milestone 1: Design & Wireframes (30%)
  const milestone1 = await apiRequest(`/payment-intents/${intentId}/escrow/milestones`, {
    method: 'POST',
    body: JSON.stringify({
      milestoneIndex: 0,
      description: 'Design & Wireframes - Initial mockups and user flow',
      amount: '1500.00',
      percentage: 30
    }),
  });

  // Milestone 2: Frontend Development (50%)
  const milestone2 = await apiRequest(`/payment-intents/${intentId}/escrow/milestones`, {
    method: 'POST',
    body: JSON.stringify({
      milestoneIndex: 1,
      description: 'Frontend Development - React components and styling',
      amount: '2500.00',
      percentage: 50
    }),
  });

  // Milestone 3: Backend & Deployment (20%)
  const milestone3 = await apiRequest(`/payment-intents/${intentId}/escrow/milestones`, {
    method: 'POST',
    body: JSON.stringify({
      milestoneIndex: 2,
      description: 'Backend API & Deployment - Database, API, and hosting',
      amount: '1000.00',
      percentage: 20
    }),
  });

  console.log('Milestones created:', {
    milestone1: milestone1.id,
    milestone2: milestone2.id,
    milestone3: milestone3.id
  });

  return { milestone1, milestone2, milestone3 };
}

// Step 3: Complete a Milestone
async function completeMilestone(intentId: string, milestoneId: string, completionData: any) {
  // Generate completion proof hash
  const proofData = {
    milestoneId,
    completedAt: new Date().toISOString(),
    deliverables: completionData.deliverables,
    reviewNotes: completionData.reviewNotes
  };

  const proofHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(proofData))
  );

  const result = await apiRequest(
    `/payment-intents/${intentId}/escrow/milestones/${milestoneId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({
        completionProof: proofHash,
        completionProofURI: `https://project-docs.example.com/milestones/${milestoneId}`,
        completedBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f42318'
      }),
    }
  );

  console.log(`Milestone ${milestoneId} completed:`, result.status);
  return result;
}

// Step 4: Monitor Project Progress
async function monitorProject(intentId: string) {
  const escrowOrder = await apiRequest(`/payment-intents/${intentId}/escrow`);
  
  console.log('Project Status:', {
    orderStatus: escrowOrder.data.orderStatus,
    milestones: escrowOrder.data.milestones.map((m: any) => ({
      index: m.milestoneIndex,
      description: m.description,
      amount: m.amount,
      status: m.status,
      completedAt: m.completedAt
    }))
  });

  return escrowOrder;
}

// Complete Example Usage
async function runMilestoneProject() {
  try {
    // 1. Create the project payment intent
    const intent = await createMilestoneProject();
    
    // 2. User completes payment (redirect to intent.data.paymentUrl)
    console.log('Redirect user to:', intent.data.paymentUrl);
    
    // 3. After payment confirmation, create milestones
    const milestones = await createProjectMilestones(intent.id);
    
    // 4. Simulate milestone completions over time
    
    // Complete Milestone 1: Design & Wireframes
    await completeMilestone(intent.id, milestones.milestone1.id, {
      deliverables: ['wireframes.pdf', 'design-system.figma', 'user-flow.png'],
      reviewNotes: 'Design approved by client with minor revisions'
    });
    
    // Wait for client approval and complete Milestone 2
    setTimeout(async () => {
      await completeMilestone(intent.id, milestones.milestone2.id, {
        deliverables: ['frontend-app.zip', 'component-library.zip'],
        reviewNotes: 'Frontend development completed, responsive design implemented'
      });
    }, 5000);
    
    // Final milestone completion
    setTimeout(async () => {
      await completeMilestone(intent.id, milestones.milestone3.id, {
        deliverables: ['api-documentation.md', 'deployment-guide.md', 'live-site-url.txt'],
        reviewNotes: 'Project fully deployed and tested'
      });
      
      // Monitor final status
      await monitorProject(intent.id);
    }, 10000);
    
  } catch (error) {
    console.error('Error in milestone project:', error);
  }
}

// Run the example
runMilestoneProject();
```

## Python Example

```python
import requests
import json
import hashlib
import time
from datetime import datetime

API_KEY = 'sk_test_your_api_key'
BASE_URL = 'https://api.fmm.finternetlab.io/v1'

def api_request(endpoint, method='GET', data=None):
    url = f'{BASE_URL}{endpoint}'
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
    }
    
    if method == 'POST':
        response = requests.post(url, headers=headers, json=data)
    else:
        response = requests.get(url, headers=headers)
    
    response.raise_for_status()
    return response.json()

def create_milestone_project():
    """Create a payment intent for milestone-based project"""
    intent_data = {
        'amount': '5000.00',
        'currency': 'USDC',
        'type': 'DELIVERY_VS_PAYMENT',
        'settlementMethod': 'OFF_RAMP_MOCK',
        'settlementDestination': 'bank_account_123',
        'description': 'Mobile App Development - 4 Milestones',
        'metadata': {
            'projectType': 'mobile_app',
            'platform': 'iOS_Android',
            'clientId': 'CLIENT-890'
        },
        'deliveryPeriod': 10368000,  # 120 days
        'autoRelease': False
    }
    
    intent = api_request('/payment-intents', 'POST', intent_data)
    print(f'Project Created: {intent["id"]}')
    return intent

def create_app_milestones(intent_id):
    """Create milestones for mobile app development"""
    milestones = [
        {
            'milestoneIndex': 0,
            'description': 'UI/UX Design & Prototyping',
            'amount': '1000.00',
            'percentage': 20
        },
        {
            'milestoneIndex': 1,
            'description': 'Core App Development',
            'amount': '2000.00',
            'percentage': 40
        },
        {
            'milestoneIndex': 2,
            'description': 'Testing & Bug Fixes',
            'amount': '1500.00',
            'percentage': 30
        },
        {
            'milestoneIndex': 3,
            'description': 'App Store Deployment',
            'amount': '500.00',
            'percentage': 10
        }
    ]
    
    created_milestones = []
    for milestone_data in milestones:
        milestone = api_request(
            f'/payment-intents/{intent_id}/escrow/milestones',
            'POST',
            milestone_data
        )
        created_milestones.append(milestone)
        print(f'Milestone {milestone_data["milestoneIndex"]} created: {milestone["id"]}')
    
    return created_milestones

def complete_milestone(intent_id, milestone_id, completion_data):
    """Complete a milestone with proof"""
    # Generate completion proof
    proof_data = {
        'milestoneId': milestone_id,
        'completedAt': datetime.now().isoformat(),
        'deliverables': completion_data['deliverables'],
        'testResults': completion_data.get('testResults', [])
    }
    
    proof_hash = hashlib.sha256(
        json.dumps(proof_data, sort_keys=True).encode()
    ).hexdigest()
    
    completion_request = {
        'completionProof': f'0x{proof_hash}',
        'completionProofURI': f'https://project-deliverables.example.com/{milestone_id}',
        'completedBy': '0x742d35Cc6634C0532925a3b844Bc9e7595f42318'
    }
    
    result = api_request(
        f'/payment-intents/{intent_id}/escrow/milestones/{milestone_id}/complete',
        'POST',
        completion_request
    )
    
    print(f'Milestone {milestone_id} completed: {result["status"]}')
    return result

def monitor_project_progress(intent_id):
    """Monitor overall project progress"""
    escrow = api_request(f'/payment-intents/{intent_id}/escrow')
    
    print('\\nProject Progress:')
    print(f'Order Status: {escrow["data"]["orderStatus"]}')
    print(f'Settlement Status: {escrow["data"]["settlementStatus"]}')
    
    if 'milestones' in escrow['data']:
        print('\\nMilestone Status:')
        for milestone in escrow['data']['milestones']:
            print(f'  {milestone["milestoneIndex"]}: {milestone["description"]} - {milestone["status"]}')
    
    return escrow

# Example usage
if __name__ == '__main__':
    # Create project
    intent = create_milestone_project()
    
    # Create milestones
    milestones = create_app_milestones(intent['id'])
    
    # Simulate milestone completions
    milestone_completions = [
        {
            'deliverables': ['design_mockups.pdf', 'user_flow.png', 'prototype_link.txt'],
            'testResults': ['user_testing_results.pdf']
        },
        {
            'deliverables': ['app_source_code.zip', 'api_integration.md'],
            'testResults': ['unit_tests.xml', 'integration_tests.xml']
        },
        {
            'deliverables': ['test_report.pdf', 'bug_fixes.md'],
            'testResults': ['qa_testing_results.pdf', 'performance_tests.pdf']
        },
        {
            'deliverables': ['app_store_links.txt', 'deployment_guide.md'],
            'testResults': ['store_approval.pdf']
        }
    ]
    
    # Complete milestones sequentially
    for i, (milestone, completion_data) in enumerate(zip(milestones, milestone_completions)):
        print(f'\\nCompleting milestone {i}...')
        complete_milestone(intent['id'], milestone['id'], completion_data)
        
        # Monitor progress
        monitor_project_progress(intent['id'])
        
        # Wait between milestones (simulate real project timeline)
        if i < len(milestones) - 1:
            print(f'Waiting for next milestone...')
            time.sleep(2)
    
    print('\\nProject completed!')
```

## Key Features

### **Milestone Structure**
- **Index-based ordering**: Milestones are created with sequential indices
- **Percentage allocation**: Define what percentage of total payment each milestone represents
- **Flexible amounts**: Set specific amounts for each milestone
- **Rich descriptions**: Add detailed descriptions for each milestone

### **Completion Proof**
- **Hash-based verification**: Generate cryptographic proof of milestone completion
- **URI storage**: Link to external storage for detailed deliverables
- **Completion tracking**: Track who completed each milestone and when

### **Project Monitoring**
- **Real-time status**: Monitor overall project and individual milestone status
- **Settlement tracking**: Track when funds are released for each milestone
- **Audit trail**: Complete history of milestone completions and payments

## Best Practices

### **Milestone Planning**
1. **Clear deliverables**: Define specific, measurable deliverables for each milestone
2. **Reasonable percentages**: Ensure milestone percentages add up to 100%
3. **Sequential completion**: Design milestones to be completed in logical order
4. **Buffer time**: Allow adequate time between milestones for review and approval

### **Proof Management**
1. **Detailed documentation**: Include comprehensive proof of work completion
2. **External storage**: Use reliable external storage for large deliverables
3. **Version control**: Maintain version history of deliverables
4. **Client approval**: Implement client review and approval process

### **Risk Management**
1. **Dispute handling**: Plan for potential disputes and resolution processes
2. **Scope changes**: Handle scope changes through milestone modifications
3. **Timeline management**: Set realistic timelines with buffer periods
4. **Quality assurance**: Implement quality checks before milestone completion

## Related Endpoints

- [Create Milestone](../api-reference/milestones/create.md)
- [Complete Milestone](../api-reference/milestones/complete.md)
- [Get Escrow Order](../api-reference/conditional-payments/get.md)
- [Milestone Payments Guide](../guides/payment-flows/milestone-payments.md)
