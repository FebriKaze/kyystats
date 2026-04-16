import React, { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
  id?: string;
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
  minHeight = 400,
  id: propId
}) => {
  const [editorId] = useState(() => propId || `editor-${Math.random().toString(36).substr(2, 9)}`);
  const editorRef = useRef<any>(null);
  const valueRef = useRef(value);

  // Sync the latest value to valueRef for init logic
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!window.tinymce) return;

    window.tinymce.init({
      selector: `#${editorId}`,
      height: minHeight,
      menubar: 'file edit view insert format tools table help',
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | blocks fontfamily fontsize | ' +
        'bold italic underline forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
      content_style: `
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          font-size: 16px; 
          line-height: 1.6;
          padding: 20px;
        }
      `,
      skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
      content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      placeholder: placeholder,
      setup: (editor: any) => {
        editorRef.current = editor;
        
        editor.on('init', () => {
          // Force content set on init from valueRef
          editor.setContent(valueRef.current || '');
        });

        const handleChange = () => {
          const content = editor.getContent();
          if (content !== valueRef.current) {
            valueRef.current = content;
            onChange(content);
          }
        };

        editor.on('Change KeyUp Undo Redo NodeChange input Paste ExecCommand SetContent', handleChange);
      }
    });

    return () => {
      if (editorRef.current) {
        window.tinymce.remove(editorRef.current);
        editorRef.current = null;
      }
    };
  }, [editorId]); // Only re-init if ID changes

  // Sync external changes (like switching items)
  useEffect(() => {
    if (editorRef.current && value !== valueRef.current) {
      // Small delay to ensure TinyMCE is stable if many events happen together
      const timeout = setTimeout(() => {
        if (editorRef.current && value !== editorRef.current.getContent()) {
          valueRef.current = value;
          editorRef.current.setContent(value || '');
        }
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [value]);

  return (
    <div className="rich-text-editor-container rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <textarea id={editorId} style={{ visibility: 'hidden' }} />
      
      <style>{`
        .tox-tinymce { border: none !important; }
        .tox .tox-menubar { background-color: #f8fafc !important; border-bottom: 1px solid #f1f5f9 !important; }
        .dark .tox .tox-menubar { background-color: #0f172a !important; border-bottom: 1px solid #1e293b !important; }
        .tox .tox-toolbar__primary { background-color: #f8fafc !important; border-bottom: 1px solid #f1f5f9 !important; }
        .dark .tox .tox-toolbar__primary { background-color: #0f172a !important; border-bottom: 1px solid #1e293b !important; }
        .dark .tox .tox-mbtn, .dark .tox .tox-tbtn, .dark .tox .tox-edit-area__iframe { background-color: transparent !important; color: #94a3b8 !important; }
        .dark .tox .tox-tbtn svg { fill: #94a3b8 !important; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
