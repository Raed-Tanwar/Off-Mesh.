# OFF MESH.
### Offline UPI Mesh Payment Engine

<br/>

> **The problem**: 40% of India has unreliable or zero internet at point of sale.
> UPI is the world's most advanced payment rail — but it requires a live 4G connection for every transaction.
>
> **OFF MESH** solves this. Payment packets are RSA-2048 encrypted, injected into a peer-to-peer Bluetooth mesh, and gossip hop-by-hop between nearby phones. The moment any device in the mesh regains 4G, it acts as a bridge — uploading all held packets to the settlement server atomically, exactly once, with full idempotency protection against double-spending.

<br/>

---

## 📖 Table of Contents

- [How It Works](#-how-it-works)
- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [Security Model](#-security-model)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Running Locally](#-running-locally)
- [REST API Reference](#-rest-api-reference)
- [Demo Walkthrough](#-demo-walkthrough)
- [Demo Accounts](#-demo-accounts)
- [Frontend Design System](#-frontend-design-system)
- [Real-World Path](#-real-world-path)
- [Notes & Limitations](#-notes--limitations)

---

## 💡 How It Works

The system models five phones in a mesh. Only one of them (`phone-bridge`) has a 4G connection. The other four operate entirely offline.

```
STEP 1 — COMPOSE
  Alice wants to pay Bob ₹500. She opens the app and enters the payment details.
  Her phone has NO internet. There is no server to call.

STEP 2 — ENCRYPT & INJECT
  The payment is encrypted using a hybrid RSA-2048 + AES-256-GCM scheme.
  A unique AES session key encrypts the payment payload.
  The server's RSA-2048 public key wraps the session key.
  The resulting MeshPacket (ciphertext + wrapped key + IV + TTL) is injected
  at phone-alice — Alice's device now holds the packet in memory.

STEP 3 — GOSSIP
  Phones periodically broadcast their packet inventory to nearby devices over
  Bluetooth. When bob's phone hears alice's broadcast, it copies the packet.
  This is the gossip round. Each round, more devices in the mesh hold the packet.
  Each hop decrements the TTL (Time To Live) — preventing infinite propagation.

STEP 4 — BRIDGE UPLOAD
  phone-bridge wanders into a 4G zone. It detects connectivity, scans its local
  packet store, and HTTP POSTs every held packet to the Spring Boot settlement server.

STEP 5 — IDEMPOTENT SETTLEMENT
  The server receives the packet. It checks an in-memory idempotency cache
  (keyed by packetId SHA-256 hash) — if this exact packet was already settled,
  it is silently dropped. DUPLICATE_DROPPED. No double-spend.
  If the packet is new, the server decrypts it (RSA private key → AES key → plaintext),
  validates the PIN, debits Alice's account, credits Bob's account, and writes
  a settlement record to the H2 database. SETTLED.
```

This entire flow works even if Alice's phone never touches the internet. As long as one device in the mesh eventually reaches 4G, the payment settles.

---

## 🏗 Architecture Overview

```
╔══════════════════════════════════════════════════════════════════════╗
║                        OFFLINE MESH ZONE                            ║
║                                                                      ║
║  ┌─────────────┐    Gossip (BLE)    ┌─────────────┐                 ║
║  │ phone-alice │ ─────────────────▶ │  phone-bob  │                 ║
║  │  (Sender)   │                    │   (Relay)   │                 ║
║  └──────┬──────┘                    └──────┬──────┘                 ║
║         │                                  │                         ║
║         │ RSA-2048 + AES-256-GCM           │ TTL Decrement          ║
║         │ Encrypted MeshPacket             │                         ║
║         ▼                                  ▼                         ║
║  ┌─────────────┐                    ┌─────────────┐                 ║
║  │ phone-carol │ ─────────────────▶ │  phone-dave │                 ║
║  │   (Relay)   │    Gossip (BLE)    │   (Relay)   │                 ║
║  └─────────────┘                    └──────┬──────┘                 ║
║                                            │                         ║
╚════════════════════════════════════════════╪════════════════════════╝
                                             │ 4G Signal Acquired
                                      ┌──────▼──────┐
                                      │phone-bridge │
                                      │ (4G Bridge) │
                                      └──────┬──────┘
                                             │ HTTP POST /api/demo/flush
                                             ▼
                              ╔══════════════════════════╗
                              ║     SETTLEMENT SERVER    ║
                              ║                          ║
                              ║  ┌────────────────────┐  ║
                              ║  │   Spring Boot 3    │  ║
                              ║  │   REST API Layer   │  ║
                              ║  └─────────┬──────────┘  ║
                              ║            │              ║
                              ║  ┌─────────▼──────────┐  ║
                              ║  │  Idempotency Cache │  ║
                              ║  │  (packetId → hash) │  ║
                              ║  └─────────┬──────────┘  ║
                              ║            │              ║
                              ║  ┌─────────▼──────────┐  ║
                              ║  │   CryptoService    │  ║
                              ║  │  RSA Decrypt →     │  ║
                              ║  │  AES Decrypt →     │  ║
                              ║  │  Plaintext Payment │  ║
                              ║  └─────────┬──────────┘  ║
                              ║            │              ║
                              ║  ┌─────────▼──────────┐  ║
                              ║  │     H2 Database    │  ║
                              ║  │  Accounts + TxLog  │  ║
                              ║  └────────────────────┘  ║
                              ╚══════════════════════════╝
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Offline Payment Routing** | Payment packets are stored and forwarded across mesh devices with a TTL hop limit — no internet required at point of sale |
| **Hybrid RSA + AES Encryption** | Each packet uses a fresh AES-256-GCM session key encrypted with the server's RSA-2048 public key — forward secrecy by design |
| **Idempotent Settlement** | A SHA-256 keyed in-memory cache prevents any packet from settling more than once, even if multiple bridge devices upload the same packet |
| **Replay Attack Protection** | Packets carry a creation timestamp; anything older than the configured `packet-max-age-seconds` window is rejected as a replay |
| **Live Mesh Topology Visualizer** | Physics-animated SVG node graph shows real-time packet propagation across all five mesh devices |
| **Payment Lifecycle Tracker** | Animated 4-stage progress bar (Injected → Gossiping → Uploading → Settled) updates in real time as you step through the demo |
| **Sliding Step Wizard** | Four-step UI (01 Compose → 02 Gossip → 03 Flush → 04 Reset) guides the user through the entire payment pipeline |
| **Gossip Propagation Chart** | Recharts area chart tracks how many devices hold the packet after each gossip round |
| **Stress Test Mode** | Toggle to run two extra gossip rounds before flushing — simulates a more saturated real-world mesh |
| **Settlement Ledger** | Full table of all settled transactions with sender VPA, receiver VPA, amount, and timestamp |
| **Activity Terminal** | Real-time scrollable log of all backend events, packet IDs, cipher previews, and settlement outcomes |

---

## 🔐 Security Model

### Hybrid Encryption (RSA-2048 + AES-256-GCM)

Using RSA alone to encrypt payment data is impractical — RSA can only encrypt small payloads and is slow. OFF MESH uses **hybrid encryption**, the same model used by TLS, PGP, and Signal:

```
┌─────────────────────────────────────────────────────────┐
│                    ENCRYPTION (at inject)               │
│                                                         │
│  Payment JSON ──▶ [AES-256-GCM] ──▶ Ciphertext         │
│                        ▲                                │
│                        │ Random Session Key             │
│                        │                                │
│  Session Key ──▶ [RSA-2048 Public Key] ──▶ Wrapped Key │
│                                                         │
│  MeshPacket = { ciphertext, wrappedKey, iv, ttl, id }  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   DECRYPTION (at settlement)            │
│                                                         │
│  Wrapped Key ──▶ [RSA-2048 Private Key] ──▶ Session Key│
│                                                         │
│  Ciphertext ──▶ [AES-256-GCM + Session Key] ──▶ JSON  │
│                                                         │
│  JSON ──▶ Validate PIN ──▶ Debit/Credit Accounts       │
└─────────────────────────────────────────────────────────┘
```

### Idempotency & Double-Spend Prevention

Because multiple bridge devices may upload the same packet, the server maintains an in-memory idempotency cache:

- On receipt, the server computes `SHA-256(packetId)`
- If the hash is already in the cache → `DUPLICATE_DROPPED`, no state change
- If not → decrypt, validate, settle, then write hash to cache
- Cache entries expire after `upi.mesh.idempotency-ttl-seconds` (default: 86400s / 24h)

### What is NOT protected (honest limitations)

- PIN is validated server-side post-decryption — not zero-knowledge
- RSA key pair is generated fresh in JVM memory on every server restart (no persistence)
- No mutual TLS between bridge and server in this demo

---

## 🛠 Tech Stack

### Backend

| Technology | Role |
|---|---|
| **Java 17** | Runtime |
| **Spring Boot 3** | REST API framework, dependency injection, application lifecycle |
| **Spring Data JPA** | ORM — maps `Account` and `Transaction` entities to H2 tables |
| **H2 Database** | In-memory relational DB, auto-seeded with four demo accounts on startup |
| **javax.crypto** | `RSAKey`, `AESKey`, `GCMParameterSpec` — standard Java crypto APIs |
| **Maven Wrapper** | Zero-install build tool, pinned to Maven 3.3.2 |

### Frontend

| Technology | Role |
|---|---|
| **React 18** | Component-based UI framework |
| **Vite** | Development server with HMR and production bundler |
| **Framer Motion** | Physics-based animations — mesh node movement, card entrances, progress bars |
| **Recharts** | SVG-based area chart for gossip propagation history |
| **Lucide React** | Lightweight icon library |
| **Space Grotesk** | Display typeface (headings, labels) |
| **Inter** | Body typeface (descriptions, logs) |
| **JetBrains Mono** | Monospace typeface (packet IDs, cipher previews, code) |

---

## 📂 Project Structure

```
UPI_Without_Internet/
│
├── src/
│   └── main/
│       ├── java/com/demo/upimesh/
│       │   ├── UpiMeshApplication.java       # Spring Boot entry point
│       │   ├── controller/
│       │   │   └── ApiController.java        # All REST endpoints (/api/*)
│       │   ├── service/
│       │   │   └── DemoService.java          # Core mesh simulation logic
│       │   │                                   (gossip, flush, idempotency)
│       │   ├── model/
│       │   │   ├── Account.java              # JPA entity — VPA + balance
│       │   │   ├── Transaction.java          # JPA entity — settlement record
│       │   │   └── MeshPacket.java           # In-memory packet (not persisted)
│       │   └── crypto/
│       │       └── CryptoService.java        # RSA-2048 keygen, AES-256-GCM
│       │                                       encrypt/decrypt
│       └── resources/
│           ├── application.properties        # Port, DB config, idempotency TTL
│           └── data.sql                      # Seed: alice, bob, carol, dave
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                       # Custom radio-wave logo
│   │   ├── robots.txt                        # SEO: crawler rules
│   │   └── sitemap.xml                       # SEO: sitemap
│   │
│   └── src/
│       ├── components/
│       │   ├── LandingPage.jsx               # Hero landing page with MAKE PAYMENT CTA
│       │   ├── Header.jsx                    # App header — logo, key info, refresh
│       │   ├── DemoControls.jsx              # 4-step sliding wizard
│       │   ├── MeshGraph.jsx                 # Animated SVG mesh topology
│       │   ├── AccountCards.jsx              # Balance cards with red disc graphics
│       │   ├── PaymentProgress.jsx           # 4-stage lifecycle progress bar
│       │   ├── GossipChart.jsx               # Recharts propagation area chart
│       │   ├── TxLedger.jsx                  # Settled transaction table
│       │   ├── ActivityLog.jsx               # Real-time event terminal
│       │   ├── Toast.jsx                     # Notification toasts
│       │   └── NotFound.jsx                  # 404 page
│       │
│       ├── api/
│       │   └── index.js                      # Fetch wrappers for all /api/* calls
│       │
│       ├── App.jsx                           # Root — state orchestration + view routing
│       ├── App.css                           # Global design system (tokens, layout)
│       └── index.css                         # CSS reset + root full-bleed setup
│
├── vite.config.js                            # Proxy /api → :8080, bundle splitting
├── pom.xml                                   # Maven dependencies
└── README.md
```

---

## 🚀 Running Locally

You need **two terminals** running simultaneously — one for the backend, one for the frontend.

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| Java JDK | 17+ | `java -version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |

---

### Terminal 1 — Spring Boot Backend

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Mac / Linux
./mvnw spring-boot:run
```

> 💡 **IntelliJ shortcut**: Open `UpiMeshApplication.java` → click the green **▶ Run** button next to the `main` method. No terminal needed.

Backend starts at → **`http://localhost:8080`**

You can verify it's running by visiting `http://localhost:8080/api/accounts` — you should see four demo accounts in JSON.

---

### Terminal 2 — React Frontend

```bash
cd frontend
npm install      # first time only — installs all dependencies
npm run dev
```

Frontend starts at → **`http://localhost:5173`**

The Vite dev server proxies all `/api/*` requests to `http://localhost:8080`, so the frontend and backend work seamlessly without CORS issues.

---

## 🔌 REST API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `GET` | `/api/server-key` | — | Returns RSA public key algorithm, key size, and modulus info |
| `GET` | `/api/accounts` | — | Returns all four demo accounts with current balances |
| `GET` | `/api/transactions` | — | Returns all settled transactions in reverse chronological order |
| `GET` | `/api/mesh/state` | — | Returns per-device packet counts + idempotency cache size |
| `POST` | `/api/demo/send` | `{ senderVpa, receiverVpa, amount, pin }` | Encrypts payload and injects a `MeshPacket` at `phone-alice` |
| `POST` | `/api/demo/gossip` | — | Runs one gossip round — propagates packets to neighbouring devices |
| `POST` | `/api/demo/flush` | — | Simulates bridge upload — decrypts and settles all held packets |
| `POST` | `/api/demo/reset` | — | Clears all mesh packets and idempotency cache |

### Example: Send a Payment

```bash
curl -X POST http://localhost:8080/api/demo/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderVpa": "alice@demo",
    "receiverVpa": "bob@demo",
    "amount": 500,
    "pin": "1234"
  }'
```

**Response:**
```json
{
  "packetId": "a3f8c2d1-...",
  "injectedAt": "phone-alice",
  "ttl": 5,
  "ciphertextPreview": "SGVsbG8gV29ybGQ..."
}
```

---

## 🎮 Demo Walkthrough

Here is the recommended order to experience the full payment lifecycle:

**Step 01 — Compose**
Fill in sender VPA (`alice@demo`), receiver VPA (`bob@demo`), amount (`500`), and PIN (`1234`). Click **Inject into Mesh**. Watch the mesh graph — `phone-alice` now holds the packet (node lights up). The lifecycle tracker shows **Injected**.

**Step 02 — Gossip**
Click **Run Gossip Round** one or more times. Each click propagates the packet to neighbouring devices. Watch nodes light up one-by-one on the graph. The gossip chart plots how many devices hold the packet after each round. The lifecycle tracker shows **Gossiping**.

**Step 03 — Flush**
Click **Bridge Upload & Settle**. The bridge node uploads all packets. Check the Activity Log — you will see either `SETTLED` (first time) or `DUPLICATE_DROPPED` (if you flush again). Account balances update in real time. The lifecycle tracker shows **Settled**.

**Step 04 — Reset**
Click **Reset Mesh** to clear all packets and the idempotency cache, ready for the next demo run.

---

## 👤 Demo Accounts

These four accounts are auto-seeded into the H2 database on every backend startup:

| VPA | Holder | Starting Balance |
|---|---|---|
| `alice@demo` | Alice | ₹10,000 |
| `bob@demo` | Bob | ₹5,000 |
| `carol@demo` | Carol | ₹7,500 |
| `dave@demo` | Dave | ₹3,000 |

Default PIN for all accounts: **`1234`**

---

## 🎨 Frontend Design System

The UI follows a **Swiss Editorial + Material iOS** design language:

| Token | Value | Usage |
|---|---|---|
| `--red` | `#c84028` | Primary brand, CTAs, active states |
| `--ink` | `#111111` | Dark backgrounds, text |
| `--bone` | `#e5e3dd` | Light backgrounds, card surfaces |
| `--muted` | `#888888` | Secondary text, labels |
| `--font-display` | Space Grotesk | Headings, step numbers, hero text |
| `--font-body` | Inter | Descriptions, card content |
| `--font-mono` | JetBrains Mono | Packet IDs, cipher previews, logs |

The landing page features a full-bleed vermilion red gradient hero with floating payment card mockups and a single `MAKE PAYMENT` call-to-action.

---

## 🌍 Real-World Path

This is a simulation, but every engineering concept maps directly to a production implementation:

| Demo Component | Real-World Equivalent |
|---|---|
| In-memory Java device objects | Android phones running a Kotlin BLE mesh SDK (e.g., Bridgefy, custom GATT) |
| Gossip round via REST API | Android Background Service scanning for nearby BLE devices |
| Manual bridge flush button | Android ConnectivityManager detecting 4G, triggering auto-upload |
| H2 in-memory database | PostgreSQL on AWS RDS / Railway |
| Demo VPAs | Real UPI VPAs via NPCI UPI Sandbox or RBI Regulatory Sandbox |
| Simulated TTL | Bluetooth RSSI signal strength as a natural hop gate |

The **NPCI Developer Portal** has a UPI sandbox available for registered fintech developers. The **RBI Regulatory Sandbox** has an active cohort for offline payment innovations.

---

## 📌 Notes & Limitations

- This is a **proof-of-concept simulation** — no real Bluetooth radio, no real UPI network, no real money moves.
- The H2 database is **in-memory** — all accounts and transactions reset on every backend restart.
- The RSA key pair is **generated fresh on startup** — it is not persisted to disk.
- The idempotency cache is **JVM in-memory** — it also resets on restart.
- `phone-bridge` is the **only device** with simulated internet access. All other devices are offline-only.
- PIN validation is **server-side** — the PIN travels encrypted inside the AES-GCM payload.

---

*
* OFF MESH.*
