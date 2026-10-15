import { useState, forwardRef } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { getMarketImageSignature } from "~/lib/cloudinary";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
  ({ value, onChange, className }, ref) => {
    const [uploading, setUploading] = useState(false);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const displayImage = objectUrl || value;

    const handleFileChange = async (file: File) => {
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const newObjectUrl = URL.createObjectURL(file);
      setObjectUrl(newObjectUrl);
      setUploading(true);

      try {
        const { signature, timestamp, apiKey, cloudName } =
          await getMarketImageSignature();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey!);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "market_images");
        formData.append("transformation", "w_1200,h_630,c_fill,q_auto");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData },
        );

        const data: any = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload failed");
        onChange(data.secure_url);

        setObjectUrl(null);
        URL.revokeObjectURL(newObjectUrl);
        toast.success("Image uploaded!");
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to upload image");
        setObjectUrl(null);
      } finally {
        setUploading(false);
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
        handleFileChange(e.dataTransfer.files[0]);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileChange(e.target.files[0]);
      }
    };

    const handleRemove = () => {
      onChange("");
      setObjectUrl(null);
    };

    return (
      <div className={cn("w-full", className)}>
        {displayImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted/50 group">
            <img
              src={displayImage}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            <input
              ref={ref}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleInputChange}
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              {uploading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <>
                  <div className="p-4 rounded-full bg-muted">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drop an image here, or{" "}
                      <span className="text-primary">browse</span>
                    </p>
                    <p className="text-xs mt-1">PNG, JPG, WebP up to 10MB</p>
                  </div>
                </>
              )}
            </div>
          </label>
        )}
      </div>
    );
  },
);

ImageUpload.displayName = "ImageUpload";
