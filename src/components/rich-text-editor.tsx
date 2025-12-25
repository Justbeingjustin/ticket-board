'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  ImageIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  onSubmit?: () => void;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something...',
  className,
  compact = false,
  onSubmit,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert focus:outline-none px-3 py-2',
          compact ? 'min-h-[60px]' : 'min-h-[150px]'
        ),
      },
      handleKeyDown: (view, event) => {
        if (onSubmit && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: base64 })
                )
              );
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-background w-full', className)}>
      {/* Toolbar */}
      <div className={cn(
        'flex items-center gap-1 border-b bg-muted/30 flex-wrap',
        compact ? 'p-1' : 'p-2'
      )}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0',
            editor.isActive('bold') && 'bg-muted'
          )}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0',
            editor.isActive('italic') && 'bg-muted'
          )}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </Button>
        
        <Separator orientation="vertical" className={compact ? 'h-4 mx-0.5' : 'h-6 mx-1'} />
        
        {!compact && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-muted')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-muted')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('h-8 w-8 p-0', editor.isActive('blockquote') && 'bg-muted')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
          </>
        )}
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
          onClick={addImage}
        >
          <ImageIcon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </Button>
        
        {!compact && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {/* Editor */}
      <div className="overflow-hidden min-w-0 w-full max-w-full">
        <EditorContent editor={editor} className="w-full max-w-full" />
      </div>
    </div>
  );
}

