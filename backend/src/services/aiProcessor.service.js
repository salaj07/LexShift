const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { PromptTemplate } = require('@langchain/core/prompts');
const { JsonOutputParser } = require('@langchain/core/output_parsers');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

const CHAR_THRESHOLD = 15000;
const CHUNK_SIZE = 6000;
const CHUNK_OVERLAP = 400;

// ─── PROMPT TEMPLATE (LangChain) ──────────────────────────────────────

const conversionPrompt = new PromptTemplate({
  inputVariables: ['startIndex', 'document'],
  template: `
You are a legal AI assistant specialized in Indian court documents.

Perform ALL three tasks in ONE pass:

TASK 1 - DETECT AND MASK PERSON NAMES:
Find every person name including:
- Indian names (Rajesh Kumar, Priya Devi, Vikram Singh, etc.)
- Names with honorifics: Shri, Smt., Dr., Adv., Kumari
- Aliases after @ or the word "alias"
- Names in all legal roles: accused, complainant, witness, petitioner, respondent, judge, advocate
- Father/mother names in s/o, d/o, w/o patterns

Replace each unique person name with [PERSON_N].
Numbering starts at {startIndex}.
Same name always gets the same placeholder.

TASK 2 - CONVERT IPC TO BNS:
Replace all IPC section references with correct BNS equivalents.
Example: "Section 302 IPC" becomes "Section 103 BNS"
Use accurate legally correct mappings.

TASK 3 - FORMAT AS OFFICIAL FIR FORM HTML:
Convert the entire document into HTML that replicates the official CCTNS government FIR form layout.

HEADER (before main table):
Use a div with class fir-header containing h2 for the title and p tags for subtitle lines.

MAIN OUTER TABLE:
Use a table with class fir-outer that contains ALL numbered sections (1 through 13).
Each section is a tr with exactly two td cells:
- First td with class sec-num: section number only (e.g. 1., 2., 3.)
- Second td with class sec-content: all content for that section

INNER FIELDS:
For sections with multiple sub-fields (like District/PS/Year or sub-items a,b,c):
Use a nested table with class inner-fields inside the sec-content cell.
Each sub-field: tr with td for label (wrapped in strong) and td for value.

ACCUSED / WITNESS TABLES:
Use a table with class accused-table with thead containing th headers and tbody with tr rows.

FIR LETTER (section 12 contents):
Wrap the full letter content in a div with class letter-box with paragraph breaks preserved.

SIGNATURE BLOCK (after section 13):
Use a div with class sig-block containing two div elements with class sig-area.
Each sig-area has a div with class sig-line followed by name and rank details.

RULES:
- Do NOT add html, head, or body tags
- Preserve every word of content exactly — do not summarize or remove anything
- Use strong tags for all field labels

OUTPUT RULES:
Return ONLY a valid raw JSON object. No markdown. No explanation. No code fences.

{{
  "convertedText": "<div class='fir-header'><h2>FIRST INFORMATION REPORT</h2></div><table class='fir-outer'>...</table>",
  "mapping": {{
    "[PERSON_1]": "<original name>",
    "[PERSON_2]": "<original name>"
  }}
}}

DOCUMENT:
{document}
`,
});

// ─── OUTPUT PARSER (LangChain) ────────────────────────────────────────

const outputParser = new JsonOutputParser();

// ─── SINGLE GEMINI CALL ───────────────────────────────────────────────

const convertChunk = async (text, startIndex = 1) => {
  const formattedPrompt = await conversionPrompt.format({
    startIndex,
    document: text,
  });

  const result = await geminiModel.generateContent(formattedPrompt);
  const rawResponse = result.response.text();

  const cleaned = rawResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const parsed = await outputParser.parse(cleaned);

  return {
    convertedText: parsed.convertedText || '',
    mapping: parsed.mapping || {},
  };
};

// ─── CHUNKED PROCESSING (LangChain RecursiveCharacterTextSplitter) ────

const processInChunks = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  const docs = await splitter.createDocuments([text]);
  logger.debug(`Split into ${docs.length} chunks via LangChain`);

  let globalCounter = 1;
  let globalMapping = {};
  const convertedParts = [];

  for (let i = 0; i < docs.length; i++) {
    logger.debug(`Processing chunk ${i + 1} of ${docs.length}...`);
    const result = await convertChunk(docs[i].pageContent, globalCounter);

    globalMapping = { ...globalMapping, ...result.mapping };
    convertedParts.push(result.convertedText);
    globalCounter += Object.keys(result.mapping).length;
  }

  return {
    convertedText: convertedParts.join('\n\n'),
    mapping: globalMapping,
  };
};

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────────

const processDocument = async (text) => {
  if (text.length > CHAR_THRESHOLD) {
    logger.debug(`Large doc (${text.length} chars) — chunked processing`);
    return await processInChunks(text);
  }
  logger.debug(`Small doc (${text.length} chars) — single Gemini call`);
  return await convertChunk(text, 1);
};


// ─── RESTORE NAMES ────────────────────────────────────────────────────

const restoreNames = (text, mapping) => {
  let restored = text;
  for (const [placeholder, name] of Object.entries(mapping)) {
    const escapedTag = placeholder.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp(escapedTag, 'g');
    restored = restored.replace(regex, name);
  }
  return restored;
};

// ─── GEMINI VISION (scanned/image PDFs) ──────────────────────────────

const extractTextFromScannedPDF = async (pdfBuffer) => {
  logger.debug('Using Gemini Vision for scanned PDF...');
  const visionModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

  const result = await visionModel.generateContent([
    {
      inlineData: {
        data: pdfBuffer.toString('base64'),
        mimeType: 'application/pdf',
      },
    },
    {
      text: `Extract ALL text from this scanned PDF document.
- Preserve the exact structure: headings, paragraphs, line breaks, numbering
- Do NOT summarize or interpret anything
- Do NOT add or remove any content
- Return only the extracted text, nothing else`,
    },
  ]);
  
  
  return result.response.text();
};

// ─── EXPORTS ──────────────────────────────────────────────────────────

module.exports = {
  processDocument,
  restoreNames,
  extractTextFromScannedPDF,
};
