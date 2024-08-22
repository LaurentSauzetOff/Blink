'use client';

import { UploadDropzone } from '@/lib/uploadthing';
import '@uploadthing/react/styles.css';
import { X } from 'lucide-react';
import Image from 'next/image';

interface Props {
  endpoint: 'messageFile' | 'serverImage';
  value?: string; // Le champ `value` peut être optionnel
  onChange: (url?: string) => void;
}

export function FileUpload({ endpoint, value, onChange }: Props) {
  // Affiche un aperçu de l'image si `value` est défini et correspond à une URL d'image
  const fileType = value?.split('.').pop();
  
  return (
    <div>
      {value && fileType !== 'pdf' ? (
        <div className="relative h-20 w-20">
          <Image fill src={value} alt="Upload" className="rounded-full" />
          <button
            className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
            type="button"
            onClick={() => onChange('')} // Appelle `onChange` avec une chaîne vide pour effacer l'image
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <UploadDropzone
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            if (res?.[0]?.url) {
              onChange(res[0].url); // Met à jour l'URL de l'image après le téléchargement
            }
          }}
          onUploadError={(error: Error) => {
            console.error(error);
          }}
        />
      )}
    </div>
  );
}
