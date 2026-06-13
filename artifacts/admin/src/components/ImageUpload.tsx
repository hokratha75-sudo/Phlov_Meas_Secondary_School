import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axiosConfig";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      onChange(response.data.url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>}
      <div className="flex items-center gap-4">
        <div className="relative group">
          {value ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center dark:bg-gray-900/50">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => onChange("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-400 transition-all dark:bg-gray-900/50"
            >
              {uploading ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
              <span className="text-[10px] mt-1 font-medium">{uploading ? "..." : "Upload"}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or upload image"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <p className="text-[10px] text-gray-400 mt-1">Recommended size: Square (1:1), max 5MB</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
