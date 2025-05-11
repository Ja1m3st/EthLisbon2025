# DeFi Analytics Platform - FindYourPick

An attempt at creating a DeFi analytics platform that provides real-time analysis of Balancer pools on Gnosis Chain from an ai-agent. Ours clearly needs some more work yet it was an interesting project to build. We learnt about Dune to find interesting pools, about Subgraphs from Balancer to query the data and made use of other APIs.

## Features

- Real-time pool data analysis
- AI-powered insights using Llama model
- RESTful API endpoints for data access
- Automatic data refresh mechanism
- Comprehensive pool metrics including:
  - 48h fees
  - 48h volume
  - Holder count
  - Total liquidity
  - Chain information
  - Pool tags

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Ollama (for AI model integration)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Ja1m3st/EthLisbon2025
cd EthLisbon2025
```

2. Install dependencies:
```bash
npm install

# if you do not have ollama installed, go here https://ollama.com/download
ollama pull llama3.2:latest
```



3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
OLLAMA_TEMPERATURE=0.5
OLLAMA_MAX_TOKENS=50
DATA_REFRESH_INTERVAL=3600000
```

## Running the Application

1. Start the server:
```bash
node server.js
```

The server will start on port 3000 (or the port specified in your .env file).

## API Endpoints

### Chat Endpoint
- **POST** `/api/chat`
- **Body**: `{ "message": "Your question about DeFi pools" }`
- **Response**: `{ "reply": "AI-generated response" }`

### Health Check
- **GET** `/api/health`
- **Response**: Server status, pool data statistics, and uptime

## Project Structure

```
├── server.js           # Main application server
├── package.json        # Project dependencies and scripts
├── public/            # Static files
├── DuneQueries/      # Data source files
│   └── csvjson.json  # Pool data
└── .env              # Environment variables (create this)
```

## Dependencies

- express: Web framework
- axios: HTTP client
- body-parser: Request body parsing
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- ethers: Ethereum library
- csv-parse: CSV parsing utilities

## Data Refresh

The application automatically refreshes pool data at regular intervals (default: 1 hour). This can be configured through the `DATA_REFRESH_INTERVAL` environment variable.
