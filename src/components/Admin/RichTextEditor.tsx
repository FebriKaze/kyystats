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
      skin: 'oxide',
      content_css: 'default',
      placeholder: placeholder,
      setup: (editor: any) => {
        editorRef.current = editor;
        
        editor.on('init', () => {
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
  }, [editorId, minHeight, placeholder]);

  useEffect(() => {
    if (editorRef.current && value !== valueRef.current) {
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
    <div className="rich-text-editor-container rounded-none overflow-hidden border border-slate-200 shadow-sm bg-white font-sans">
      <textarea id={editorId} style={{ visibility: 'hidden' }} />
      
      <style>{`
        .tox-tinymce { border: none !important; }
        .tox .tox-menubar { background-color: #f8fafc !important; border-bottom: 1px solid #e2e8f0 !important; font-family: sans-serif; }
        .tox .tox-toolbar__primary { background-color: #f8fafc !important; border-bottom: 1px solid #e2e8f0 !important; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
