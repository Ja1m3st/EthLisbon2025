# Gnosis Chain AI Pools & Wallet Demo

## Overview
This project is a proof-of-concept DApp and analytics toolkit for exploring liquidity pools, token holders, and wallet interactions on the Gnosis Chain. It combines a web-based AI chat assistant, a wallet connection demo, and Python scripts for on-chain pool analytics.

### Key Features
- **Web App (Frontend)**
  - Modern UI with a Gnosis Chain AI chat assistant.
  - Connect/disconnect wallet demo with Gnosis Chain support.
  - Beautiful, responsive layout and custom background.
- **Data Analytics (Backend/Python)**
  - Python scripts were created for testing purpose to fetch, rank, and analyze Gnosis Chain pool data using Subgraphs, Dune Analytics and Moralis APIs.

## Project Structure
```
/ai
├── public/
│   ├── index.html        # Main web app UI
│   ├── styles.css        # App styling
│   ├── handleEnter.js    # (Optional) Frontend JS
│   └── ...
├── DuneQueries/
│   ├── unified-script.py       # Main Python analytics script
│   ├── extract_unique_tags.py  # Script to extract unique tags from csvjson.json
│   ├── csvjson.json            # Pool data (from Dune or Moralis)
│   └── ...
└── README.md
```

## How It Works
### Web App
- The frontend allows users to connect their wallet (MetaMask etc.) to the Gnosis Chain, interact with a chat AI, and see a visually appealing, modern UI.
- The chat AI can answer questions about Gnosis Chain pools and investments.

### Data Analytics Scripts
- `unified-script.py` fetches pool data from Dune Analytics and Moralis, ranks pools by holders, and saves results to CSV.
- `extract_unique_tags.py` finds all unique tags in the pool dataset, ignoring empty/NULL tags.

## Getting Started
### Prerequisites
- **Node.js** (for running a local web server, if desired)
- **Python 3.8+**
- **API Keys** for Dune Analytics and Moralis (set in a `.env` file)

### Setup
1. **Clone the repository**
2. **Install Python dependencies**
   ```bash
   pip install python-dotenv moralis
   ```
3. **Configure API Keys**
   - Create a `.env` file in the root directory:
     ```env
     DUNE_API_KEY=your_dune_api_key
     MORALIS_API_KEY=your_moralis_api_key
     ```
4. **Prepare Data**
   - Place your pool data in `DuneQueries/csvjson.json` (JSON array format).


### Running the Web App
- You can open `public/index.html` directly in your browser for local testing.
- For a local server (recommended for wallet connection):
  ```bash
  npx serve public
  # or
  python3 -m http.server 8000 --directory public
  ```
  Then visit `http://localhost:8000` in your browser.

## Customization & Extending
- Update `csvjson.json` with new pool data as needed.
- Modify Python scripts to add new analytics or export formats.
- Tweak the frontend (HTML/CSS/JS) for new features or branding.

---
*Created by Jaime, Cris, Augustin and Guillaume.*
