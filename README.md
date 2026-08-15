# OFF MESH.
### Offline UPI Mesh Payment Engine

> Send payments with **zero internet** at point of sale. Encrypted payment packets gossip phone-to-phone over a simulated Bluetooth mesh until a 4G bridge node walks outside and settles them — atomically, exactly once.

---

## 🏗 Architecture Overview

```
┌─────────────┐     Bluetooth Gossip      ┌─────────────┐
│  phone-alice │ ─────────────────────────▶│  phone-bob  │
│  (Sender)    │                           │  (Relay)    │
└──────┬───────┘                           └──────┬──────┘
       │                                          │
       │  RSA-2048 + AES-GCM                      │  TTL Decrement
       │  Encrypted Packet                        │
       ▼                                          ▼
┌─────────────┐                           ┌─────────────┐
│ phone-carol │                           │  phone-dave │
│  (Relay)    │ ─────────────────────────▶│  (Relay)    │
└─────────────┘                           └──────┬──────┘
                                                 │
                                    4G Signal ▼  │
                                         ┌───────┴──────┐
                                         │ phone-bridge │
                                         │ (4G Bridge)  │
                                         └──────┬───────┘
                                                │ HTTP POST
                                                ▼
                                         ┌─────────────┐
                                         │ Spring Boot │
                                         │  Backend    │
                                         │  + H2 DB    │
                                         └─────────────┘
```

---

## ✨ Key Features

| Feature | Implementation |
|---|---|
| **Offline Payment Routing** | Bluetooth mesh gossip simulation with TTL hop limit |
| **Hybrid Encryption** | RSA-2048 public key wraps an AES-256-GCM session key |
| **Idempotent Settlement** | `SETNX`-style in-memory cache prevents double-spending on duplicate uploads |
| **Deferred Settlement** | Bridge node uploads held packets the moment it regains 4G |
| **Interactive Demo Frontend** | React + Vite SPA with live mesh topology visualizer |
| **Live Payment Lifecycle Tracker** | Animated progress bar: Inject → Gossip → Upload → Settled |
| **Sliding Step Wizard** | Step-by-step pipeline UI (Compose → Gossip → Flush → Reset) |

---

## 🛠 Tech Stack

### Backend
- **Java 17** + **Spring Boot 3**
- **H2** in-memory relational database (auto-seeded accounts)
- **RSA-2048 / AES-256-GCM** hybrid encryption (`javax.crypto`)
- Maven Wrapper (`mvnw`)

### Frontend
- **React 18** + **Vite**
- **Framer Motion** — physics-based micro-animations
- **Recharts** — gossip propagation area chart
- **Lucide React** — icon set

---

## 🚀 Running Locally

You need **two terminals** running simultaneously.

### Terminal 1 — Spring Boot Backend

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Mac / Linux
./mvnw spring-boot:run
```

Backend starts at → `http://localhost:8080`

> 💡 **IntelliJ shortcut**: Open `UpiMeshApplication.java` and click the green ▶ **Run** button next to the `main` method.

---

### Terminal 2 — React Frontend

```bash
cd frontend
npm install      # first time only
npm run dev
```

Frontend starts at → `http://localhost:5173`

---

## 📂 Project Structure

```
UPI_Without_Internet/
├── src/
│   └── main/
│       ├── java/com/demo/upimesh/
│       │   ├── UpiMeshApplication.java      # Spring Boot entry point
│       │   ├── controller/ApiController.java # REST API endpoints
│       │   ├── service/DemoService.java      # Mesh simulation logic
│       │   ├── model/                        # Entities (Account, Transaction, MeshPacket)
│       │   └── crypto/CryptoService.java     # RSA-2048 + AES-GCM hybrid encryption
│       └── resources/
│           ├── application.properties
│           └── data.sql                      # Seed data (alice, bob, carol, dave)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx   # Hero landing page
│   │   │   ├── DemoControls.jsx  # Step wizard (01→02→03→04)
│   │   │   ├── MeshGraph.jsx     # SVG mesh topology visualizer
│   │   │   ├── AccountCards.jsx  # Balance cards with red disc graphics
│   │   │   ├── PaymentProgress.jsx # Lifecycle progress bar
│   │   │   ├── GossipChart.jsx   # Propagation area chart
│   │   │   ├── TxLedger.jsx      # Settled transaction table
│   │   │   ├── ActivityLog.jsx   # Real-time event terminal
│   │   │   ├── Toast.jsx         # Notification toasts
│   │   │   └── Header.jsx        # App header
│   │   ├── api/index.js          # API fetch wrappers (proxied to :8080)
│   │   ├── App.jsx               # Root component + state orchestration
│   │   └── App.css               # Global design system tokens
│   ├── vite.config.js            # Proxy config (/api → localhost:8080)
│   └── package.json
│
├── pom.xml
└── README.md
```

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/server-key` | Fetch RSA public key info |
| `GET` | `/api/accounts` | Get all accounts + balances |
| `GET` | `/api/transactions` | Get settled transactions |
| `GET` | `/api/mesh/state` | Get current device packet counts |
| `POST` | `/api/demo/send` | Inject encrypted payment into mesh |
| `POST` | `/api/demo/gossip` | Run one gossip propagation round |
| `POST` | `/api/demo/flush` | Simulate bridge upload & settle |
| `POST` | `/api/demo/reset` | Wipe mesh packets + cache |

---

## 🔐 How the Encryption Works

```
1. Client sends:  { senderVpa, receiverVpa, amount, pin }
                                    ↓
2. Backend generates random AES-256-GCM session key
                                    ↓
3. Payment JSON encrypted with AES-GCM → ciphertext
                                    ↓
4. Session key encrypted with server RSA-2048 public key → wrappedKey
                                    ↓
5. MeshPacket = { packetId, ciphertext, wrappedKey, iv, ttl }
                                    ↓
6. Packet injected at phone-alice, gossiped hop-by-hop
                                    ↓
7. On flush: Bridge decrypts with RSA private key → AES key → plaintext → settle
```

---

## 🎨 Frontend Design

- **Theme**: Swiss editorial + Material iOS aesthetic
- **Colors**: Vermilion Red `#c84028` · Ink Black `#111111` · Warm Bone `#e5e3dd`
- **Fonts**: Space Grotesk (display) · Inter (body) · JetBrains Mono (code)
- **Landing Page**: Full-bleed red gradient hero with floating payment cards and `MAKE PAYMENT` CTA

---

## 👤 Demo Accounts (Auto-seeded)

| VPA | Holder | Starting Balance |
|---|---|---|
| `alice@demo` | Alice | ₹10,000 |
| `bob@demo` | Bob | ₹5,000 |
| `carol@demo` | Carol | ₹7,500 |
| `dave@demo` | Dave | ₹3,000 |

---

## 📌 Notes

- This is a **simulation** — no real Bluetooth or actual UPI network is used.
- The H2 database resets on every backend restart.
- The idempotency cache lives in JVM memory — it also resets on restart.
- The `phone-bridge` node is the only one with simulated internet access.

---

*Built with ❤️ — OFF MESH.*
