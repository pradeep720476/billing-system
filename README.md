# Subscription Billing-System

A microservice-based subscription billing system build with NestJS, PostgreSQL and Docker Compose.

## **Services**

- **Billing Service**: Manages Users, Plans, Subscriptions and webhooks.
- **Simulated Payment Gateway**: Initiates payments and sends webhook callbacks.

## Arcitecture & Flow

```bash
Client → Billing API → Payment Gateway → (Webhook + X-Signature) → Billing updates subscription

```

## **Setup Instructions**

### **Prerequisites**

- Docker & Docker Compose
- Free ports **3001** and **3002**

### **Steps**

```bash
git clone <>
cd billing-system
docker compose up --build
```

**Billing Swagger**: [http://localhost:3002/swagger/api](http://localhost:3002/swagger/api)\
**Gateway Swagger**: [http://localhost:3001/swagger/api](http://localhost:3001/swagger/api)

1. **User registers/logs in.**
2. **User selects a plan and subscribes.**
3. **Billing service calls Gateway to initiate payment.**
4. **Gateway simulates payment result and sends webhook.**
5. **Billing verifies signature and updates subscription status.**

## **Sample Payloads**

### **Login With User Email or Phone Number**

```json
{
  "username": "user@billsystem.com",
  "password": "user@2025"
}
```

### **Get All Seeded Plans**

```json
 url: http://localhost:3002/billing/v1/plans/search?page=1&limit=10
 {
  "page": 1,
  "limit": 10,
  "total": 2,
  "totalPages": 1,
  "items": [
    {
      "id": <generated uuid>,
      "name": "Basic Plan",
      "price": 199,
      "billingCycle": "MONTHLY",
      "features": [
        "1 project",
        "Email support"
      ],
      "status": "ACTIVE",
      "trialDays": 7
    },
    {
      "id": <generated uuid>,
      "name": "Pro Plan",
      "price": 499,
      "billingCycle": "YEARLY",
      "features": ["Feature 1", "Feature 2"],
      "status": "ACTIVE",
      "trialDays": 14
    }
  ]
}
```

### **Subscribe to Plan**

```json
{
  "autoRenew": true,
  "startDate": "08252025",
  "trialDays": 0,
  "planId": <uuid>(Basic Plan from above fetched plans),
  "paymentMethod": "CREDIT"
}
```

### **Change Plan**

```json
{
  "planId": <uuid>(Premium Plan from above fetched plabs)
}
```

### **Cancel Subscription**

```bash
http://localhost:3002/billing/v1/subscriptions/<uuid>/cancel
```

### **Login with Admin User**

```json
{
  "username": "admin@billsystem.com",
  "password": "admin@2025"
}
```

### **Create Plan**

```json
{
  "name": "Gold Plan",
  "price": 299,
  "billingCycle": "QUATERLY",
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "status": "ACTIVE",
  "trialDays": 0
}
```

## **Deployment Notes**

- **Use versioned Docker images.**
- **Deploy with Kubernetes/ECS and HTTPS.**
- **Store secrets securely (AWS Secrets Manager, Vault).**
- **Use managed PostgreSQL with backups.**
- **Add monitoring and alerts for webhook failures.**

## **Time Spent & Trade-offs**

**Time Spent:**

- ~30 hours for design, develop of **billing-service** api.
- ~8 hours hours design, develop of **payment-gateway** api.
- ~4 hours test cases.
- ~3 hours for swagger integration **billing-service payment-gateway**
- ~3 hours docs.

**Assumptions:**

- **All price of plans are without currency**

**Trade-offs:**

- **No broker; webhooks over HTTP for simplicity.**
- **Minimal RBAC to focus on core subscription logic.**
- **HMAC Signature**(x-signature) validation of authentication between billing service and gateway service\*\*
- **JWT Authentication** Client to Service API
- **API KEY** for gateway authentication
