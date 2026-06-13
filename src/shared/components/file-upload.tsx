"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, X, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";

import { useTranslation } from "@/providers/i18n-provider";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ onFileSelect, accept = ".pdf,.dwg,.zip", maxSizeMB = 5 }: FileUploadProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert(t("requests:wizard.validation.fileTooLarge") || `File size exceeds limit of ${maxSizeMB}MB`);
      return;
    }

    // Check file extension
    const fileExt = "." + selectedFile.name.split(".").pop()?.toLowerCase();
    const acceptedExtensions = accept.split(",").map(ext => ext.trim().toLowerCase());
    if (!acceptedExtensions.includes(fileExt)) {
      alert(t("requests:wizard.validation.invalidFileType") || "Invalid file type.");
      return;
    }

    setFile(selectedFile);
    if (onFileSelect) onFileSelect(selectedFile);
    simulateUpload();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const clearFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/15"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />

        <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-xs font-semibold text-foreground">
          Drag & drop your files here, or <span className="text-primary font-bold">browse</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Supports: {accept} (Max {maxSizeMB}MB)
        </p>
      </div>

      {file && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/80 bg-card">
          <File className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-semibold truncate text-foreground">{file.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {uploading ? (
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            ) : (
              uploadProgress === 100 && (
                <span className="text-[10px] text-success font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> {t("requests:wizard.uploads.uploaded")}
                </span>
              )
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
export default FileUpload;
