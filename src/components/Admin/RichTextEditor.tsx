import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
}

declare global {
  interface Window {
    ClassicEditor: any;
  }
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder,
  minHeight = 400 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!window.ClassicEditor || !containerRef.current || editorRef.current) return;

    window.ClassicEditor
      .create(containerRef.current, {
        placeholder: placeholder || 'Tulis sesuatu...',
        toolbar: {
          items: [
            'heading', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'bulletedList', 'numberedList', '|',
            'alignment', 'outdent', 'indent', '|',
            'link', 'blockQuote', 'insertTable', 'mediaEmbed', '|',
            'undo', 'redo'
          ]
        },
        language: 'id'
      })
      .then((editor: any) => {
        editorRef.current = editor;
        
        // Initial set content
        editor.setData(value || '');

        // Listen for changes
        editor.model.document.on('change:data', () => {
          const data = editor.getData();
          onChange(data);
        });
      })
      .catch((error: any) => {
        console.error('CKEditor Error:', error);
      });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
          .then(() => {
            editorRef.current = null;
          })
          .catch((err: any) => console.error(err));
      }
    };
  }, []);

  // Sync value from parent
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      editorRef.current.setData(value || '');
    }
  }, [value]);

  return (
    <div className="ckeditor-wrapper rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={containerRef} />
      
      <style>{`
        /* Menyesuaikan Tinggi Minimal */
        .ck-editor__editable_inline {
          min-height: ${minHeight}px !important;
          padding: 30px 40px !important;
        }

        /* Styling Toolbar agar Premium */
        .ck.ck-toolbar {
          background: #f8fafc !important;
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 8px 15px !important;
        }

        .dark .ck.ck-toolbar {
          background: #0f172a !important;
          border-bottom: 1px solid #1e293b !important;
        }

        /* Styling Konten Gelap/Terang */
        .ck.ck-editor__main > .ck-editor__editable {
          background: white !important;
          border: none !important;
          color: #1e293b !important;
          font-size: 16px !important;
          line-height: 1.8 !important;
        }

        .dark .ck.ck-editor__main > .ck-editor__editable {
          background: #020617 !important;
          color: #f1f5f9 !important;
        }

        /* Rapiin Border Fokus */
        .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
          border: none !important;
          box-shadow: inset 0 0 0 2px rgba(139, 92, 246, 0.1) !important;
        }

        /* Warna Ikon di Dark Mode */
        .dark .ck.ck-toolbar .ck-icon {
          color: #94a3b8 !important;
        }

        .dark .ck.ck-button:hover {
          background: #1e293b !important;
        }
        
        .dark .ck.ck-button.ck-on {
          background: #1e293b !important;
          color: #8b5cf6 !important;
        }

        .ck-reset_all :not(.ck-reset_all-excluded) {
            font-family: inherit !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
