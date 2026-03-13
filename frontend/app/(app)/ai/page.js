'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { aiAPI, filesAPI } from '../../../lib/api';
import { Bot, Send, BookOpen, FileText, Brain, Zap, X, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

export default function AIPage() {
  const searchParams = useSearchParams();
  const initialFileId = searchParams.get('file');
  const [messages, setMessages] = useState([
    { role: 'bot', content: "👋 Hi! I'm **StudyBot**, your AI research assistant. I can:\n\n- 📚 **Summarize** course modules\n- ❓ **Generate quiz questions** from your materials\n- 🔑 **Extract key concepts** and terms\n- 💬 **Answer questions** about any uploaded document\n- 🔍 **Semantic search** across all your modules\n\nSelect a document below or just ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    filesAPI.getAll({ limit: 50 }).then((r) => {
      const f = r.data.files || [];
      setFiles(f);
      if (initialFileId) {
        const found = f.find((x) => x._id === initialFileId);
        if (found) { setSelectedFile(found); addBotMessage(`📄 I've loaded **"${found.originalName}"** (${found.course}). What would you like to know about it?`); }
      }
    });
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addBotMessage = (content) => setMessages((m) => [...m, { role: 'bot', content }]);

  const sendMessage = async (msg = input) => {
    if (!msg.trim() || loading) return;
    const userMsg = { role: 'user', content: msg };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.slice(-10);
      const res = await aiAPI.chat({ message: msg, fileId: selectedFile?._id, conversationHistory: history });
      addBotMessage(res.data.reply);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Sorry, I ran into an error. Please check your OpenAI API key.';
      addBotMessage(`❌ ${errMsg}`);
    }
    finally { setLoading(false); }
  };

  const handleSummarize = async () => {
    if (!selectedFile) return toast.error('Please select a document first');
    if (!selectedFile.isProcessed) return toast.error('Document is still being processed. Try again in a moment.');
    setActiveAction('summarize');
    setLoading(true);
    addBotMessage(`📝 Generating summary of **"${selectedFile.originalName}"**...`);
    try {
      const res = await aiAPI.summarize(selectedFile._id);
      addBotMessage(`## 📚 Summary: ${res.data.fileName}\n\n${res.data.summary}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to generate summary.';
      addBotMessage(`❌ ${errMsg}`);
    }
    finally { setLoading(false); setActiveAction(null); }
  };

  const handleQuiz = async () => {
    if (!selectedFile) return toast.error('Please select a document first');
    if (!selectedFile.isProcessed) return toast.error('Document is still being processed.');
    setActiveAction('quiz');
    setLoading(true);
    addBotMessage(`🧠 Generating quiz questions from **"${selectedFile.originalName}"**...`);
    try {
      const res = await aiAPI.generateQuiz(selectedFile._id, 5);
      const qs = res.data.questions || [];
      let formatted = `## 📝 Quiz: ${res.data.fileName}\n\n`;
      qs.forEach((q, i) => {
        formatted += `**Q${i + 1}:** ${q.question}\n${q.options?.join('\n') || ''}\n\n**Answer:** ${q.answer}\n*${q.explanation}*\n\n---\n\n`;
      });
      addBotMessage(formatted);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to generate quiz.';
      addBotMessage(`❌ ${errMsg}`);
    }
    finally { setLoading(false); setActiveAction(null); }
  };

  const handleKeyPoints = async () => {
    if (!selectedFile) return toast.error('Please select a document first');
    if (!selectedFile.isProcessed) return toast.error('Document is still being processed.');
    setActiveAction('keypoints');
    setLoading(true);
    addBotMessage(`🔑 Extracting key concepts from **"${selectedFile.originalName}"**...`);
    try {
      const res = await aiAPI.keyPoints(selectedFile._id);
      let formatted = `## 🔑 Key Points: ${res.data.fileName}\n\n`;
      if (res.data.keyPoints?.length) formatted += `### Key Points\n${res.data.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n`;
      if (res.data.concepts?.length) formatted += `### Core Concepts\n${res.data.concepts.map((c) => `- ${c}`).join('\n')}\n\n`;
      if (res.data.terms?.length) formatted += `### Key Terms\n${res.data.terms.map((t) => `**${t.term}**: ${t.definition}`).join('\n\n')}`;
      addBotMessage(formatted);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to extract key points.';
      addBotMessage(`❌ ${errMsg}`);
    }
    finally { setLoading(false); setActiveAction(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="topbar">
        <Bot size={18} style={{ color: 'var(--accent)' }} />
        <span className="topbar-title">AI Research Assistant</span>

        {/* File selector */}
        <div style={{ marginLeft: 16, position: 'relative' }}>
          <select className="form-input" style={{ width: 220, fontSize: 12 }}
            value={selectedFile?._id || ''}
            onChange={(e) => { const f = files.find((x) => x._id === e.target.value); setSelectedFile(f || null); if (f) addBotMessage(`📄 Loaded **"${f.originalName}"**. Ask me anything about it!`); }}>
            <option value="">No document selected</option>
            {files.map((f) => <option key={f._id} value={f._id}>{f.originalName} ({f.course})</option>)}
          </select>
        </div>

        {selectedFile && <span className={`badge ${selectedFile.isProcessed ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>{selectedFile.isProcessed ? 'AI Ready ✓' : 'Processing…'}</span>}
      </div>

      {/* Quick actions */}
      {selectedFile && (
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleSummarize} disabled={loading}><FileText size={13} /> Summarize</button>
          <button className="btn btn-secondary btn-sm" onClick={handleQuiz} disabled={loading}><Brain size={13} /> Generate Quiz</button>
          <button className="btn btn-secondary btn-sm" onClick={handleKeyPoints} disabled={loading}><Zap size={13} /> Key Points</button>
          <button className="btn btn-ghost btn-sm" onClick={() => sendMessage(`What are the main topics covered in ${selectedFile.originalName}?`)} disabled={loading}>📋 Overview</button>
          <button className="btn btn-ghost btn-sm" onClick={() => sendMessage(`Create study notes from ${selectedFile.originalName}`)} disabled={loading}>📝 Study Notes</button>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', maxWidth: '100%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {msg.role === 'bot' && (
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent), #a855f7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={18} color="white" />
              </div>
            )}
            <div className={`ai-message ${msg.role === 'user' ? 'user' : 'bot'}`} style={{ maxWidth: '75%' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent), #a855f7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="white" />
            </div>
            <div className="ai-message bot" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder={selectedFile ? `Ask about "${selectedFile.originalName}"…` : 'Ask StudyBot anything…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            rows={1}
          />
          <button className="btn btn-primary" style={{ padding: '7px 12px' }} onClick={() => sendMessage()} disabled={!input.trim() || loading}>
            <Send size={16} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
          StudyBot powered by OpenAI GPT-4o • Responses are based on uploaded course materials
        </div>
      </div>
    </div>
  );
}
