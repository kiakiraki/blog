import React, { useState, useEffect, useCallback } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  Save,
  FolderOpen,
  FilePlus,
  RefreshCw,
  Image as ImageIcon,
  LayoutGrid,
  Type,
  Sidebar as SidebarIcon,
  FileText,
} from 'lucide-react';

export default function RefinedMDXEditor() {
  const [content, setContent] = useState<string>('---\ntitle: New Article\n---\n\n# Hello World');
  const [filename, setFilename] = useState('new-article');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [fileList, setFileList] = useState<
    Array<{ path: string; title?: string; pubDate?: string }>
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  // Initial fetch
  useEffect(() => {
    fetchFileList();
    updatePreview(content, currentPath);
  }, []); // content dependency removed from initial mount to avoid double render, logic handles it

  useEffect(() => {
    // Debounced preview update could go here, but for now we rely on explicit calls or simple effect
    updatePreview(content, currentPath);
  }, [content]);

  const fetchFileList = async () => {
    try {
      const res = await fetch('/api/dev/list-mdx');
      const json = await res.json();
      if (json.ok) setFileList(json.files);
    } catch (e) {
      console.error(e);
    }
  };

  const loadFile = async (path: string) => {
    if (!confirm('Discard current changes?')) return;
    try {
      const res = await fetch(`/api/dev/read-mdx?path=${encodeURIComponent(path)}`);
      const json = await res.json();
      if (json.ok) {
        setContent(json.content);
        // Extract filename from path for saving
        // path is like "2024-01/2024-01-01/article.mdx"
        const name =
          path
            .split('/')
            .pop()
            ?.replace(/\.mdx$/, '') || 'article';
        setFilename(name);
        setCurrentPath(path);
        // Extract date if possible from path or frontmatter (simple path parse here)
        const dateMatch = path.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) setPublishDate(dateMatch[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updatePreview = useCallback(async (mdx: string, path: string) => {
    // Debounce/Throttle could be added here if needed
    try {
      const { compileMDXForPreview } = await import('../../lib/mdx-processor');
      const html = await compileMDXForPreview(mdx, path);
      setPreviewHtml(html);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/dev/save-mdx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          publishDate,
          content,
          overwrite: true, // temporary default
        }),
      });
      const json = await res.json();
      if (json.ok) {
        alert('Saved successfully!');
        fetchFileList(); // refresh list
      } else {
        alert('Save failed: ' + json.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error saving');
    }
  };

  const insertTextAtCursor = (text: string) => {
    if (!editorView) return;
    const range = editorView.state.selection.main;
    editorView.dispatch({
      changes: { from: range.from, to: range.to, insert: text },
      selection: { anchor: range.from + text.length },
    });
  };

  const handleValidation = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const items = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (items.length === 0) return;

      const formData = new FormData();
      formData.append('publishDate', publishDate);
      formData.append('subdir', 'images');
      items.forEach(f => formData.append('file', f));

      try {
        // Optimistic UI or Loading state could start here
        const res = await fetch('/api/dev/upload-image', { method: 'POST', body: formData });
        const json = await res.json();
        if (json.ok && json.files) {
          json.files.forEach((f: { name: string }) => {
            insertTextAtCursor(`![image](./images/${f.name})`);
          });
        } else {
          alert('Upload failed: ' + json.error);
        }
      } catch (e) {
        console.error(e);
        alert('Upload Error');
      }
    },
    [publishDate, editorView]
  );

  const onPaste = (event: React.ClipboardEvent) => {
    if (event.clipboardData.files.length > 0) {
      handleValidation(event.clipboardData.files);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    handleValidation(event.dataTransfer.files);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header / Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <SidebarIcon size={20} />
          </button>
          <h1 className="text-lg font-bold">MDX Editor</h1>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded p-1">
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm px-2 w-40"
              placeholder="Filename"
            />
            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <input
              type="date"
              value={publishDate}
              onChange={e => setPublishDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm px-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            <Save size={16} /> Save
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded transition-colors"
            title="Load"
          >
            <FolderOpen size={18} />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded transition-colors"
            title="New"
          >
            <FilePlus size={18} />
          </button>
        </div>
      </header>

      {/* Main Split View */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          {isSidebarOpen && (
            <>
              <Panel
                defaultSize={20}
                minSize={15}
                maxSize={30}
                className="bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
              >
                <div className="p-2 text-xs font-semibold uppercase text-gray-500">Files</div>
                <div className="flex-1 overflow-auto">
                  {fileList.map((f, i) => (
                    <div
                      key={i}
                      onClick={() => loadFile(f.path)}
                      className="px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 truncate flex items-center gap-2"
                    >
                      <FileText size={14} className="opacity-50" />
                      <span>{f.path}</span>
                    </div>
                  ))}
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors" />
            </>
          )}

          <Panel minSize={30}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs">
                    <button
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Insert Image"
                    >
                      <ImageIcon size={14} />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Insert Grid"
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Insert Header"
                    >
                      <Type size={14} />
                    </button>
                  </div>
                  <div
                    className="flex-1 overflow-auto relative text-base"
                    onPaste={onPaste}
                    onDrop={onDrop}
                    onDragOver={e => e.preventDefault()}
                  >
                    <CodeMirror
                      value={content}
                      height="100%"
                      extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                      onChange={val => setContent(val)}
                      onCreateEditor={view => setEditorView(view)}
                      theme="dark" // dynamic theme handling needed later
                      className="h-full"
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        history: true,
                        foldGutter: true,
                        drawSelection: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        syntaxHighlighting: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        defaultKeymap: true,
                        searchKeymap: true,
                        historyKeymap: true,
                        foldKeymap: true,
                        completionKeymap: true,
                        lintKeymap: true,
                      }}
                    />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors" />
              <Panel minSize={20}>
                <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <span className="font-semibold text-xs uppercase text-gray-500">Preview</span>
                    <button onClick={() => updatePreview(content, currentPath)} title="Refresh">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-8 prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
