import { FileUp } from "lucide-react";

export default function FileDropPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-foreground/50 animate-in fade-in">
      <FileUp className="size-12 text-background" />
      <p className="text-2xl font-bold text-background">Drop your CSV here</p>
    </div>
  );
}
