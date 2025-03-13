import { FileUp } from "lucide-react";

export default function FileDropPlaceholder() {
  return (
    <div className="absolute inset-0 flex fade-in animate-in items-center bg-foreground/50 gap-4 justify-center flex-col">
      <FileUp className="text-background size-12" />
      <p className="text-background font-bold text-2xl">Drop your CSV here</p>
    </div>
  );
}
