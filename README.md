OFF MESH
Offline Mesh Payment Routing Prototype
Status: Proof of concept / simulation. Not connected to UPI, NPCI, a bank, Bluetooth hardware, or real money.

The problem
Digital payments often assume that every person at the point of sale has reliable mobile data. In practice, network coverage can be intermittent or unavailable in rural areas, during travel, at crowded events, and in disruption scenarios.

Off Mesh explores one part of an offline-payment design: how a payment intent can be created without internet, stored and relayed between nearby devices, then uploaded for central settlement when any participating device regains connectivity.

It does not replace UPI's production authorization, compliance, bank integration, or risk controls. It is an interactive engineering prototype for encrypted packet transport and eventual settlement.

What Off Mesh demonstrates
A sender creates a payment intent while offline.
The client encrypts that intent into a MeshPacket.
Nearby devices gossip/store/forward the packet with a hop limit.
A device that regains connectivity acts as a bridge and uploads held packets.
The settlement server verifies, decrypts, and processes a packet once.
The interface visualizes packet propagation, settlement events, balances, and the transaction ledger.
Demo flow
text

Alice (offline) creates a ₹500 payment for Bob
        │
        ▼
Encrypted MeshPacket injected at phone-alice
        │
        ▼
Nearby devices copy the packet during gossip rounds
        │
        ▼
phone-bridge obtains 4G and uploads held packets
        │
        ▼
Spring Boot settlement server validates and settles once
        │
        ▼
Alice is debited, Bob is credited, and the ledger is updated
Step-by-step
1. Compose
Alice enters a sender VPA, receiver VPA, amount, and demo PIN. Her phone does not call the server.

2. Encrypt and inject
The payment payload is encrypted locally with a fresh AES-256-GCM key. That AES key is wrapped with the settlement server's RSA-2048 public key. The resulting packet is stored on phone-alice.

3. Gossip
Simulated nearby devices exchange packet inventory. Each device stores packets it has not previously seen. Packet forwarding is bounded by a TTL (time to live) value.

4. Bridge upload
When phone-bridge has simulated connectivity, it uploads packets it holds to the settlement API.

5. Settle exactly once
The server identifies already-processed packet IDs, decrypts a new packet, validates the demo payment data, updates account balances, and records the transaction.

Architecture
text

                         OFFLINE MESH ZONE

 ┌─────────────┐       gossip / relay       ┌─────────────┐
 │ phone-alice │ ─────────────────────────▶ │  phone-bob  │
 │   sender    │                             │    relay    │
 └──────┬──────┘                             └──────┬──────┘
        │                                           │
        │ encrypted MeshPacket                      │ TTL-bounded copy
        ▼                                           ▼
 ┌─────────────┐       gossip / relay       ┌─────────────┐
 │ phone-carol │ ─────────────────────────▶ │ phone-dave  │
 │    relay    │                             │    relay    │
 └─────────────┘                             └──────┬──────┘
                                                    │
                                                    │ connectivity acquired
                                             ┌──────▼──────┐
                                             │phone-bridge │
                                             │  uploader   │
                                             └──────┬──────┘
                                                    │ POST /api/demo/flush
                                                    ▼
                                  ┌────────────────────────────────┐
                                  │       SETTLEMENT SERVER        │
                                  │                                │
                                  │  Spring Boot REST API          │
                                  │  packet de-duplication         │
                                  │  RSA unwrap + AES-GCM decrypt  │
                                  │  payment validation            │
                                  │  H2 accounts + transaction log │
                                  └────────────────────────────────┘
Security design
Hybrid encryption
Off Mesh uses envelope encryption for each payment packet:

text

Payment JSON ──AES-256-GCM──▶ ciphertext + authentication tag
                     ▲
                     │ fresh random AES key
                     │
AES key ──RSA-2048 public key──▶ wrapped AES key

MeshPacket = { packetId, ciphertext, wrappedKey, iv, ttl, createdAt }
At settlement, the server uses its RSA private key to unwrap the AES key and uses AES-GCM to authenticate and decrypt the payment payload.

Why hybrid encryption?
RSA is not appropriate for encrypting arbitrary payment payloads directly. AES-GCM efficiently encrypts the payload and detects ciphertext tampering, while RSA protects the one-time AES data key for the settlement server.

Important cryptographic note
A fresh AES key per packet is good key separation, but this design does not provide forward secrecy. If an attacker captures old packets and later compromises the server's long-term RSA private key, they could decrypt the wrapped AES keys and read those old packets. Forward secrecy requires an ephemeral key-agreement design such as ECDHE and a production key-management architecture.

Authentication requirements for a real system
Encryption alone does not prove that a legitimate payer authorized a payment. A production design would additionally require device-bound credentials and a digital signature over a canonical payment intent, plus issuer-side authorization, anti-fraud controls, and key revocation.

