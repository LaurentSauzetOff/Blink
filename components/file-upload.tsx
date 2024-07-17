"use client";

/* import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

interface ClientUploadedFileData<T> {
  url?: string;
  fileUrl?: T;
}

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res: ClientUploadedFileData<string>[]) => {
        // Assure-toi que la propriété correcte est utilisée ici
        const fileUrl = res?.[0]?.url || (res?.[0]?.fileUrl as string); // Ajoute des vérifications selon les propriétés disponibles
        onChange(fileUrl);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
}; */



"use client";
 
import { UploadDropzone } from "@/lib/uploadthing";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string;
    endpoint: "messageFile" | "serverImage";
  }
 
export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  return (
   
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
            onChange(res?.[0].url);
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
   
  );
}
