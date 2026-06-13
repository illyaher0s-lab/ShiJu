import { Sparkles } from "lucide-react";

interface SelectionToolbarProps {
  selectedText: string;
  onGenerate: (selectedText: string) => void;
}

export function SelectionToolbar({ selectedText, onGenerate }: SelectionToolbarProps) {
  return (
    <div className="selectionToolbar" role="region" aria-label="Selected text actions">
      <span>{selectedText}</span>
      <button type="button" onClick={() => onGenerate(selectedText)}>
        <Sparkles size={16} />
        Generate card
      </button>
    </div>
  );
}
