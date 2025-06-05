"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, File, X, Check, AlertCircle } from "lucide-react";
import {
  BsFiletypeDocx,
  BsFileEarmarkPdf,
  BsFiletypePptx,
  BsFiletypeXlsx,
  BsFiletypeCsv,
  BsFiletypeTxt,
} from "react-icons/bs";

interface FileWithMetadata {
  id: string;
  file: File;
  name: string;
  size: string;
  type: AllowedFileType;
  status: UploadStatus;
}

type AllowedFileType = "PDF" | "DOCX" | "PPTX" | "XLSX" | "CSV" | "TXT";
type UploadStatus = "uploading" | "completed" | "error";

interface FileTypeConfig {
  mimeType: string;
  extension: AllowedFileType;
  colorClass: string;
}

const ALLOWED_FILE_TYPES: Record<string, FileTypeConfig> = {
  "application/pdf": {
    mimeType: "application/pdf",
    extension: "PDF",
    colorClass: "bg-red-100 text-red-700 border-red-200",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: "DOCX",
    colorClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extension: "PPTX",
    colorClass: "bg-orange-100 text-orange-700 border-orange-200",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "XLSX",
    colorClass: "bg-green-100 text-green-700 border-green-200",
  },
  "text/csv": {
    mimeType: "text/csv",
    extension: "CSV",
    colorClass: "bg-purple-100 text-purple-700 border-purple-200",
  },
  "text/plain": {
    mimeType: "text/plain",
    extension: "TXT",
    colorClass: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

const FILE_SIZE_UNITS = ["Bytes", "KB", "MB", "GB"] as const;
const UPLOAD_SIMULATION_DELAY = 1500;
const ERROR_DISPLAY_DURATION = 5000;

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toUpperCase() || "";
};

const isValidFileType = (file: File): boolean => {
  const extension = getFileExtension(file.name) as AllowedFileType;
  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).map(
    (config) => config.extension
  );
  return (
    allowedExtensions.includes(extension) ||
    Boolean(ALLOWED_FILE_TYPES[file.type])
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${size} ${FILE_SIZE_UNITS[i]}`;
};

const getFileTypeConfig = (file: File): FileTypeConfig => {
  const extension = getFileExtension(file.name) as AllowedFileType;
  const configByMimeType = ALLOWED_FILE_TYPES[file.type];
  const configByExtension = Object.values(ALLOWED_FILE_TYPES).find(
    (config) => config.extension === extension
  );

  return (
    configByMimeType || configByExtension || ALLOWED_FILE_TYPES["text/plain"]
  );
};

const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Custom Hooks
const useFileUpload = () => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const addFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithMetadata[] = [];
    const newErrors: string[] = [];

    Array.from(fileList).forEach((file) => {
      if (isValidFileType(file)) {
        const config = getFileTypeConfig(file);
        const fileWithMetadata: FileWithMetadata = {
          id: generateUniqueId(),
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: config.extension,
          status: "uploading",
        };

        newFiles.push(fileWithMetadata);

        // Simulate upload process
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithMetadata.id
                ? { ...f, status: "completed" as UploadStatus }
                : f
            )
          );
        }, UPLOAD_SIMULATION_DELAY);
      } else {
        newErrors.push(`${file.name} bukan tipe file yang diizinkan`);
      }
    });

    setFiles((prev) => [...prev, ...newFiles]);
    setErrors(newErrors);

    if (newErrors.length > 0) {
      setTimeout(() => setErrors([]), ERROR_DISPLAY_DURATION);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    files,
    errors,
    addFiles,
    removeFile,
    clearErrors,
  };
};

const useDragAndDrop = (onFileDrop: (files: FileList) => void) => {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileDrop(e.dataTransfer.files);
      }
    },
    [onFileDrop]
  );

  return {
    isDragActive,
    dragHandlers: {
      onDragEnter: handleDragIn,
      onDragLeave: handleDragOut,
      onDragOver: handleDrag,
      onDrop: handleDrop,
    },
  };
};

// Components
interface FileTypesBadgeProps {
  types: AllowedFileType[];
}

const FileTypesBadge: React.FC<FileTypesBadgeProps> = ({ types }) => (
  <div className="flex flex-wrap justify-center gap-2 text-xs">
    {types.map((type) => {
      const config = Object.values(ALLOWED_FILE_TYPES).find(
        (c) => c.extension === type
      );
      return (
        <span
          key={type}
          className={`px-2 py-1 rounded-full border text-xs font-medium ${config?.colorClass}`}
        >
          {type}
        </span>
      );
    })}
  </div>
);

interface ErrorListProps {
  errors: string[];
}

const ErrorList: React.FC<ErrorListProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {errors.map((error, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      ))}
    </div>
  );
};

interface FileItemProps {
  file: FileWithMetadata;
  onRemove: (id: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onRemove }) => {
  const config = Object.values(ALLOWED_FILE_TYPES).find(
    (c) => c.extension === file.type
  );

  const handleRemove = () => onRemove(file.id);

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <File className="w-5 h-5 text-gray-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${config?.colorClass}`}
            >
              {file.type}
            </span>
            <span className="text-xs text-gray-500">{file.size}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {file.status === "uploading" && (
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        {file.status === "completed" && (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
        )}

        <button
          onClick={handleRemove}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
          aria-label={`Remove ${file.name}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface FileListProps {
  files: FileWithMetadata[];
  onRemoveFile: (id: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <h4 className="text-lg font-semibold text-gray-700">
        File yang Diupload
      </h4>
      <div className="space-y-2">
        {files.map((file) => (
          <FileItem key={file.id} file={file} onRemove={onRemoveFile} />
        ))}
      </div>
    </div>
  );
};

interface FileUploadProps {
  onUpload?: (file: File) => void;
}

// Main Component
const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { files, errors, addFiles, removeFile } = useFileUpload();
  const { isDragActive, dragHandlers } = useDragAndDrop(addFiles);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      addFiles(e.target.files);
      if (onUpload) {
        onUpload(file);
      }
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const allowedTypes = Object.values(ALLOWED_FILE_TYPES).map(
    (config) => config.extension
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${
          isDragActive
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        {...dragHandlers}
        onClick={handleUploadAreaClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt"
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div
            className={`p-4 rounded-full transition-all duration-300 ${
              isDragActive
                ? "bg-blue-200"
                : "bg-gray-100 group-hover:bg-blue-100"
            }`}
          >
            <Upload
              className={`w-8 h-8 transition-colors duration-300 ${
                isDragActive
                  ? "text-blue-600"
                  : "text-gray-500 group-hover:text-blue-500"
              }`}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {isDragActive ? "Lepaskan file di sini" : "Upload File"}
            </h3>
            <p className="text-gray-500 mb-4">
              Drag & drop file atau klik untuk memilih
            </p>

            <FileTypesBadge types={allowedTypes} />
          </div>
        </div>
      </div>

      <ErrorList errors={errors} />
      <FileList files={files} onRemoveFile={removeFile} />
    </div>
  );
};

export default FileUpload;
