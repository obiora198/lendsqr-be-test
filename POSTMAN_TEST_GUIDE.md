# Demo Credit - Postman Testing Guide

This guide provides all the API endpoints and sample payloads to test the Demo Credit Wallet Service.

**Base URL**: `http://localhost:3000/api/v1`

---

## 1. Authentication & Onboarding

### Register User
*   **Method**: `POST`
*   **URL**: `{{BASE_URL}}/auth/register`
*   **Payload**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "bvn": "12345678901",
  "password": "Password123!"
}
```
> **Note**: For testing, registration will succeed even if the Email/BVN is on the Karma blacklist, but a `compliance` report will be included in the response.

### Login
*   **Method**: `POST`
*   **URL**: `{{BASE_URL}}/auth/login`
*   **Payload**:
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```
> **Action**: Copy the `token` from the response. You will need it for all subsequent requests.

---

## 2. Wallet Operations
*All requests below require the Header: `Authorization: Bearer <YOUR_TOKEN>`*

### Fund Wallet
*   **Method**: `POST`
*   **URL**: `{{BASE_URL}}/wallet/fund`
*   **Payload**:
```json
{
  "amount": 5000
}
```

### Transfer Funds
*   **Method**: `POST`
*   **URL**: `{{BASE_URL}}/wallet/transfer`
*   **Payload**:
```json
{
  "receiverEmail": "receiver@example.com",
  "amount": 1500
}
```
> **Note**: You must register a second user first to use their email as the receiver.

### Withdraw Funds
*   **Method**: `POST`
*   **URL**: `{{BASE_URL}}/wallet/withdraw`
*   **Payload**:
```json
{
  "amount": 1000
}
```

---

## 3. Account Management

### Get User Balance
*   **Method**: `GET`
*   **URL**: `{{BASE_URL}}/wallet/balance`

---

## Testing Tips
1.  **Authorization**: In Postman, go to the **Auth** tab, select **Bearer Token**, and paste your login token there.
2.  **Transaction Safety**: All financial operations use database transactions. If you try to transfer more than you have, the API will return a `400 Bad Request` and no money will be deducted.
3.  **Karma Lookup**: Check the registration response to see the `compliance` field. It will show you exactly what the Adjutor API returned for that user's identity.
