import React, { useState } from 'react';
import { X, FileCode, Copy, Check, Download, Eye, Code, Layers } from 'lucide-react';
import { ALL_TEMPLATES, ExternalHtmlTemplate } from '../template/index';

interface TemplateExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateExplorerModal: React.FC<TemplateExplorerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [selectedTemplate, setSelectedTemplate] = useState<ExternalHtmlTemplate>(ALL_TEMPLATES[0]);
  const [viewMode, setViewMode] = useState<'CODE' | 'PREVIEW'>('CODE');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedTemplate.htmlString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedTemplate.htmlString], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = selectedTemplate.filename.split('/').pop() || 'template.html';
    link.setAttribute('download', baseName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6d3cc7] text-white flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">External HTML Template Repository</h3>
                <span className="text-[10px] font-mono bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full font-bold">
                  /template/*.html
                </span>
              </div>
              <p className="text-xs text-slate-400">
                All UI markup externalized as standalone HTML template files and imported as string properties
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-bold mr-2">
              <button
                onClick={() => setViewMode('CODE')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'CODE' ? 'bg-[#6d3cc7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" /> HTML Source
              </button>
              <button
                onClick={() => setViewMode('PREVIEW')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'PREVIEW' ? 'bg-[#6d3cc7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Rendered Live
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
              title="Copy raw HTML string property"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML!' : 'Copy String'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              title="Download standalone .html file"
            >
              <Download className="w-3.5 h-3.5" /> Download .html
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar: List of external HTML templates */}
          <div className="w-72 bg-slate-50 border-r border-slate-200 p-3 overflow-y-auto space-y-1 shrink-0">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              External Templates ({ALL_TEMPLATES.length})
            </div>
            {ALL_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-purple-100/70 border border-purple-200 text-[#6d3cc7]'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{tpl.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                      .html
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    /{tpl.filename}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Area: Source or Preview */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-purple-300 font-bold">
                /{selectedTemplate.filename}
              </span>
              <span className="text-slate-400 text-[11px]">
                {selectedTemplate.category} • {selectedTemplate.htmlString.length} characters
              </span>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {viewMode === 'CODE' ? (
                <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto whitespace-pre">
                  <code>{selectedTemplate.htmlString}</code>
                </pre>
              ) : (
                <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-inner">
                  <iframe
                    title={selectedTemplate.name}
                    srcDoc={selectedTemplate.htmlString}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
