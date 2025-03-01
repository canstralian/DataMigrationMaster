import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DatasetCardPreviewProps {
  markdown: string;
  onEdit?: (newMarkdown: string) => void;
  onDownload?: () => void;
}

export default function DatasetCardPreview({ markdown, onEdit, onDownload }: DatasetCardPreviewProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMarkdown, setEditedMarkdown] = useState(markdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedMarkdown(markdown);
    // Focus the textarea after render
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onEdit) {
      onEdit(editedMarkdown);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedMarkdown(markdown);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "Dataset card markdown has been copied to clipboard.",
        });
      },
      (err) => {
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard: " + err,
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Dataset Card Preview</CardTitle>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  Copy
                </Button>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={handleStartEdit}>
                    Edit
                  </Button>
                )}
                {onDownload && (
                  <Button variant="secondary" size="sm" onClick={onDownload}>
                    Download
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="w-full h-[500px] font-mono text-sm p-4 border rounded-md"
            value={editedMarkdown}
            onChange={(e) => setEditedMarkdown(e.target.value)}
          />
        ) : (
          <div className="w-full h-[500px] overflow-auto bg-neutral-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap font-mono text-sm">{markdown}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}