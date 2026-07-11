"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function ImageUploader({ value, onChange, folder = "products" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setUploading(true); setError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("images").upload(path, file, { upsert: false });
    if (upErr) { setError(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-graphite">Image</span>
      {value ? (
        <div className="relative w-40 h-32 rounded-md overflow-hidden border border-steel-200 group">
          <Image src={value.startsWith("/") ? value : value} alt="Preview" fill className="object-cover" unoptimized={!value.startsWith("/")} />
          <button type="button" onClick={() => onChange("")}
            className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-graphite/80 text-white">
            <X size={12} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex w-40 h-32 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-steel-200 text-graphite/40 hover:border-cyan hover:text-cyan-deep disabled:opacity-50 transition-colors">
          <Upload size={20} />
          <span className="text-xs">{uploading ? "Uploading…" : "Upload image"}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {error && <p className="text-xs text-spark">{error}</p>}
      <p className="text-xs text-graphite/40">Or enter a URL below</p>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="/images/my-product.jpg or https://..."
        className="rounded-md border border-steel-200 px-3 py-2 text-sm text-graphite focus:border-cyan focus:outline-none" />
    </div>
  );
}
