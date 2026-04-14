import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
}

declare global {
  interface Window {
    tinymce: any;
  }
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder,
  minHeight = 400 
}) => {
  const containerRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!window.tinymce) return;

    window.tinymce.init({
      target: containerRef.current,
      height: minHeight,
      menubar: true, // Show menu for "Word" feel
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | blocks | ' +
        'bold italic underline forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
      content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; }',
      skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
      content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      placeholder: placeholder,
      init_instance_callback: (editor: any) => {
        editorRef.current = editor;
        editor.on('Change KeyUp Undo Redo', () => {
          onChange(editor.getContent());
        });
      },
      setup: (editor: any) => {
        editor.on('init', () => {
          editor.setContent(value);
        });
      }
    });

    return () => {
      if (editorRef.current) {
        window.tinymce.remove(editorRef.current);
      }
    };
  }, []);

  // Update content only if it's external change and editor is ready
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getContent()) {
      editorRef.current.setContent(value || '');
    }
  }, [value]);

  return (
    <div className="rich-text-editor-container rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <textarea ref={containerRef} />
    </div>
  );
};

export default RichTextEditor;
