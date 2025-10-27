import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  uploadedUrls?: string[];
  onRemoveUrl?: (index: number) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

export default function FileUpload({
  onFilesSelected,
  uploadedUrls = [],
  onRemoveUrl,
  multiple = true,
  accept = "image/*",
  maxFiles = 10,
  className = ""
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {multiple ? 'Upload images' : 'Upload image'}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedUrls.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Images ({uploadedUrls.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                {onRemoveUrl && (
                  <button
                    type="button"
                    onClick={() => onRemoveUrl(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
