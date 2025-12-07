import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
// import gray-matter from 'gray-matter'; // Removed to avoid Buffer dependency in browser

// MDX-like processing for preview
// MDX-like processing for preview
export async function compileMDXForPreview(content: string, filePath?: string): Promise<string> {
  try {
    // Simple frontmatter parser to avoid gray-matter/Buffer issues
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const body = fmMatch ? content.replace(fmMatch[0], '') : content;
    
    // 0. Extract imports to resolve variables
    const imports: Record<string, string> = {};
    const importRegex = /^import\s+(\w+)\s+from\s+['"](.*?)['"]\s*;?/gm;
    let match;
    while ((match = importRegex.exec(body)) !== null) {
        const [_, varName, importPath] = match;
        // Resolve path relative to filePath
        // filePath: "2025-08/2025-08-30/article.mdx"
        // importPath: "./images/foo.png" or "@/components/..."
        let resolved = importPath;
        if (filePath && importPath.startsWith('.')) {
            // Very basic path resolution for browser
            const dir = filePath.split('/').slice(0, -1).join('/');
            // Remove leading ./
            const cleanImport = importPath.replace(/^\.\//, '');
            // Construct absolute path for Vite dev server
            // Assuming content is in src/content/blog
            resolved = `/src/content/blog/${dir}/${cleanImport}`;
        }
        imports[varName] = resolved;
    }

    // 1. Strip imports/exports (lines starting with import/export)
    let preprocessed = body
        .replace(/^import\s+[\s\S]*?from\s+['"].*?['"]\s*;?/gm, '')
        .replace(/^export\s+.*$/gm, '');

    // 1.5. Resolve standard markdown relative images ![alt](./path)
    preprocessed = preprocessed.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
        let resolved = src;
        if (filePath && src.startsWith('.')) {
             const dir = filePath.split('/').slice(0, -1).join('/');
            const cleanImport = src.replace(/^\.\//, '');
            resolved = `/src/content/blog/${dir}/${cleanImport}`;
        }
        return `![${alt}](${resolved})`;
    });

    // 2. Custom replacements for components to make them visible in standard HTML preview
    
    // Helper to resolve src (literal or variable)
    const resolveSrc = (val: string) => {
        // if val is wrapped in {}, it's a variable
        const varMatch = val.match(/^{(.*)}$/);
        if (varMatch) {
            return imports[varMatch[1].trim()] || val;
        }
        return val;
    };

    preprocessed = preprocessed
      // <CaptionedImage src={var} ... /> or src="..."
      .replace(/<CaptionedImage\s+src=(['"{].*?['"}])\s+alt=['"](.*?)['"].*?\/>/g, (match, srcRaw, alt) => {
          const src = resolveSrc(srcRaw);
           // clean quotes if literal
          const cleanSrc = src.replace(/^['"]|['"]$/g, '');
          return `<figure class="text-center my-4"><img src="${cleanSrc}" alt="${alt}" class="max-w-full h-auto mx-auto rounded shadow"/><figcaption class="text-sm text-gray-500 mt-2">${alt}</figcaption></figure>`;
      })
      // <ImageGrid ... />
      .replace(/<ImageGrid.*?images={(\[.*?\])}.*?\/>/s, (match, jsonRaw) => {
          // Attempt to parse the JS array string. 
          // It might contain objects with src: varName.
          // We can't use JSON.parse because it's JS (prop: val).
          // Regex approach: find objects { ... }
          let gridHtml = '<div class="grid grid-cols-2 gap-2 my-4">';
          
          const itemRegex = /{\s*src:\s*(\w+),\s*alt:\s*['"](.*?)['"],?\s*}/g;
          let itemMatch;
          let found = false;
          // We search in the inner array string
          while ((itemMatch = itemRegex.exec(jsonRaw)) !== null) {
              found = true;
              const [_, srcVar, alt] = itemMatch;
              const src = imports[srcVar] || srcVar;
              gridHtml += `<div class="aspect-video relative overflow-hidden rounded shadow"><img src="${src}" alt="${alt}" class="object-cover w-full h-full" /></div>`;
          }
          
          if (!found) {
               // Fallback if parsing fails or empty
               return `<div class="p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-500">Image Grid (${jsonRaw.length} chars)</div>`;
          }
          
          gridHtml += '</div>';
          return gridHtml;
      })
      // Generic proper closing
      .replace(/<([A-Z][a-zA-Z0-9]*)\s*[^>]*?\/?>/g, (match, name) => {
          return `<div class="border border-dashed border-gray-400 p-2 rounded text-gray-500 text-xs bg-gray-50 dark:bg-gray-800 inline-block">Component: ${name}</div>`;
      });

    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(preprocessed);

    return String(file);
  } catch (e: any) {
    console.error('Preview compilation error:', e);
    return `<div class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded mb-4">
      <p class="font-bold">Preview Error</p>
      <pre class="text-xs overflow-auto mt-2">${e.message || String(e)}</pre>
    </div>`;
  }
}
