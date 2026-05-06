/**
 * @file src/features/converter/Converter.jsx
 * @description The functional core 'Engine' of LexShift.

 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, ShieldCheck, Zap, Cog, FileText, Download, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import useAuthStore from '../auth/store/authStore';
import { uploadDocument, downloadConvertedPDF } from './api/converterApi';
import useConverterSocket from './hooks/useConverterSocket';


const STATUS_MAP = {
  Extracting:  { progress: 15, cap: 24,  step: 0, log: '🔍 Extracting text from PDF...' },
  Scrubbing:   { progress: 30, cap: 44,  step: 1, log: '🛡️ Scrubbing PII — masking sensitive names...' },
  Converting:  { progress: 50, cap: 64,  step: 2, log: '🤖 AI mapping IPC → BNS sections...' },
  Generating:  { progress: 70, cap: 84,  step: 3, log: '📝 Generating official BNS PDF...' },
  Uploading:   { progress: 88, cap: 96,  step: 3, log: '☁️ Uploading converted document...' },
  Completed:   { progress: 100, cap: 100, step: 4, log: '✅ Conversion complete. Ready for download.' },
  Failed:      { progress: 0,  cap: 0,   step: 0, log: '❌ Conversion failed. Please try again.' },
};

const Converter = () => {
  const [status, setStatus]         = useState('idle');  // idle | uploading | processing | completed | failed
  const [progress, setProgress]     = useState(0);        // real target value from socket events
  const [displayProgress, setDisplayProgress] = useState(0); // visual value that slowly animates
  const [progressCap, setProgressCap] = useState(0);     // max the bar can reach before next event
  const [logs, setLogs]             = useState([]);
  const [docId, setDocId]           = useState(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [error, setError]           = useState('');

  // Hidden file input ref — triggered when user clicks "Browse Documents"
  const fileInputRef = useRef(null);

  // Get logged-in user from Zustand store
  const user = useAuthStore((s) => s.user);
  const userId = user?._id || user?.id;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Pipeline steps shown in the tracker UI
  const steps = [
    { label: 'Upload',   icon: <Upload className="w-4 h-4" /> },
    { label: 'PII Scrub', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'AI Map',   icon: <Zap className="w-4 h-4" /> },
    { label: 'Finalize', icon: <Cog className="w-4 h-4" /> },
    { label: 'Download', icon: <Download className="w-4 h-4" /> },
  ];

  // Helper: append a log entry with timestamp
  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, message }]);
  };

  // ── Smooth Progress Ticker ────────────────────────────────────────────────
 
  useEffect(() => {
    if (status !== 'processing' && status !== 'uploading') return;

    const ticker = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= progressCap) return prev;          // stop at cap
        return Math.min(prev + 0.4, progressCap);     // increment by 0.4% per tick
      });
    }, 120); 

    return () => clearInterval(ticker);
  }, [status, progressCap]);

  
  useEffect(() => {
    setDisplayProgress((prev) => Math.max(prev, progress));
  }, [progress]);

  // ── WebSocket: job-scoped socket (connect on upload, disconnect on download/reset) ──
  // connect() is called inside handleFileSelected BEFORE the upload
  // disconnect() is called after download, on failure, or on reset
  const { connect: connectSocket, disconnect: disconnectSocket } = useConverterSocket(
    (receivedDocId, newStatus) => {
      // Only process updates for the current document
      if (receivedDocId !== docId && docId !== null) return;

      const mapped = STATUS_MAP[newStatus];
      if (!mapped) return;

      setProgress(mapped.progress);
      setProgressCap(mapped.cap);
      setActiveStep(mapped.step);
      addLog(mapped.log);

      if (newStatus === 'Completed') {
        setDisplayProgress(100);
        setTimeout(() => setStatus('completed'), 1000);
      } else if (newStatus === 'Failed') {
        disconnectSocket(); // job is dead — no point keeping socket open
        setStatus('failed');
        setError('The conversion failed on the server. Please try again.');
      }
    }
  );

  // ── File Upload Handler ───────────────────────────────────────────────────
  const handleFileSelected = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    // Reset state for new upload
    setStatus('uploading');
    setProgress(10);
    setLogs([]);
    setDocId(null);
    setError('');
    setActiveStep(0);
    addLog('📄 Document selected: ' + file.name);

    // Connect socket BEFORE upload so we never miss the first worker event
    connectSocket(userId);

    try {
      addLog('🔒 Establishing secure connection...');
      const res = await uploadDocument(file);
      const newDocId = res.data.docId;

      setDocId(newDocId);
      setStatus('processing');
      setProgress(20);
      setProgressCap(33);
      addLog('✅ Upload accepted. Worker processing started...');
      addLog('⏳ Tracking progress...');

    } catch (err) {
      disconnectSocket(); // upload failed — no job running, close socket
      setStatus('failed');
      setError(err.response?.data?.message || 'Upload failed. Check your connection.');
      addLog('❌ Upload failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Download Handler ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!docId) return;
    try {
      addLog('📥 Preparing download...');
      await downloadConvertedPDF(docId);
      addLog('✅ Download started!');
      disconnectSocket(); // job done + file delivered — socket no longer needed
    } catch (err) {
      setError('Download failed. Please try again.');
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    disconnectSocket(); // clean up any lingering socket before next job
    setStatus('idle');
    setProgress(0);
    setDisplayProgress(0);
    setLogs([]);
    setDocId(null);
    setError('');
    setActiveStep(-1);
  };

  return (
    <section
      id="converter-engine"
      className="relative w-full min-h-screen py-32 px-8 md:px-16 lg:px-24 bg-[#0f0f1a] overflow-hidden flex items-center"
    >
      <div className="absolute inset-0 z-0 bg-grid opacity-10" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10 w-full">

        {/* ── Left: Functional Dashboard UI ─────────────────────────────── */}
        <div className="w-full lg:w-[60%] space-y-12">

          {/* Engine Header */}
          <div className="space-y-4">
            <h2 className="font-rubik text-4xl md:text-6xl font-black uppercase text-white leading-none">
              The Engine.
            </h2>
            <p className="font-inter text-base text-onSurface/40 max-w-lg">
              Engineered for absolute legal accuracy with a zero-trust privacy architecture.
            </p>
          </div>

          {/* Pipeline Tracker — highlights active step */}
          <div className="flex items-center justify-between w-full max-w-xl">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative group">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    i === activeStep
                      ? 'border-primary bg-primary text-background animate-pulse'
                      : i < activeStep || status === 'completed'
                      ? 'border-green-400 bg-green-400/10 text-green-400'
                      : 'border-white/10 text-white/20'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="font-rubik text-[8px] font-black uppercase tracking-widest text-white/20">
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute left-[150%] top-5 w-12 h-px bg-white/5 opacity-40" />
                )}
              </div>
            ))}
          </div>

          {/* Dropzone & Live Console Area */}
          <div className="glass p-1 border-white/5 overflow-hidden rounded-[2rem]">
            <div className="bg-black/40 rounded-[1.8rem] p-12 flex flex-col items-center text-center space-y-8 border border-white/5 relative">

              {/* ── IDLE STATE ── */}
              {status === 'idle' && (
                <>
                  {isAuthenticated ? (
                    /* Authenticated: real file upload dropzone */
                    <>
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-rubik text-2xl font-black text-white uppercase tracking-widest">
                          Drag Your Case File
                        </h3>
                        <p className="font-inter text-sm text-onSurface/30 max-w-xs leading-relaxed">
                          Upload a PDF to convert IPC sections to BNS.
                        </p>
                        {error && (
                          <p className="text-red-400 text-xs font-inter flex items-center gap-2 justify-center">
                            <AlertCircle className="w-3 h-3" /> {error}
                          </p>
                        )}
                      </div>

                      {/* Hidden file input — triggered by button click */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelected(e.target.files[0])}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-10 py-5 bg-white text-background font-inter font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform active:scale-95"
                      >
                        Browse Documents
                      </button>
                    </>
                  ) : (
                    /* Guest: locked overlay */
                    <>
                      <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Lock className="w-10 h-10 text-white/20" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-rubik text-2xl font-black text-white/30 uppercase tracking-widest">
                          Upload Restricted
                        </h3>
                        <p className="font-inter text-sm text-onSurface/20 max-w-xs leading-relaxed">
                          You must be logged in to upload and convert legal documents.
                        </p>
                      </div>
                      <Link
                        to="/login"
                        id="converter-login-cta"
                        className="px-10 py-5 bg-primary text-white font-inter font-black text-xs uppercase tracking-widest hover:bg-primary/80 transition-all transform active:scale-95"
                      >
                        Login to Upload
                      </Link>
                      <p className="font-inter text-xs text-white/20">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-primary/60 hover:text-primary transition-colors underline">
                          Register free
                        </Link>
                      </p>
                    </>
                  )}
                </>
              )}

              {/* ── UPLOADING / PROCESSING STATE ── */}
              {(status === 'uploading' || status === 'processing') && (
                <div className="w-full space-y-8">
                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-none"
                      style={{ width: `${displayProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-rubik font-black uppercase tracking-widest text-white/20">
                    <span>SECURE PROCESSOR ACTIVE</span>
                    <span className="text-primary">{Math.floor(displayProgress)}%</span>
                  </div>

                  {/* Live Console Logs */}
                  <div className="w-full bg-black/60 rounded-xl p-6 font-mono text-[10px] text-primary/60 text-left h-40 overflow-y-auto space-y-2 border border-white/5 shadow-2xl">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="opacity-30">[{log.time}]</span>
                        <span className="text-white/80">{log.message}</span>
                      </div>
                    ))}
                    <div className="animate-pulse text-primary">_</div>
                  </div>
                </div>
              )}

              {/* ── COMPLETED STATE ── */}
              {status === 'completed' && (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" />
                  <div className="space-y-4">
                    <h3 className="font-rubik text-2xl font-black text-white uppercase tracking-widest">
                      Conversion Complete
                    </h3>
                    <p className="font-inter text-sm text-onSurface/30 max-w-xs leading-relaxed mx-auto">
                      Your IPC to BNS document has been converted. Download your PDF below.
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center flex-wrap">
                    {/* Download PDF Button */}
                    <button
                      onClick={handleDownload}
                      className="px-10 py-5 bg-primary text-white font-inter font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    {/* Reset Button */}
                    <button
                      onClick={handleReset}
                      className="px-10 py-5 bg-white/5 text-white/40 font-inter font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Convert Another
                    </button>
                  </div>
                </div>
              )}

              {/* ── FAILED STATE ── */}
              {status === 'failed' && (
                <div className="space-y-8">
                  <AlertCircle className="w-20 h-20 text-red-400 mx-auto" />
                  <div className="space-y-4">
                    <h3 className="font-rubik text-2xl font-black text-white uppercase tracking-widest">
                      Conversion Failed
                    </h3>
                    <p className="font-inter text-sm text-red-400/60 max-w-xs leading-relaxed mx-auto">
                      {error || 'Something went wrong. Please try again.'}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-10 py-5 bg-white/5 text-white/40 font-inter font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Right: Technical Stats Card ───────────────────────────────── */}
        <div className="w-full lg:w-[40%] flex flex-col gap-8">
          <div className="glass p-10 border-white/5 space-y-8 h-full bg-primary/5">
            <h4 className="font-rubik text-xs font-black uppercase tracking-[0.4em] text-primary">
              Processing Metrics
            </h4>
            <div className="space-y-6">
              {[
                { label: 'PII Scrub Mode', value: 'Strict Anonymization' },
                { label: 'AI Confidence', value: '99.9% Context-Safe' },
                { label: 'Law Framework', value: 'IPC ➔ BNS (V1.2)' },
                { label: 'Server Load', value: 'Async Redis Active' },
              ].map((metric, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-rubik font-black uppercase tracking-widest text-white/30">
                    {metric.label}
                  </span>
                  <span className="text-[12px] font-inter font-bold text-white/80">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed italic">
                &quot;Every document processed is immediately scrubbed using our proprietary NER Shield before AI analysis.&quot;
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Converter;
