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
  const isInternalUpdate = useRef<boolean>(false);

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
        }
      })
      .then((editor: any) => {
        editorRef.current = editor;
        
        // Load data awal
        if (value) {
          editor.setData(value);
        }

        // Tangkap perubahan teks
        editor.model.document.on('change:data', () => {
          if (!isInternalUpdate.current) {
            const data = editor.getData();
            onChange(data);
          }
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
          .catch((err: any) => console.error('Destroy error:', err));
      }
    };
  }, []); // Cuma jalan sekali pas mount

  // Sync data kalau berubah dari luar (misal: ganti artikel)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      isInternalUpdate.current = true;
      editorRef.current.setData(value || '');
      // Kasih delay dikit biar gak bentrok sama event listener
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 50);
    }
  }, [value]);

  return (
    <div className="ckeditor-wrapper rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <div ref={containerRef} />
      
      <style>{`
        .ck-editor__editable_inline {
          min-height: ${minHeight}px !important;
          padding: 30px 40px !important;
        }

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

        .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }

        /* Dark Mode Icons */
        .dark .ck.ck-toolbar .ck-icon, 
        .dark .ck.ck-toolbar .ck-button {
          color: #94a3b8 !important;
        }
        
        .dark .ck.ck-button:hover {
          background: #1e293b !important;
        }
        
        .dark .ck.ck-button.ck-on {
          background: #1e293b !important;
          color: #8b5cf6 !important;
        }

        .dark .ck.ck-dropdown__panel {
          background: #0f172a !important;
          border-color: #1e293b !important;
        }

        .dark .ck.ck-list {
          background: #0f172a !important;
        }

        .dark .ck.ck-list__item:hover > .ck-button {
          background: #1e293b !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
