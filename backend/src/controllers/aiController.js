const OpenAI = require('openai');
const CourseFile = require('../models/CourseFile');

// Initialize with a placeholder if no key is set — prevents server crash at startup
console.log('AI Controller: OPENAI_API_KEY is', process.env.OPENAI_API_KEY ? 'Set' : 'MISSING');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

function requireApiKey(req, res) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-temporary-fake-key' || process.env.OPENAI_API_KEY === 'provide_openai_api_key_here') {
    if (process.env.NODE_ENV === 'development') return true; // Allow mock mode
    res.status(503).json({ success: false, message: 'AI service is not configured. Please set a valid OPENAI_API_KEY.' });
    return false;
  }
  return true;
}

function isMockMode() {
  return !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-temporary-fake-key' || process.env.OPENAI_API_KEY === 'provide_openai_api_key_here';
}

// Helper: get context from file
async function getFileContext(fileId) {
  const file = await CourseFile.findById(fileId).populate('uploader', 'username');
  if (!file) return null;
  return {
    name: file.originalName,
    course: file.course,
    text: file.extractedText || '',
    uploader: file.uploader?.username,
  };
}

// POST /api/ai/chat — general AI chat
exports.chat = async (req, res) => {
  try {
    if (!requireApiKey(req, res)) return;
    const { message, fileId, conversationHistory = [] } = req.body;
    let systemPrompt = `You are StudyBot, an intelligent AI assistant for Study Hub, a collaborative study platform for students. 
You help students understand course materials, explain concepts, and answer questions about their studies.
Be helpful, clear, concise, and educational. Use markdown formatting for better readability.`;

    if (fileId) {
      const ctx = await getFileContext(fileId);
      if (ctx && ctx.text) {
        systemPrompt += `\n\nYou have access to the following course document:\n
File: "${ctx.name}"
Course: ${ctx.course}
Uploaded by: ${ctx.uploader}

DOCUMENT CONTENT:
${ctx.text.slice(0, 15000)}

Answer questions based specifically on this document. Reference the document when providing information. 
If information is not in the document, say so clearly.`;
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    if (isMockMode()) {
      return res.json({ 
        success: true, 
        reply: `🤖 **StudyBot Mock Mode**\n\nI see you're asking about: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nCurrently, the OpenAI API key is not set. In a real scenario, I would analyze your documents and provide a detailed answer. \n\n*Document context detected:* ${fileId ? 'Yes' : 'No'}` 
      });
    }

    const completion = await openai.chat.completions.create({ model: MODEL, messages, max_tokens: 2000 });
    const reply = completion.choices[0].message.content;
    res.json({ success: true, reply });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ success: false, message: `AI service error: ${err.message}` });
  }
};

// POST /api/ai/summarize — summarize a document
exports.summarize = async (req, res) => {
  try {
    if (!requireApiKey(req, res)) return;
    const { fileId } = req.body;
    const ctx = await getFileContext(fileId);
    if (!ctx) return res.status(404).json({ success: false, message: 'File not found' });
    if (!ctx.text) return res.status(400).json({ success: false, message: 'Document has not been processed yet.' });

    if (isMockMode()) {
      const summary = `## 📚 Mock Summary: ${ctx.name}\n\n1. **Core Topic**: Introduction to ${ctx.course}.\n2. **Key Findings**: Detailed analysis of the subject matter.\n3. **Conclusion**: Summary of the main takeaways.\n\n*Note: This is a simulated response for development.*`;
      return res.json({ success: true, summary, fileName: ctx.name });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert academic summarizer. Provide comprehensive yet concise summaries of academic documents using markdown formatting.' },
        { role: 'user', content: `Please provide a comprehensive summary of the following document titled "${ctx.name}" from the course "${ctx.course}":\n\n${ctx.text.slice(0, 15000)}` },
      ],
      max_tokens: 1500,
    });
    const summary = completion.choices[0].message.content;
    await CourseFile.findByIdAndUpdate(fileId, { summary });
    res.json({ success: true, summary, fileName: ctx.name });
  } catch (err) {
    console.error('AI Summarize Error:', err);
    res.status(500).json({ success: false, message: `AI service error: ${err.message}` });
  }
};

