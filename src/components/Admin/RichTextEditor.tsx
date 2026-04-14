import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
}

declare global {
  interface Window {
    Quill: any;
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
    if (!window.Quill || !containerRef.current || editorRef.current) return;

    // Initialize Quill
    editorRef.current = new window.Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder,
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ]
      }
    });

    // Set initial value
    if (value) {
      editorRef.current.root.innerHTML = value;
    }

    // Listen for changes
    editorRef.current.on('text-change', () => {
      const html = editorRef.current.root.innerHTML;
      // Normalizing empty content to avoid unnecessary updates
      const cleanHtml = html === '<p><br></p>' ? '' : html;
      onChange(cleanHtml);
    });

    return () => {
      // Quill doesn't have a formal destroy method in 1.3.6, but we can clean up the toolbar
      const toolbar = containerRef.current?.parentElement?.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.remove();
      }
    };
  }, []);

  // Sync value from parent if it changes externally
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.root.innerHTML) {
      // Only update if the content actually differs (ignoring <p><br></p> vs empty)
      const currentHtml = editorRef.current.root.innerHTML;
      if (!(value === '' && currentHtml === '<p><br></p>')) {
        editorRef.current.root.innerHTML = value || '';
      }
    }
  }, [value]);

  return (
    <div className="rich-text-editor-wrapper bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner">
      <div ref={containerRef} style={{ minHeight: `${minHeight}px`, fontSize: '16px' }} />
      
      <style>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          background: #f8fafc;
          padding: 12px 20px !important;
        }
        .dark .ql-toolbar.ql-snow {
          background: #0f172a;
          border-bottom: 1px solid #1e293b !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
        }
        .ql-editor {
          padding: 30px 40px !important;
          line-height: 1.8 !important;
          color: inherit !important;
        }
        .ql-editor.ql-blank::before {
          color: #94a3b8 !important;
          font-style: italic !important;
          left: 40px !important;
        }
        .dark .ql-toolbar .ql-stroke { stroke: #94a3b8 !important; }
        .dark .ql-toolbar .ql-fill { fill: #94a3b8 !important; }
        .dark .ql-toolbar .ql-picker { color: #94a3b8 !important; }
        .dark .ql-editor { color: #f1f5f9 !important; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
