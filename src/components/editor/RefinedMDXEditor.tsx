// @ts-nocheck
import React from 'react';
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
  const LAST_PATH_KEY = 'mdx-editor:lastPath';
  const CAPTIONED_IMPORT = "import CaptionedImage from '@/components/CaptionedImage.astro';";
  const [content, setContent] = React.useState<string>(
    '---\ntitle: New Article\n---\n\n# Hello World'
  );
  const [filename, setFilename] = React.useState('new-article');
  const [publishDate, setPublishDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [previewHtml, setPreviewHtml] = React.useState<string>('');
  const [fileList, setFileList] = React.useState<
    Array<{ path: string; title?: string; pubDate?: string }>
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [currentPath, setCurrentPath] = React.useState<string>('');
  const [editorView, setEditorView] = React.useState<EditorView | null>(null);

  const ensureCaptionedImport = React.useCallback(() => {
    const insertImport = (text: string) => {
      if (text.includes(CAPTIONED_IMPORT)) return null;
      const fmMatch = text.match(/^---[\s\S]*?---\n?/);
      const pos = fmMatch ? fmMatch[0].length : 0;
      return { pos, line: `${CAPTIONED_IMPORT}\n` };
    };

    if (editorView) {
      const docText = editorView.state.doc.toString();
      const res = insertImport(docText);
      if (!res) return;
      editorView.dispatch({
        changes: { from: res.pos, to: res.pos, insert: res.line },
      });
      return;
    }

    setContent(prev => {
      const res = insertImport(prev);
      if (!res) return prev;
      return prev.slice(0, res.pos) + res.line + prev.slice(res.pos);
    });
  }, [editorView]);

  // Initial fetch
  React.useEffect(() => {
    fetchFileList();
    updatePreview(content, currentPath);
    // 前回開いていたファイルを復元
    const lastPath = localStorage.getItem(LAST_PATH_KEY);
    if (lastPath) {
      loadFile(lastPath, { skipConfirm: true });
    }
  }, []); // content dependency removed from initial mount to avoid double render, logic handles it

  React.useEffect(() => {
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

  const loadFile = async (path: string, opts?: { skipConfirm?: boolean }) => {
    if (!opts?.skipConfirm && !confirm('Discard current changes?')) return;
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
        localStorage.setItem(LAST_PATH_KEY, path);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updatePreview = React.useCallback(async (mdx: string, path: string) => {
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
      const preparedContent = ensureFrontmatterFields(content, {
        publishDate,
        fallbackTitle: filename,
      });
      const res = await fetch('/api/dev/save-mdx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          publishDate,
          content: preparedContent,
          overwrite: true, // temporary default
        }),
      });
      const json = await res.json();
      if (json.ok) {
        alert('Saved successfully!');
        if (json.path) {
          setCurrentPath(json.path);
          localStorage.setItem(LAST_PATH_KEY, json.path);
        }
        fetchFileList(); // refresh list
      } else {
        alert('Save failed: ' + json.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error saving');
    }
  };

  const handleValidation = React.useCallback(
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
          ensureCaptionedImport();
          let workingText = editorView
            ? editorView.state.doc.toString()
            : ensureImportLine(content, CAPTIONED_IMPORT);
          json.files.forEach((f: { name: string }) => {
            const baseName = f.name.replace(/\.[^.]+$/, '');
            const safeText = baseName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            const identifier = createImageIdentifier(workingText, baseName);
            const relPath = `./images/${f.name}`;
            const snippet = `\n<CaptionedImage\n  src={${identifier}}\n  alt="${safeText}"\n  caption="${safeText}"\n/>\n`;

            if (editorView) {
              const importChange = buildImageImportChange(workingText, identifier, relPath);
              const selection = editorView.state.selection.main;
              const snippetChange = { from: selection.from, to: selection.to, insert: snippet };
              const changes = [...(importChange ? [importChange] : []), snippetChange].sort(
                (a, b) => a.from - b.from
              );
              const deltaBeforeSnippet =
                importChange && importChange.from <= selection.from
                  ? importChange.insert.length - (importChange.to - importChange.from)
                  : 0;
              const anchor = selection.from + deltaBeforeSnippet + snippet.length;

              editorView.dispatch({
                changes,
                selection: { anchor },
              });

              workingText = editorView.state.doc.toString();
            } else {
              const importChange = buildImageImportChange(workingText, identifier, relPath);
              const changes = [
                ...(importChange ? [importChange] : []),
                { from: workingText.length, to: workingText.length, insert: snippet },
              ].sort((a, b) => a.from - b.from);

              workingText = applyChangesSequentially(workingText, changes);
            }
          });

          if (editorView) {
            setContent(editorView.state.doc.toString());
          } else {
            setContent(workingText);
          }
        } else {
          alert('Upload failed: ' + json.error);
        }
      } catch (e) {
        console.error(e);
        alert('Upload Error');
      }
    },
    [publishDate, editorView, ensureCaptionedImport, content]
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm px-2 w-40"
              placeholder="Filename"
            />
            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <input
              type="date"
              value={publishDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublishDate(e.target.value)}
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
                  {fileList.map((f: { path: string }, i: number) => (
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
                    onDragOver={(e: React.DragEvent) => e.preventDefault()}
                  >
                    <CodeMirror
                      value={content}
                      height="100%"
                      extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                      onChange={(val: string) => setContent(val)}
                      onCreateEditor={(view: EditorView) => setEditorView(view)}
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

type FrontmatterOptions = {
  publishDate: string;
  fallbackTitle: string;
};

function ensureFrontmatterFields(content: string, opts: FrontmatterOptions) {
  const { publishDate, fallbackTitle } = opts;
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  const fmLines = match ? match[1].split(/\r?\n/) : [];
  const rest = match ? content.slice(match[0].length) : content;

  const hasKey = (key: string) => fmLines.some(line => new RegExp(`^${key}\\s*:`).test(line));
  const ensureLine = (key: string, line: string) => {
    if (!hasKey(key)) fmLines.push(line);
  };

  ensureLine('title', `title: '${fallbackTitle.replace(/'/g, "''")}'`);
  ensureLine('description', "description: ''");
  ensureLine('pubDate', `pubDate: '${publishDate}'`);
  ensureLine('category', "category: ''");

  const fm = ['---', ...fmLines.filter(Boolean), '---', ''].join('\n');
  return fm + rest.replace(/^\n+/, '');
}

function ensureImportLine(text: string, importLine: string) {
  if (text.includes(importLine)) return text;
  const fmMatch = text.match(/^---[\s\S]*?---\n?/);
  const pos = fmMatch ? fmMatch[0].length : 0;
  return text.slice(0, pos) + `${importLine}\n` + text.slice(pos);
}

function createImageIdentifier(current: string, baseName: string) {
  const sanitized = baseName.replace(/[^a-zA-Z0-9_]/g, '_');
  const base = /^[A-Za-z_]/.test(sanitized) ? sanitized : `img_${sanitized}`;
  const fallback = base || 'img';
  let candidate = fallback;
  let suffix = 1;
  const exists = (name: string) => new RegExp(`\\b${name}\\b`).test(current);
  while (exists(candidate)) {
    candidate = `${fallback}${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function buildImageImportChange(text: string, identifier: string, relPath: string) {
  const escapedPath = relPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const importPattern = new RegExp(
    `^import\\s+${identifier}\\s+from\\s+['\"]${escapedPath}['\"];?`,
    'm'
  );
  if (importPattern.test(text)) return null;

  const fmMatch = text.match(/^---[\s\S]*?---\n?/);
  const frontmatterEnd = fmMatch ? fmMatch[0].length : 0;
  const importRegex = /^import\s.+;$/gm;
  let insertPos = frontmatterEnd;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(text)) !== null) {
    insertPos = m.index + m[0].length;
  }

  const needsLeadingNewline = insertPos > 0 && text[insertPos] !== '\n';
  const insert = `${needsLeadingNewline ? '\n' : ''}import ${identifier} from '${relPath}';\n`;
  return { from: insertPos, to: insertPos, insert };
}

function applyChangesSequentially(
  text: string,
  changes: Array<{ from: number; to: number; insert: string }>
) {
  let offset = 0;
  let next = text;
  changes.forEach(change => {
    const from = change.from + offset;
    const to = change.to + offset;
    next = next.slice(0, from) + change.insert + next.slice(to);
    offset += change.insert.length - (change.to - change.from);
  });
  return next;
}
