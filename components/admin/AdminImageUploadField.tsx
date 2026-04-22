"use client";

import { useState } from "react";

type AdminImageUploadFieldProps = {
  defaultValue?: string | null;
};

export default function AdminImageUploadField({
  defaultValue = "",
}: AdminImageUploadFieldProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'envoyer l'image.");
      }

      setImageUrl(data.url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Impossible d'envoyer l'image."
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <label className="space-y-2">
        <span className="text-sm text-slate-300">Image du produit</span>
        <input type="hidden" name="imageUrl" value={imageUrl} readOnly />
        <input
          type="text"
          value={imageUrl}
          readOnly
          placeholder="/uploads/mon-image.jpg"
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
          {isUploading ? "Upload en cours..." : "Upload image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {imageUrl ? (
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300"
          >
            Retirer l&apos;image
          </button>
        ) : null}
      </div>

      {imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Aperçu du produit"
            className="h-36 w-full rounded-xl object-cover"
          />
        </div>
      ) : null}

      {uploadError ? (
        <p className="text-sm text-rose-300">{uploadError}</p>
      ) : (
        <p className="text-xs text-slate-500">
          Sélectionnez une image depuis votre ordinateur, le lien sera généré automatiquement.
        </p>
      )}
    </div>
  );
}
