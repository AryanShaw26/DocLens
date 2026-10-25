import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

export const FileDropzone = ({ onFileSelect, selectedFile, onRemoveFile, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.txt"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center select-none',
            isDragOver
              ? 'border-medical-500 bg-medical-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-medical-400 bg-white/60 hover:bg-slate-50/80',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-700 flex items-center justify-center mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8 stroke-[1.8]" />
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            Drop your medical report here
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Drag & drop your diagnostic laboratory test report, or browse files from your computer.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <Button variant="secondary" size="sm" type="button">
              Browse Files
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">PDF</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">JPG / JPEG</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">PNG</span>
            <span>• Max file size: 10MB</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 clinical-shadow flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-medical-50 text-medical-700 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatFileSize(selectedFile.size)} • Ready for AI extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFile}
              disabled={disabled}
              className="text-slate-500 hover:text-rose-600"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Replace
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