// POST /api/ai/quiz — generate quiz questions
exports.generateQuiz = async (req, res) => {
  try {
    if (!requireApiKey(req, res)) return;
    const { fileId, numQuestions = 5 } = req.body;
    const ctx = await getFileContext(fileId);
    if (!ctx) return res.status(404).json({ success: false, message: 'File not found' });
    if (!ctx.text) return res.status(400).json({ success: false, message: 'Document has not been processed yet.' });

    if (isMockMode()) {
      const result = {
        questions: [
          { question: `What is the primary theme of ${ctx.course}?`, options: ['A) Subject A', 'B) Subject B', 'C) Subject C', 'D) Subject D'], answer: 'A', explanation: 'This is the fundamental concept discussed in the intro.' },
          { question: `Who uploaded ${ctx.name}?`, options: [`A) ${ctx.uploader}`, 'B) Unknown', 'C) AI', 'D) Admin'], answer: 'A', explanation: 'Metadata shows the uploader clearly.' },
        ],
      };
      return res.json({ success: true, ...result, fileName: ctx.name });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert educator creating study quiz questions from academic materials. Always return valid JSON.' },
        { role: 'user', content: `Generate ${numQuestions} multiple-choice quiz questions from this document: "${ctx.name}"\n\n${ctx.text.slice(0, 12000)}\n\nReturn JSON: {"questions": [{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}]}` },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });
    const result = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, ...result, fileName: ctx.name });
  } catch (err) {
    console.error('AI Quiz Error:', err);
    res.status(500).json({ success: false, message: `AI service error: ${err.message}` });
  }
};

// POST /api/ai/key-points — extract key concepts
exports.keyPoints = async (req, res) => {
  try {
    if (!requireApiKey(req, res)) return;
    const { fileId } = req.body;
    const ctx = await getFileContext(fileId);
    if (!ctx) return res.status(404).json({ success: false, message: 'File not found' });
    if (!ctx.text) return res.status(400).json({ success: false, message: 'Document has not been processed yet.' });

    if (isMockMode()) {
      const result = {
        keyPoints: ['First major point from the doc', 'Second major point', 'Third major point'],
        concepts: ['Core Theory', 'Practical Application'],
        terms: [{ term: 'Term A', definition: 'A very important concept.' }, { term: 'Term B', definition: 'Another key terminology.' }],
      };
      return res.json({ success: true, ...result, fileName: ctx.name });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert at extracting and organizing key academic concepts. Return structured JSON.' },
        { role: 'user', content: `Extract the key points, concepts, and important terms from: "${ctx.name}"\n\n${ctx.text.slice(0, 12000)}\n\nReturn JSON: {"keyPoints": ["..."], "concepts": ["..."], "terms": [{"term": "...", "definition": "..."}]}` },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });
    const result = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, ...result, fileName: ctx.name });
  } catch (err) {
    console.error('AI KeyPoints Error:', err);
    res.status(500).json({ success: false, message: `AI service error: ${err.message}` });
  }
};

// POST /api/ai/search — semantic search across modules
exports.semanticSearch = async (req, res) => {
  try {
    if (!requireApiKey(req, res)) return;
    const { query, courseFilter } = req.body;
    const dbQuery = { isProcessed: true, extractedText: { $ne: '' } };
    if (courseFilter) dbQuery.course = new RegExp(courseFilter, 'i');
    const files = await CourseFile.find(dbQuery).populate('uploader', 'username avatar').limit(20);
    if (!files.length) return res.json({ success: true, results: [] });

    const fileList = files.map((f, i) => `[${i}] "${f.originalName}" (${f.course}): ${f.extractedText.slice(0, 1000)}`).join('\n\n---\n\n');

    if (isMockMode()) {
      const results = files.slice(0, 3).map((f, i) => ({
        index: i,
        relevance: i === 0 ? 'high' : 'medium',
        snippet: `Mock snippet from ${f.originalName}...`,
        reason: 'Matches keyword intent.',
        file: f,
      }));
      return res.json({ success: true, results });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a semantic search engine for academic documents. Find the most relevant documents for the query and provide relevance explanations. Return valid JSON.' },
        { role: 'user', content: `Search query: "${query}"\n\nDocuments:\n${fileList}\n\nReturn JSON: {"results": [{"index": 0, "relevance": "high/medium/low", "snippet": "relevant excerpt", "reason": "why relevant"}]} for the top 5 most relevant documents.` },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);
    const results = (aiResult.results || []).map((r) => ({ ...r, file: files[r.index] }));
    res.json({ success: true, results });
  } catch (err) {
    console.error('AI Search Error:', err);
    res.status(500).json({ success: false, message: `AI service error: ${err.message}` });
  }
};
