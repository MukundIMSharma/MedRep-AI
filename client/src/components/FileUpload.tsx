import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const CATEGORIES = [
  { value: "APPROVAL", label: "Drug Approval", description: "CDSCO labels, indications" },
  { value: "SAFETY", label: "Safety Information", description: "Contraindications, warnings" },
  { value: "REIMBURSEMENT", label: "Reimbursement", description: "Ayushman Bharat, PMJAY" },
];

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).slice(0, 5);
      setFiles(newFiles);
      setStatus(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 || !category) {
      setStatus({ type: "error", message: "Please select files and a category" });
      return;
    }

    setUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("documents", file);
      });
      formData.append("category", category);
      if (source) formData.append("source", source);

      const endpoint = files.length > 1 ? "/rag/upload-multiple" : "/rag/upload";

      // For single file, use 'document' instead of 'documents'
      if (files.length === 1) {
        formData.delete("documents");
        formData.append("document", files[0]);
      }

      await apiClient(endpoint, {
        method: "POST",
        body: formData,
      });

      setStatus({
        type: "success",
        message: `Successfully uploaded ${files.length} document(s)`,
      });
      setFiles([]);
      setCategory("");
      setSource("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter((file) => file.type === "application/pdf")
      .slice(0, 5);
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setStatus(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Upload Documents
      </h2>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-foreground font-medium">
              Drop PDFs here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">Max 5 files</p>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
              >
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Category Select */}
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <div className="flex flex-col">
                    <span>{cat.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Input */}
        <div className="space-y-2">
          <Label>Source (optional)</Label>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., CDSCO, PMJAY, Medical Association"
          />
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              status.type === "success"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{status.message}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={uploading || files.length === 0 || !category}
          className="w-full gradient-primary text-primary-foreground shadow-glow"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload {files.length > 0 ? `${files.length} File(s)` : "Files"}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
