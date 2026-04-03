# Open-Source API Demo Application

A lightweight, boilerplate frontend built with **Vite + React (TypeScript)** to demonstrate how seamlessly client-side applications can integrate with the main SaaS Platform's API Gateway. 

This repository serves as a reference implementation for **Auth as a Service (AaaS)** and **Dynamic Schema LLM Fetching**.

## ✨ What Does This Demo Do?

- **End-to-End Authentication:** Demonstrates how to securely log in or register end-users directly through the SaaS platform using `axios` and `X-API-KEY` proxying.
- **JWT Storage:** Exhibits best practices for saving the retrieved JSON Web Token (`jeyson_jwt`) into \`localStorage\`.
- **Protected API Calls:** Shows how to query the SaaS platform LLM gateways (like \`/sentiment-analysis\`) securely by attaching the JWT Bearer Token in headers.
- **Origin Whitelisting Security:** Acts as a safe testing ground for public schemas that rely entirely on Origin and Bundle ID headers validated seamlessly by your central workspace.

## 🛠 Tech Stack

- **Framework:** Vite + React (TypeScript)
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS + Lucide React Icons
- **HTTP Client:** Axios
- **Notifications:** Sonner

## 🚀 Getting Started

### 1. Environment Configuration

Create a `.env` file at the root of the repository and add your Developer credentials retrieved from your running SaaS Dashboard Server:

```env
# ==== SAAS API GATEWAY ====
# The local or production URL of the API gateway
VITE_API_BASE_URL=http://localhost:3000/api/v1
# Find this in your SaaS Dashboard
VITE_WORKSPACE_ID=your_workspace_id_here
# Generate/Find this in your SaaS Dashboard Settings
VITE_API_KEY=your_workspace_api_key_here

# ==== OAUTH INTEGRATION (OPTIONAL) ====
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
VITE_APPLE_CLIENT_ID="your_apple_client_id"

# ==== FIREBASE CLIENT SDK ====
# Required for native Google/Apple Web SSO popups
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_FIREBASE_MEASUREMENT_ID=""
```

### 2. Installation

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Navigate to \`http://localhost:5173\`. You should immediately be greeted by the Login portal securely tunneling credentials directly backward into your SaaS Platform instance. 

---

*Note: For the Dashboard analyzer to work properly in this demo, ensure a schema named `sentiment-analysis` is actively generated inside your SaaS Platform dashboard!*