Metadata that influences security—such as packet ID, timestamp, amount, receiver, TTL, and protocol version—should be protected either inside the AES-GCM plaintext or as authenticated additional data (AAD).

Duplicate handling and settlement semantics
Multiple relays can carry and upload the same packet. The demo therefore uses a packet identifier to prevent the same packet from being applied repeatedly.

text

packet received
   │
   ├─ packet ID already processed ──▶ DUPLICATE_DROPPED
   │
   └─ packet ID is new
          │
          ▼
      decrypt → validate → debit → credit → record settlement
In the current simulation, this protection uses an in-memory idempotency cache keyed from the packet ID hash. It demonstrates duplicate packet handling, but a production deployment must use a durable, atomic mechanism—typically a database unique constraint plus a single transaction covering the idempotency record, balance updates, and transaction record.

What this does not solve
Duplicate suppression is not the same as complete offline double-spend prevention. A malicious or compromised offline wallet could create multiple different payment packets before a server can check the available balance. Real offline payment systems need capped offline balances, one-time issuer-signed value tokens, secure hardware/device counters, sequence rules, risk limits, and reconciliation policy.

Features
Feature	Description
Offline packet creation	Creates a payment intent without a server call at point of creation.
Hybrid encryption	Encrypts the intent with AES-256-GCM and wraps the AES key using RSA-2048.
Mesh gossip simulation	Models store-and-forward propagation between nearby devices.
TTL hop limit	Limits packet propagation and prevents indefinite circulation.
Bridge upload	Simulates a device uploading packets after it regains connectivity.
Duplicate packet handling	Suppresses repeat processing of a previously settled packet ID.
Replay-age check	Rejects packets older than the configured maximum age.
Mesh topology visualizer	Animated SVG graph of device state and packet propagation.
Lifecycle tracker	Shows Injected → Gossiping → Uploading → Settled status.
Gossip chart	Shows the number of devices holding a packet per round.
Settlement ledger	Displays settled demo transactions and current balances.
Activity terminal	Displays packet, mesh, upload, and settlement events.
Stress mode	Adds additional gossip rounds before bridge upload.
Technology stack
Backend
Technology	Purpose
Java 17	Runtime
Spring Boot 3	REST API and application framework
Spring Data JPA	Persistence mapping
H2	In-memory demo database
Java Cryptography Architecture	RSA key generation and AES-GCM encryption/decryption
Maven Wrapper	Build tooling
Frontend
Technology	Purpose
React 18	UI composition and state management
Vite	Development server and bundler
Framer Motion	UI and graph animation
Recharts	Gossip-propagation chart
Lucide React	Icons
Space Grotesk, Inter, JetBrains Mono	Display, body, and monospace typography
Project structure
text

UPI_Without_Internet/
├── src/
│   └── main/
│       ├── java/com/demo/upimesh/
│       │   ├── UpiMeshApplication.java       # Spring Boot entry point
│       │   ├── controller/
│       │   │   └── ApiController.java        # /api REST endpoints
│       │   ├── service/
│       │   │   └── DemoService.java          # mesh, gossip, flush, duplicate logic
│       │   ├── model/
│       │   │   ├── Account.java              # JPA account entity
│       │   │   ├── Transaction.java          # JPA settlement entity
│       │   │   └── MeshPacket.java           # in-memory packet model
│       │   └── crypto/
│       │       └── CryptoService.java        # RSA + AES-GCM operations
│       └── resources/
│           ├── application.properties        # application configuration
│           └── data.sql                      # demo account seed data
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── src/
│       ├── api/index.js                      # API fetch wrappers
│       ├── components/
│       │   ├── LandingPage.jsx
│       │   ├── Header.jsx
│       │   ├── DemoControls.jsx
│       │   ├── MeshGraph.jsx
│       │   ├── AccountCards.jsx
│       │   ├── PaymentProgress.jsx
│       │   ├── GossipChart.jsx
│       │   ├── TxLedger.jsx
│       │   ├── ActivityLog.jsx
│       │   ├── Toast.jsx
│       │   │   └── NotFound.jsx
│       ├── App.jsx
│       ├── App.css
│       └── index.css
├── vite.config.js                            # /api proxy to backend
├── pom.xml
└── README.md
Run locally
Prerequisites
Dependency	Version
Java JDK	17+
Node.js	18+
npm	9+
1. Start the backend
From the repository root:

Bash

# macOS / Linux
./mvnw spring-boot:run

# Windows
.\mvnw.cmd spring-boot:run
The backend starts on http://localhost:8080.

Verify it with:

Bash

curl http://localhost:8080/api/accounts
2. Start the frontend
In a second terminal:

Bash

cd frontend
npm install
npm run dev
Open the Vite URL shown in your terminal, normally http://localhost:5173.

