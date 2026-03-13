'use client';
import { useState, useEffect } from 'react';
import { filesAPI } from '../../../lib/api';
import { useAuthStore } from '../../../store/index';
import { Upload, Search, Download, Trash2, BookOpen, Filter, Eye, X, Bot } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const FILE_ICONS = { 'application/pdf': '📄', 'application/msword': '📝', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝', 'text/plain': '📃', 'image/jpeg': '🖼️', 'image/png': '🖼️' };

export default function ModulesPage() {
  const [files, setFiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ course: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { user } = useAuthStore();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadData();
    filesAPI.getCourses().then((r) => setCourses(r.data.courses || []));
  }, [selectedCourse, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCourse) params.course = selectedCourse;
      if (search) params.search = search;
      const res = await filesAPI.getAll(params);
      setFiles(res.data.files || []);
    } finally { setLoading(false); }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => setSelectedFile(accepted[0]),
    multiple: false,
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadForm.course) return toast.error('Please select a file and enter a course name');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('course', uploadForm.course);
      fd.append('description', uploadForm.description);
      const res = await filesAPI.upload(fd);
      toast.success('📚 File uploaded and queued for AI processing!');
      setFiles([res.data.file, ...files]);
      setShowUpload(false);
      setSelectedFile(null);
      setUploadForm({ course: '', description: '' });
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDownload = async (file) => {
    try {
      const res = await filesAPI.download(file._id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = file.originalName; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    try { await filesAPI.delete(id); setFiles(files.filter((f) => f._id !== id)); toast.success('Deleted'); } catch { toast.error('Delete failed'); }
  };

  const formatSize = (bytes) => bytes > 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : (bytes / 1024).toFixed(0) + ' KB';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div className="topbar">
        <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
        <span className="topbar-title">Course Module Library</span>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}><Upload size={15} /> Upload Module</button>
        </div>
      </div>

      <div style={{ padding: '20px 28px', flex: 1 }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search modules…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 180 }} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Course tabs */}
        {courses.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <button className={`badge ${!selectedCourse ? 'badge-primary' : ''}`} style={{ cursor: 'pointer', padding: '5px 14px' }} onClick={() => setSelectedCourse('')}>All</button>
            {courses.map((c) => (
              <button key={c} className={`badge ${selectedCourse === c ? 'badge-primary' : ''}`}
                style={{ cursor: 'pointer', padding: '5px 14px', background: selectedCourse !== c ? 'var(--bg-elevated)' : 'var(--accent-dim)', color: selectedCourse !== c ? 'var(--text-secondary)' : 'var(--accent)' }}
                onClick={() => setSelectedCourse(selectedCourse === c ? '' : c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: 'auto' }} /></div>
        ) : (
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {files.map((file) => (
              <div key={file._id} className="file-card" onClick={() => setPreview(file)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="file-icon" style={{ background: 'var(--accent-dim)' }}>
                    {FILE_ICONS[file.mimeType] || '📎'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.originalName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatSize(file.size)}</div>
                  </div>
                </div>

                <div>
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>{file.course}</span>
                  {file.isProcessed && <span className="badge badge-success" style={{ fontSize: 10, marginLeft: 6 }}>AI Ready ✓</span>}
                </div>

                {file.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{file.description}</p>}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar avatar-sm">{file.uploader?.username?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{file.uploader?.username}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{format(new Date(file.createdAt), 'MMM d, yyyy')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Download" onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                      <Download size={13} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Analyze with AI"
                      onClick={(e) => { e.stopPropagation(); router.push(`/ai?file=${file._id}`); }}
                      style={{ color: 'var(--accent)' }}>
                      <Bot size={13} />
                    </button>
                    {(file.uploader?._id === user?._id || user?.role === 'admin') && (
                      <button className="btn btn-ghost btn-icon btn-sm" title="Delete" style={{ color: 'var(--danger)' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(file._id); }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <BookOpen size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>No modules found. Be the first to upload!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Upload Course Module</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowUpload(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'var(--accent-dim)' : 'var(--bg-tertiary)', transition: 'all 0.2s' }}>
                <input {...getInputProps()} />
                {selectedFile ? (
                  <div><div style={{ fontSize: 32 }}>{FILE_ICONS[selectedFile.type] || '📎'}</div><div style={{ fontWeight: 600, marginTop: 8 }}>{selectedFile.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatSize(selectedFile.size)}</div></div>
                ) : (
                  <div><Upload size={32} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} /><div style={{ fontWeight: 600 }}>Drop file here or click to browse</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF, Word, TXT, Images up to 50MB</div></div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Course / Subject *</label>
                <input className="form-input" placeholder="e.g. Mathematics, CS101, Biology" value={uploadForm.course} onChange={(e) => setUploadForm({ ...uploadForm, course: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input className="form-input" placeholder="Brief description" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? <><span className="spinner" /> Uploading…</> : <><Upload size={14} /> Upload</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{FILE_ICONS[preview.mimeType] || '📎'}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{preview.originalName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{preview.course} • {formatSize(preview.size)}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setPreview(null)}><X size={16} /></button>
            </div>
            {preview.description && <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 14 }}>{preview.description}</p>}
            {preview.summary && (
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>AI SUMMARY</div>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>{preview.summary}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => handleDownload(preview)}><Download size={14} /> Download</button>
              <button className="btn btn-secondary" onClick={() => { router.push(`/ai?file=${preview._id}`); setPreview(null); }}><Bot size={14} /> Analyze with AI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
