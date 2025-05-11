import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration object - could also move to a separate config file
const config = {
  jsonPath: path.join(__dirname, 'DuneQueries', 'csvjson.json'),
  staticFiles: path.join(__dirname, 'public'),
  ollama: {
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
    temperature: parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.5,
    maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS) || 50
  },
  dataRefreshInterval: process.env.DATA_REFRESH_INTERVAL ? parseInt(process.env.DATA_REFRESH_INTERVAL) : 3600000 // 1 hour
};

// Global variable to store pool data with caching mechanism
let globalPools = {
  data: [],
  lastUpdated: null,
  isUpdating: false
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(config.staticFiles));

// JSON Processing Utilities
const jsonUtils = {
  processData: (data) => {
    if (!Array.isArray(data)) return [];
    
    return data
      .filter(pool => {
        // Validate all required fields exist and are not null/undefined
        return pool && 
               pool.chain !== undefined && 
               pool.name !== undefined && 
               pool.address !== undefined &&
               pool.fees48h !== undefined &&
               pool.volume48h !== undefined &&
               pool.holdersCount !== undefined &&
               pool.totalLiquidity !== undefined;
      })
      .map(pool => ({
        ...pool,
        // Convert numeric fields to numbers
        fees48h: parseFloat(pool.fees48h),
        volume48h: parseFloat(pool.volume48h),
        holdersCount: parseInt(pool.holdersCount, 10),
        totalLiquidity: parseFloat(pool.totalLiquidity),
        tags: pool.tags || null
      }))
      .sort((a, b) => b.holdersCount - a.holdersCount);
  }
};

// Data Service
const dataService = {
  getPoolData: async () => {
    try {
      if (globalPools.isUpdating) {
        console.log('Update already in progress');
        return globalPools.data;
      }

      globalPools.isUpdating = true;
      console.log('Reading JSON from:', config.jsonPath);
      
      const data = await fs.readFile(config.jsonPath, 'utf8');
      const pools = JSON.parse(data);
      
      globalPools = {
        data: pools,
        lastUpdated: new Date(),
        isUpdating: false
      };
      
      console.log(`Pool data loaded successfully! Found ${pools.length} pools`);
      return pools;
    } catch (error) {
      console.error('Error reading pool data:', error);
      globalPools.isUpdating = false;
      return [];
    }
  },
  
  refreshData: () => {
    setInterval(async () => {
      await dataService.getPoolData();
    }, config.dataRefreshInterval);
  }
};

// AI Service
const aiService = {
  generatePrompt: (message, pools) => {
    const contextPools = pools.slice(0, 100); // Limit to 100 pools for context
    
    return `
<context>
You are a DeFi analyst specialized in Balancer (Gnosis Chain).
Current data (${new Date().toISOString().split('T')[0]}):
${contextPools.map(p => `
Pool: ${p.name}
Chain: ${p.chain}
Address: ${p.address}
Fees 48h: ${p.fees48h}
Volume 48h: ${p.volume48h}
Holders: ${p.holdersCount}
Total Liquidity: ${p.totalLiquidity}
Tags: ${p.tags}
`).join('\n')}
</context>

<instructions>
1. Analyze the question in the context of the provided pool data.
2. Focus on relevant metrics based on the question asked.
3. Provide concise, accurate DeFi analysis.
4. When discussing specific pools, include key metrics.
5. For comparative questions, highlight differences clearly.
</instructions>

<question>
${message}
</question>`;
  },

  getAIResponse: async (prompt) => {
    try {
      const response = await axios.post(`${config.ollama.baseUrl}/api/generate`, {
        model: "llama3.2:latest",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          max_tokens: 50
        }
      });
      
      return response.data.response.trim();
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }
};

// API Endpoints
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    if (globalPools.data.length === 0) {
      return res.json({ reply: "⚠️ Datos no disponibles. Por favor intente más tarde." });
    }

    const prompt = aiService.generatePrompt(message, globalPools.data);
    const reply = await aiService.getAIResponse(prompt);
    
    return res.json({ reply });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ reply: "⚠️ Error procesando consulta. Por favor intente nuevamente." });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    poolsLoaded: globalPools.data.length,
    lastUpdated: globalPools.lastUpdated,
    uptime: process.uptime()
  });
});

// Server Initialization
async function initializeServer() {
  try {
    console.log('Starting server initialization...');
    
    // Initial data load
    await dataService.getPoolData();
    
    // Set up periodic data refresh
    dataService.refreshData();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Ollama configured with model: ${config.ollama.model}`);
    });
  } catch (error) {
    console.error('Error initializing server:', error);
    process.exit(1);
  }
}

initializeServer();