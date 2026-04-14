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
  const valueRef = useRef(value); // Tracking value without re-renders

  useEffect(() => {
    if (!window.tinymce || !containerRef.current) return;

    window.tinymce.init({
      target: containerRef.current,
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
          editor.setContent(valueRef.current || '');
        });

        // Trigger onChange on any change
        const handleChange = () => {
          const content = editor.getContent();
          if (content !== valueRef.current) {
            valueRef.current = content;
            // Immediate update for better responsiveness during typing/pasting
            onChange(content);
          }
        };

        // Comprehensive event list to catch all possible content changes
        editor.on('Change KeyUp Undo Redo NodeChange input Paste ExecCommand SetContent', handleChange);
      }
    });

    return () => {
      if (editorRef.current) {
        window.tinymce.remove(editorRef.current);
        editorRef.current = null;
      }
    };
  }, []);

  // Sync external changes (only if it's a real external update like switching articles)
  useEffect(() => {
    const syncContent = () => {
      if (editorRef.current && value !== valueRef.current) {
        valueRef.current = value;
        editorRef.current.setContent(value || '');
      }
    };

    // If editor is already ready, sync now
    if (editorRef.current) {
      syncContent();
    } else {
      // If not ready, TinyMCE 'init' event in setup will handle it using valueRef
      valueRef.current = value;
    }
  }, [value]);

  return (
    <div className="rich-text-editor-container rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <textarea ref={containerRef} style={{ visibility: 'hidden' }} />
      
      <style>{`
        .tox-tinymce {
          border: none !important;
        }
        .tox .tox-menubar {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .dark .tox .tox-menubar {
          background-color: #0f172a !important;
          border-bottom: 1px solid #1e293b !important;
        }
        .tox .tox-toolbar__primary {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .dark .tox .tox-toolbar__primary {
          background-color: #0f172a !important;
          border-bottom: 1px solid #1e293b !important;
        }
        .dark .tox .tox-mbtn, .dark .tox .tox-tbtn, .dark .tox .tox-edit-area__iframe {
          background-color: transparent !important;
          color: #94a3b8 !important;
        }
        .dark .tox .tox-tbtn svg {
          fill: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
