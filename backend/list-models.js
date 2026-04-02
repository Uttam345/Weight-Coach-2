require('dotenv').config();

async function run() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  const textModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).map(m => m.name);
  console.log("Supported Models:", textModels);
}

run().catch(console.error);