During development, Vite proxies /api/* requests to the Spring Boot server on port 8080.

API reference
All endpoints are prefixed with /api.

Method	Endpoint	Request body	Purpose
GET	/api/server-key	—	Returns public-key metadata for the demo server.
GET	/api/accounts	—	Returns current demo account balances.
GET	/api/transactions	—	Returns settled transactions, newest first.
GET	/api/mesh/state	—	Returns packet counts per simulated device and duplicate-cache state.
POST	/api/demo/send	{ senderVpa, receiverVpa, amount, pin }	Encrypts a payment and injects it at phone-alice.
POST	/api/demo/gossip	—	Runs one mesh gossip round.
POST	/api/demo/flush	—	Uploads bridge-held packets and attempts settlement.
POST	/api/demo/reset	—	Clears demo mesh state and the in-memory duplicate cache.
Create a demo payment
Bash

curl -X POST http://localhost:8080/api/demo/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderVpa": "alice@demo",
    "receiverVpa": "bob@demo",
    "amount": 500,
    "pin": "1234"
  }'
Example response:

JSON

{
  "packetId": "a3f8c2d1-...",
  "injectedAt": "phone-alice",
  "ttl": 5,
  "ciphertextPreview": "..."
}
Demo walkthrough
Compose — Use alice@demo, bob@demo, 500, and PIN 1234, then select Inject into Mesh.
Gossip — Run one or more gossip rounds. Observe packet ownership spreading through the mesh graph and the propagation chart.
Flush — Select Bridge Upload & Settle. The bridge uploads its packets; watch the terminal and ledger for SETTLED or DUPLICATE_DROPPED.
Reset — Clear mesh state and repeat the scenario.
Demo accounts
VPA	Holder	Starting balance
alice@demo	Alice	₹10,000
bob@demo	Bob	₹5,000
carol@demo	Carol	₹7,500
dave@demo	Dave	₹3,000
Demo PIN for every account: 1234

These accounts, PINs, and balances exist only in the local simulation.

UI design system
The interface uses a Swiss-editorial and Material-inspired visual system.

Token	Value	Use
--red	#c84028	Brand, primary actions, active states
--ink	#111111	Primary text and dark surfaces
--bone	#e5e3dd	Light surfaces
--muted	#888888	Secondary text and labels
Display font	Space Grotesk	Headings and step labels
Body font	Inter	Descriptions and interface copy
Mono font	JetBrains Mono	Packet IDs, cipher previews, event logs
Production path
The prototype maps individual concepts to possible production components, but a real deployment requires much more than replacing the database or adding Bluetooth.

Prototype	Possible production direction
In-memory device objects	Android/iOS local encrypted stores and BLE/Wi-Fi Direct transport
REST-triggered gossip	Background nearby-device discovery and policy-driven relay service
Manual bridge flush	Connectivity monitoring with durable retry queue
H2 in-memory database	PostgreSQL or another durable transactional database
In-memory idempotency cache	Unique idempotency record within the settlement transaction
Demo VPA/accounts	Regulated issuer/payment-network integration and formal authorization flows
Plain demo PIN validation	Network-compliant, hardware-backed credential verification
Per-packet RSA wrapping	Production KMS/HSM-backed envelope encryption and key rotation
A real offline payment product must also address regulations, KYC/AML obligations, consent, data retention, dispute resolution, fraud monitoring, device compromise, merchant risk, interoperability, and payment-network certification.

Limitations
This is a simulation: there is no real Bluetooth mesh, UPI rail, NPCI integration, bank, merchant acquirer, or movement of money.
The H2 database is in memory, so accounts and transactions reset on backend restart.
The RSA key pair is generated in JVM memory on startup and is not persisted or managed by a KMS/HSM.
Duplicate handling is in JVM memory and resets on restart; it is not sufficient for a distributed production deployment.
The mesh topology and connectivity event are simulated; there is no radio discovery, packet persistence on actual phones, or real network retry queue.
The demo PIN is not a production-grade payment PIN implementation.
Encryption protects packet confidentiality in transit but does not by itself establish payer authorization.
The design does not fully prevent creation of multiple distinct offline payment intents before online settlement.
Settlement remains centrally authoritative: an offline packet is a request for later settlement, not a guarantee that funds were reserved when it was created.
Suggested next steps
Persist packets and settlement state in a durable database.
Make packet deduplication and balance updates a single atomic transaction.
Add database constraints and optimistic locking to account updates.
Add signed, canonical payment intents and device-bound keys.
Persist and rotate server keys through a proper key-management service.
Add explicit outcomes for expiry, invalid signature, invalid recipient, insufficient funds, duplicate, tampering, and TTL exhaustion.
Model offline risk controls: transaction caps, wallet quotas, sequence numbers, and reconciliation rules.
Build a mobile transport proof of concept using BLE or Wi-Fi Direct with encrypted local storage and retry logic.
Add unit and integration tests for crypto, replay checks, duplicate races, concurrent settlement, and mesh propagation.


Disclaimer
Off Mesh is an educational prototype. Do not use it to process real payments, transmit real payment credentials, or make claims of UPI compatibility or regulatory approval.
