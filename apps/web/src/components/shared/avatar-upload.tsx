import { useState, forwardRef } from "react";
import { Image } from "@unpic/react";
import { Camera, Loader2 } from "lucide-react"; // Removed User icon, not needed for gradient
import { toast } from "sonner";
import { getAvatarSignature } from "~/lib/cloudinary";
import { Input } from "../ui/input";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  name?: string;
}

export const AvatarUpload = forwardRef<HTMLInputElement, AvatarUploadProps>(
  ({ value, onChange, name }, ref) => {
    const [uploading, setUploading] = useState(false);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const displayImage = objectUrl || value;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      // @ts-ignore
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      const newObjectUrl = URL.createObjectURL(file);
      setObjectUrl(newObjectUrl);
      setUploading(true);

      try {
        const { signature, timestamp, apiKey, cloudName } =
          await getAvatarSignature();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey!);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "user_avatars");
        formData.append("transformation", "w_400,h_400,c_fill,q_auto");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData },
        );

        const data: any = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload failed");
        onChange(data.secure_url);

        setObjectUrl(null);
        URL.revokeObjectURL(newObjectUrl);
        toast.success("Avatar updated!");
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to upload image");
        setObjectUrl(null);
      } finally {
        setUploading(false);
      }
    };

    return (
      // CHANGED: Removed flex-col/mb-6 to let parent control layout.
      // Added w-full h-full to fill the parent container (e.g. the 24x24 div in your form)
      <div className="w-full h-full">
        <div className="relative group cursor-pointer w-full h-full">
          {/* CHANGED: Removed fixed width/height (w-28), borders, and background.
            Added w-full h-full and gradient background for the fallback match. */}
          <div className="w-full h-full rounded-full overflow-hidden relative shadow-sm transition-all hover:opacity-90">
            {displayImage ? (
              <Image
                src={displayImage}
                alt="Avatar"
                layout="fullWidth"
                className="w-full h-full object-cover transition-opacity duration-300"
                priority
              />
            ) : (
              // CHANGED: Replaced <User /> with the Gradient Div to match your screenshot
              <div className="w-full h-full bg-gradient-to-br from-pink-300 via-rose-300 to-indigo-300" />
            )}

            {/* Hover Overlay - Made subtler */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <Camera className="w-6 h-6 text-white/90 drop-shadow-md" />
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          <Input
            ref={ref}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {/* CHANGED: Hidden the "Tap to upload" text as it is not in the design screenshot */}
        <p className="hidden text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">
          Tap to upload photo
        </p>
      </div>
    );
  },
);

AvatarUpload.displayName = "AvatarUpload";
