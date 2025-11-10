class SimpleMDXEditor {
  input: HTMLTextAreaElement;
  preview: HTMLDivElement;
  fileName: HTMLInputElement;
  publishDate: HTMLInputElement;
  dropZone: HTMLDivElement;
  imageGallery: HTMLDivElement;
  captionedModal: HTMLDivElement;
  gridModal: HTMLDivElement;
  headerModal: HTMLDivElement;
  loadModal: HTMLDivElement;
  mdxList: any[];
  uploadedImages: Array<{ name: string; url: string; file: File }>;
  availableImages: Array<{ name: string; path: string; url: string }>;
  importMap: Record<string, string>;

  constructor() {
    this.input = document.getElementById('mdx-input') as HTMLTextAreaElement;
    this.preview = document.getElementById('preview-panel') as HTMLDivElement;
    this.fileName = document.getElementById('file-name') as HTMLInputElement;
    this.publishDate = document.getElementById('publish-date') as HTMLInputElement;
    this.dropZone = document.getElementById('drop-zone') as HTMLDivElement;
    this.imageGallery = document.getElementById('image-gallery') as HTMLDivElement;
    this.captionedModal = document.getElementById('captioned-modal') as HTMLDivElement;
    this.gridModal = document.getElementById('grid-modal') as HTMLDivElement;
    this.headerModal = document.getElementById('header-modal') as HTMLDivElement;
    this.loadModal = document.getElementById('load-modal') as HTMLDivElement;
    this.mdxList = [];

    this.uploadedImages = [];
    this.availableImages = [];
    this.importMap = {};

    this.restore();
    this.setDefaultDate();
    this.bind();
    this.updatePreview();
    this.initDragAndDrop();
    this.initClipboardPaste();
    this.autoResizeTextarea();
  }

  setDefaultDate() {
    if (!this.publishDate.value) {
      const today = new Date().toISOString().split('T')[0];
      this.publishDate.value = today;
    }
  }

  bind() {
    this.input.addEventListener('input', () => {
      this.updatePreview();
      this.persist();
      this.autoResizeTextarea();
    });
    this.fileName.addEventListener('change', () => this.persist());
    this.publishDate.addEventListener('change', () => this.persist());

    document.getElementById('refresh-btn')?.addEventListener('click', () => this.updatePreview());
    document.getElementById('save-btn')?.addEventListener('click', () => this.saveMDX());
    document.getElementById('load-btn')?.addEventListener('click', () => this.openLoadModal());
    document.getElementById('new-btn')?.addEventListener('click', () => this.newTemplate());
    document
      .getElementById('generate-header-btn')
      ?.addEventListener('click', () => this.openHeaderModal());

    document
      .getElementById('add-image-btn')
      ?.addEventListener('click', () => this.addImageInput());
    document
      .getElementById('add-captioned-btn')
      ?.addEventListener('click', () => this.openCaptionedModal());
    document
      .getElementById('add-grid-btn')
      ?.addEventListener('click', () => this.openGridModal());
    document
      .getElementById('paste-image-btn')
      ?.addEventListener('click', () => this.pasteFromClipboard());

    document
      .getElementById('apply-captioned')
      ?.addEventListener('click', () => this.applyCaptionedImage());
    document
      .getElementById('cancel-captioned')
      ?.addEventListener('click', () => this.closeModal(this.captionedModal));
    document.getElementById('apply-grid')?.addEventListener('click', () => this.applyImageGrid());
    document
      .getElementById('cancel-grid')
      ?.addEventListener('click', () => this.closeModal(this.gridModal));
    document.getElementById('apply-header')?.addEventListener('click', () => this.applyHeader());
    document
      .getElementById('cancel-header')
      ?.addEventListener('click', () => this.closeModal(this.headerModal));
    document
      .getElementById('upload-hero-btn')
      ?.addEventListener('click', () => this.uploadHero());
  }

  updatePreview() {
    const content = this.input.value;

    // フロントマター除去
    let body = content.replace(/^---[\s\S]*?---\n?/, '');

    // import を解析し、画像のデフォルトインポートをマッピング。本文からは import 行を取り除く
    this.importMap = this.parseDefaultImageImports(body);
    if (Object.keys(this.importMap).length > 0) {
      body = body.replace(/^import\s+[A-Za-z_$][\w$]*\s+from\s+['"][^'"]+['"];?\s*$/gm, '');
    }

    // 独自コンポーネント（CaptionedImage / ImageGrid）の簡易プレビューに置換
    body = this.renderCustomComponents(body);

    // 他の未対応なカスタム要素（先頭大文字のタグ）は非表示
    body = body.replace(/<\/?[A-Z][^>]*>/g, '');

    // 簡易 Markdown → HTML 変換
    let html = body
      // 見出し
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // リンク
      .replace(
        /\[([^\]]+)\]\(([^\)]+)\)/g,
        '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
      )
      // 太字・斜体
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // 画像（Markdown）
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt) => {
        const src = this.placeholderDataURL(String(alt || 'image'), 300, 200);
        const escAlt = this.escapeHtml(String(alt || ''));
        return `<img src="${src}" alt="${escAlt}" class="max-w-full h-auto rounded border">`;
      })
      // コードブロック
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto"><code>$2</code></pre>'
      )
      // インラインコード
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
      // 改行
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // 段落で囲む
    if (html && !html.startsWith('<')) {
      html = '<p>' + html + '</p>';
    }

    this.preview.innerHTML =
      html || '<p class="text-gray-500 italic">プレビューがここに表示されます</p>';
    this.autoResizeTextarea();
  }

  // ----- Custom component preview helpers -----
  parseDefaultImageImports(input: string): Record<string, string> {
    const map: Record<string, string> = {};
    const re = /^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"](.+?)['"];?/gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec(input))) {
      const id = m[1];
      const p = m[2];
      if (/\.(png|jpe?g|webp|gif|svg)$/i.test(p)) {
        map[id] = p;
      }
    }
    return map;
  }
  renderCustomComponents(input: string): string {
    let out = input;

    // CaptionedImage (self-closing)
    out = out.replace(/<\s*CaptionedImage\b([^>]*)\/\s*>/g, (_m, attrs) =>
      this.renderCaptioned(attrs || '')
    );

    // CaptionedImage (with closing tag)
    out = out.replace(
      /<\s*CaptionedImage\b([^>]*)>([\s\S]*?)<\s*\/\s*CaptionedImage\s*>/g,
      (_m, attrs) => this.renderCaptioned(attrs || '')
    );

    // ImageGrid (self-closing only in本実装)
    out = out.replace(/<\s*ImageGrid\b([^>]*)\/\s*>/g, (_m, attrs) =>
      this.renderImageGrid(attrs || '')
    );

    // Astro Image component (<Image ... />)
    out = out.replace(/<\s*Image\b([^>]*)\/\s*>/g, (_m, attrs) =>
      this.renderAstroImage(attrs || '')
    );
    // Fallback if someone writes with closing tag
    out = out.replace(/<\s*Image\b([^>]*)>([\s\S]*?)<\s*\/\s*Image\s*>/g, (_m, attrs) =>
      this.renderAstroImage(attrs || '')
    );

    return out;
  }

  renderCaptioned(attrs: string): string {
    const alt = this.readAttr(attrs, 'alt') || '';
    const caption = this.readAttr(attrs, 'caption') || '';
    const srcAttr = this.readAttr(attrs, 'src') || '';
    const width = Number(this.readAttr(attrs, 'width') || 600) || 600;
    const height = Number(this.readAttr(attrs, 'height') || 400) || 400;
    const resolved = this.resolveImageRef(srcAttr);
    const src = resolved || this.placeholderDataURL(alt || 'image', width, height);
    const esc = (s: string) => this.escapeHtml(s);
    const cap = caption
      ? `<figcaption class="mt-2 text-sm text-gray-500 italic">${esc(caption)}</figcaption>`
      : '';
    return `<figure class=\"not-prose my-6 text-center\"><img src=\"${src}\" alt=\"${esc(alt)}\" class=\"inline-block max-w-full h-auto rounded border shadow-sm\" width=\"${width}\" height=\"${height}\"/>${cap}</figure>`;
  }

  renderImageGrid(attrs: string): string {
    const columnsRaw = this.readAttr(attrs, 'columns');
    const cols = Math.min(
      4,
      Math.max(1, Number((columnsRaw || '2').replace(/[^0-9]/g, '')) || 2)
    );

    // Extract inside images={[ ... ]}
    const imagesMatch = attrs.match(/images\s*=\s*\{\s*\[([\s\S]*?)\]\s*\}/);
    const items: Array<{ src: string; alt: string; caption?: string }> = [];
    if (imagesMatch) {
      const body = imagesMatch[1];
      const objRe =
        /\{[^{}]*?src\s*:\s*(?:['"]([^'"\n]+)['"]|([A-Za-z_$][\w$]*))[^{}]*?alt\s*:\s*['"]([^'"\n]*)['"][^{}]*?(?:caption\s*:\s*['"]([^'"\n]*)['"])?.*?\}/g;
      let m: RegExpExecArray | null;
      while ((m = objRe.exec(body))) {
        const quoted = m[1];
        const ident = m[2];
        const alt = m[3] || '';
        const caption = m[4];
        const src = quoted || (ident ? this.importMap[ident] || '' : '');
        items.push({ src, alt, caption });
      }
    }

    const placeholder = (alt: string) => this.placeholderDataURL(alt || 'image', 300, 200);
    const esc = (s: string) => this.escapeHtml(s);
    const fallbackCount = Math.max(cols, 4);
    const list = items.length ? items : new Array(fallbackCount).fill({ alt: '' });
    const cards = list
      .map(it => {
        const imgSrc = it.src
          ? this.resolveImageRef(it.src) || placeholder(it.alt)
          : placeholder(it.alt);
        const figcap = it.caption
          ? `<figcaption class=\"mt-1 text-xs text-gray-500 italic\">${esc(it.caption)}</figcaption>`
          : '';
        return `<figure class=\"m-0 text-center\"><img src=\"${imgSrc}\" alt=\"${esc(it.alt || '')}\" class=\"w-full h-auto rounded border shadow-sm\"/>${figcap}</figure>`;
      })
      .join('');

    return `<div class=\"not-prose my-6\" style=\"display:grid;gap:.75rem;grid-template-columns:repeat(${cols},minmax(0,1fr));\">${cards}</div>`;
  }

  renderAstroImage(attrs: string): string {
    const alt = this.readAttr(attrs, 'alt') || '';
    const srcAttr = this.readAttr(attrs, 'src') || '';
    const width = Number(this.readAttr(attrs, 'width') || '') || undefined;
    const height = Number(this.readAttr(attrs, 'height') || '') || undefined;
    const cls = this.readAttr(attrs, 'class') || 'rounded border shadow-sm';
    const resolved = this.resolveImageRef(srcAttr);
    const src = resolved || this.placeholderDataURL(alt || 'image', width || 600, height || 400);
    const esc = (s: string) => this.escapeHtml(s);
    const size = `${width ? ` width=\"${width}\"` : ''}${height ? ` height=\"${height}\"` : ''}`;
    return `<img src=\"${src}\" alt=\"${esc(alt)}\" class=\"${esc(cls)}\"${size} />`;
  }

  readAttr(attrs: string, name: string): string | undefined {
    // Supports: name="..." | name='...' | name={...}
    const re = new RegExp(name + '\\s*=\\s*(\\"([^\\"]*)\\"|\'([^\']*)\'|\\{([^}]*)\\})');
    const m = attrs.match(re);
    if (!m) return undefined;
    return m[2] ?? m[3] ?? (m[4] ? String(m[4]) : undefined);
  }

  placeholderDataURL(text: string, width = 600, height = 400): string {
    const esc = this.escapeHtml(String(text || ''));
    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' fill='#6b7280' font-size='20' font-family='sans-serif'>${esc}</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 画像リファレンスの解決: 文字列パス or 変数名（importMap参照）→ dev API URL
  resolveImageRef(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const v = String(value).trim();
    const pub = (document.getElementById('publish-date') as HTMLInputElement)?.value;
    if (!pub || !/^\d{4}-\d{2}-\d{2}$/.test(pub)) return undefined;
    const asPath = (p: string) => {
      const clean = p.replace(/^\.\//, '');
      return `/api/dev/get-image?publishDate=${encodeURIComponent(pub)}&path=${encodeURIComponent(clean)}`;
    };
    // 変数名の場合は importMap から解決
    if (/^[A-Za-z_$][\w$]*$/.test(v)) {
      const mapped = this.importMap[v];
      if (mapped) return asPath(mapped);
      return undefined;
    }
    // 文字列パス（例: ./images/foo.jpg）
    return asPath(v);
  }

  // 画像処理
  addImageInput() {
    const input = document.getElementById('hidden-image-input') as HTMLInputElement;
    input.onchange = evt => {
      const files = Array.from((evt.target as HTMLInputElement).files || []);
      this.handleFiles(files as File[]);
      input.value = '';
    };
    input.click();
  }

  initDragAndDrop() {
    if (!this.dropZone) return;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
      this.dropZone.addEventListener(name, e => e.preventDefault());
      document.body.addEventListener(name, e => e.preventDefault());
    });
    ['dragenter', 'dragover'].forEach(name => {
      this.dropZone.addEventListener(name, () => {
        this.dropZone.classList.add('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900');
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      this.dropZone.addEventListener(name, () => {
        this.dropZone.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900');
      });
    });
    this.dropZone.addEventListener('drop', e => {
      const files = Array.from((e as DragEvent).dataTransfer?.files || []);
      this.handleFiles(files as File[]);
    });
    // クリックでファイル選択
    this.dropZone.addEventListener('click', () => this.addImageInput());
  }

  handleFiles(files: File[]) {
    files.forEach(file => {
      if (file.type.startsWith('image/')) this.addImageToGallery(file);
    });
    this.updateImageSelects();
  }

  initClipboardPaste() {
    document.addEventListener('paste', evt => {
      const items = Array.from((evt as ClipboardEvent).clipboardData?.items || []);
      const imageItems = items.filter(i => i.type.startsWith('image/'));
      imageItems.forEach(item => {
        const file = item.getAsFile();
        if (file) {
          const ext = file.type.split('/')[1] || 'png';
          const named = new File([file], `pasted-${Date.now()}.${ext}`, { type: file.type });
          this.handleFiles([named]);
        }
      });
    });
  }

  async pasteFromClipboard() {
    try {
      // navigator.clipboard.read() は HTTPS/許可が必要
      const items = await (navigator as any).clipboard.read();
      for (const item of items) {
        const imageTypes = item.types.filter((t: string) => t.startsWith('image/'));
        for (const t of imageTypes) {
          const blob = await item.getType(t);
          const ext = t.split('/')[1] || 'png';
          const file = new File([blob], `pasted-${Date.now()}.${ext}`, { type: t });
          this.handleFiles([file]);
        }
      }
      if (!items || items.length === 0) {
        alert('クリップボードに画像が見つかりません。Ctrl+V でも貼り付けできます。');
      }
    } catch {
      alert('ブラウザの制約で読み取りできませんでした。Ctrl+V で貼り付けしてください。');
    }
  }

  async addImageToGallery(file: File) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalName = `${Date.now()}_${sanitizedName}`;
    const url = URL.createObjectURL(file);
    const entry = { name: finalName, url, file } as { name: string; url: string; file: File };
    this.uploadedImages.push(entry);
    this.refreshImageGallery();
    const live = document.getElementById('image-aria-live');
    if (live) live.textContent = `${finalName} を追加しました`;

    // 自動保存（開発環境のAPIにPOST）
    try {
      const saved = await this.uploadToServer(file, finalName, 'images');
      if (saved) {
        entry.name = saved;
        this.refreshImageGallery();
        this.updateImageSelects();
      }
    } catch (err) {
      console.warn('画像の自動保存に失敗:', err);
    }
  }

  refreshImageGallery() {
    if (!this.imageGallery) return;
    this.imageGallery.innerHTML = '';
    this.uploadedImages.forEach(img => {
      const wrap = document.createElement('div');
      wrap.className = 'relative group';
      const image = document.createElement('img');
      image.src = img.url;
      image.alt = img.name;
      image.className = 'w-full h-20 object-cover rounded border';
      image.addEventListener('click', () => this.insertImageReference(img.name));

      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '×';
      del.className =
        'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity';
      del.addEventListener('click', ev => {
        ev.stopPropagation();
        this.removeImage(img.name);
      });

      const caption = document.createElement('p');
      caption.className = 'text-xs mt-1 truncate';
      caption.title = img.name;
      caption.textContent = img.name;

      wrap.appendChild(image);
      wrap.appendChild(del);
      this.imageGallery.appendChild(wrap);
      this.imageGallery.appendChild(caption);
    });
  }

  removeImage(name: string) {
    const idx = this.uploadedImages.findIndex(i => i.name === name);
    if (idx >= 0) {
      URL.revokeObjectURL(this.uploadedImages[idx].url);
      this.uploadedImages.splice(idx, 1);
      this.refreshImageGallery();
      this.updateImageSelects();
    }
  }

  async updateImageSelects() {
    await this.fetchAvailableImages();
    const select = document.getElementById('captioned-image-select-visual') as HTMLSelectElement;
    if (select) {
      select.innerHTML = '<option value="">画像を選択してください</option>';
      this.availableImages.forEach(img => {
        const opt = document.createElement('option');
        opt.value = img.path;
        opt.text = img.path;
        select.appendChild(opt);
      });
    }

    const gridSelectZone = document.getElementById('grid-image-selection') as HTMLDivElement;
    if (gridSelectZone) {
      gridSelectZone.innerHTML = '';
      this.availableImages.forEach(img => {
        const row = document.createElement('label');
        row.className = 'flex items-center gap-2 p-1 cursor-pointer';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = img.path;
        const thumb = document.createElement('img');
        thumb.src = img.url;
        thumb.alt = img.name;
        thumb.className = 'w-12 h-12 object-cover rounded border';
        const span = document.createElement('span');
        span.className = 'text-sm';
        span.textContent = img.path;
        row.appendChild(cb);
        row.appendChild(thumb);
        row.appendChild(span);
        gridSelectZone.appendChild(row);
      });
      gridSelectZone.addEventListener('change', () => this.updateGridSelectedImages());
    }
  }

  insertImageReference(imageName: string) {
    const cursor = this.input.selectionStart;
    const before = this.input.value.slice(0, cursor);
    const after = this.input.value.slice(cursor);
    const imageRef = `![Image](./images/${imageName})`;
    this.input.value = before + imageRef + after;
    this.input.selectionStart = this.input.selectionEnd = cursor + imageRef.length;
    this.updatePreview();
    this.persist();
  }

  async uploadToServer(
    file: File,
    finalName: string,
    subdir: 'images' | '' = 'images'
  ): Promise<string | null> {
    const publishDate = this.publishDate.value;
    if (!publishDate || !/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) {
      alert('画像保存には公開日 (YYYY-MM-DD) の入力が必要です');
      return null;
    }
    try {
      const endpoint = '/api/dev/upload-image';
      const named = new File([file], finalName, { type: file.type });
      const fd = new FormData();
      fd.append('publishDate', publishDate);
      fd.append('file', named, named.name);
      fd.append('subdir', subdir);
      const res = await fetch(endpoint, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      if (data?.ok && data.files?.[0]?.name) return String(data.files[0].name);
    } catch (e) {
      console.warn(e);
    }
    return null;
  }

  uploadHero() {
    const input = document.getElementById('hidden-hero-input') as HTMLInputElement;
    input.onchange = async evt => {
      const file = (evt.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const finalName = `${Date.now()}_${sanitized}`;
      const savedName = await this.uploadToServer(file, finalName, ''); // 記事直下に保存
      if (savedName) {
        (document.getElementById('header-hero') as HTMLInputElement).value = `./${savedName}`;
      } else {
        alert('Hero画像の保存に失敗しました');
      }
      input.value = '';
    };
    input.click();
  }

  async openCaptionedModal() {
    // 先にコンポーネントの import を確保
    this.ensureComponentImport('CaptionedImage');
    this.captionedModal.classList.remove('hidden');
    await this.updateImageSelects();
  }

  applyCaptionedImage() {
    const select = document.getElementById('captioned-image-select-visual') as HTMLSelectElement;
    const alt = document.getElementById('captioned-alt') as HTMLInputElement;
    const caption = document.getElementById('captioned-caption') as HTMLInputElement;
    if (!select?.value) return alert('画像を選択してください');
    if (!alt?.value.trim()) return alert('Alt テキストを入力してください');
    const original = this.input.value;
    const cursor = this.input.selectionStart;
    const relPath = `./${select.value}`;
    const slugInput = document.getElementById('captioned-slug') as HTMLInputElement | null;
    const slugRaw = (slugInput?.value || '').trim();
    const slug = this.normalizeSlugForIdent(slugRaw || this.fileName.value || 'img');
    const next = this.nextIndexForSlug(slug);
    const ident = this.ensureImageImport(relPath, `${slug}${this.zeroPad(next)}`);
    let component = `<CaptionedImage\n  src={${ident}}\n  alt="${alt.value.trim()}"`;
    if (caption?.value.trim()) component += `\n  caption="${caption.value.trim()}"`;
    component += `\n/>\n`;
    const mutated = this.input.value; // ensureImageImport() で変更された可能性あり
    const delta = mutated.length - original.length;
    const insertPos = Math.max(0, Math.min(mutated.length, cursor + delta));
    this.input.value = mutated.slice(0, insertPos) + component + mutated.slice(insertPos);
    this.updatePreview();
    this.persist();
    this.closeModal(this.captionedModal);
    if (select) select.value = '';
    if (alt) alt.value = '';
    if (caption) caption.value = '';
    this.ensureImports();
  }

  async openGridModal() {
    // 先にコンポーネントの import を確保
    this.ensureComponentImport('ImageGrid');
    this.gridModal.classList.remove('hidden');
    await this.updateImageSelects();
    this.updateGridSelectedImages();
  }

  updateGridSelectedImages() {
    const zone = document.getElementById('grid-selected-images') as HTMLDivElement;
    const checks = Array.from(
      document.querySelectorAll('#grid-image-selection input[type="checkbox"]')
    ) as HTMLInputElement[];
    const selected = checks.filter(cb => cb.checked).map(cb => cb.value);
    zone.innerHTML = '';
    if (selected.length === 0) return;
    const heading = document.createElement('h4');
    heading.className = 'font-semibold mb-2';
    heading.textContent = '選択した画像のAlt/Caption';
    zone.appendChild(heading);
    selected.forEach(name => {
      const wrap = document.createElement('div');
      wrap.className = 'flex items-start gap-2 p-2 border rounded mb-2';
      const img = this.availableImages.find(i => i.path === name);
      if (img) {
        const thumb = document.createElement('img');
        thumb.src = img.url;
        thumb.alt = img.name;
        thumb.className = 'w-16 h-16 object-cover rounded';
        const fields = document.createElement('div');
        fields.className = 'flex-1';
        const alt = document.createElement('input');
        alt.type = 'text';
        alt.placeholder = 'Alt text';
        alt.setAttribute('data-image', name);
        alt.setAttribute('data-type', 'alt');
        alt.className = 'w-full p-1 mb-1 text-xs border rounded';
        const cap = document.createElement('input');
        cap.type = 'text';
        cap.placeholder = 'Caption (optional)';
        cap.setAttribute('data-image', name);
        cap.setAttribute('data-type', 'caption');
        cap.className = 'w-full p-1 text-xs border rounded';
        fields.appendChild(alt);
        fields.appendChild(cap);
        wrap.appendChild(thumb);
        wrap.appendChild(fields);
        zone.appendChild(wrap);
      }
    });
  }

  applyImageGrid() {
    const selectedAltInputs = Array.from(
      document.querySelectorAll('#grid-selected-images [data-type="alt"]')
    ) as HTMLInputElement[];
    const selectedNames = new Set(selectedAltInputs.map(i => i.getAttribute('data-image') || ''));
    const images: Array<{ src: string; alt: string; caption?: string }> = [];
    selectedNames.forEach(name => {
      if (!name) return;
      const alt = document.querySelector(
        `#grid-selected-images [data-image="${name}"][data-type="alt"]`
      ) as HTMLInputElement | null;
      const cap = document.querySelector(
        `#grid-selected-images [data-image="${name}"][data-type="caption"]`
      ) as HTMLInputElement | null;
      if (alt && alt.value.trim()) {
        const node: any = { src: `./${name}`, alt: alt.value.trim() };
        if (cap && cap.value.trim()) node.caption = cap.value.trim();
        images.push(node);
      }
    });
    if (images.length === 0) return alert('Alt テキストを入力してください');
    const columns = (document.getElementById('grid-columns') as HTMLSelectElement)?.value || '2';
    const original = this.input.value;
    const cursor = this.input.selectionStart;
    // Ensure imports for all images and use identifiers with slug +連番
    const paths = images.map(i => i.src);
    const slugInput = document.getElementById('grid-slug') as HTMLInputElement | null;
    const slugRaw = (slugInput?.value || '').trim();
    const slug = this.normalizeSlugForIdent(slugRaw || this.fileName.value || 'img');
    const idMap = this.ensureImageImportsWithSlug(paths, slug);
    let component = `<ImageGrid\n  columns={${columns}}\n  images={[\n`;
    images.forEach((img, i) => {
      const ident = idMap[img.src] || this.ensureImageImport(img.src);
      component += `    {\n      src: ${ident},\n      alt: "${img.alt}"`;
      if ((img as any).caption) component += `,\n      caption: "${(img as any).caption}"`;
      component += `\n    }${i < images.length - 1 ? ',' : ''}\n`;
    });
    component += `  ]}\n/>\n`;
    const mutated = this.input.value; // ensureImageImportsWithSlug() で変更された可能性あり
    const delta = mutated.length - original.length;
    const insertPos = Math.max(0, Math.min(mutated.length, cursor + delta));
    this.input.value = mutated.slice(0, insertPos) + component + mutated.slice(insertPos);
    this.updatePreview();
    this.persist();
    this.closeModal(this.gridModal);
    this.ensureImports();
  }

  closeModal(modal: HTMLDivElement) {
    modal.classList.add('hidden');
  }

  openHeaderModal() {
    this.headerModal.classList.remove('hidden');
    const fm = this.extractFrontmatter();
    const get = (k: string) => (fm[k] ?? '').toString();
    (document.getElementById('header-title') as HTMLInputElement).value = get('title');
    (document.getElementById('header-description') as HTMLInputElement).value =
      get('description');
    (document.getElementById('header-category') as HTMLSelectElement).value = get('category');
    (document.getElementById('header-hero') as HTMLInputElement).value = get('heroImage');
  }

  applyHeader() {
    const title = (document.getElementById('header-title') as HTMLInputElement).value.trim();
    const description = (
      document.getElementById('header-description') as HTMLInputElement
    ).value.trim();
    const category = (
      document.getElementById('header-category') as HTMLSelectElement
    ).value.trim();
    const heroImage = (document.getElementById('header-hero') as HTMLInputElement).value.trim();
    const pubDate = this.publishDate.value || new Date().toISOString().split('T')[0];

    const fmLines: string[] = ['---'];
    if (title) fmLines.push(`title: '${title.replace(/'/g, "''")}'`);
    if (description) fmLines.push(`description: '${description.replace(/'/g, "''")}'`);
    fmLines.push(`pubDate: '${pubDate}'`);
    if (category) fmLines.push(`category: '${category}'`);
    if (heroImage) fmLines.push(`heroImage: '${heroImage}'`);
    fmLines.push('---');

    const content = this.input.value;
    const hasFM = /^---[\s\S]*?---\n?/.test(content);
    const newContent = hasFM
      ? content.replace(/^---[\s\S]*?---\n?/, fmLines.join('\n') + '\n\n')
      : fmLines.join('\n') + '\n\n' + content;
    this.input.value = newContent;

    this.ensureImports();
    this.updatePreview();
    this.persist();
    this.closeModal(this.headerModal);
  }

  extractFrontmatter(): Record<string, string> {
    const m = this.input.value.match(/^---\n([\s\S]*?)\n---/);
    const out: Record<string, string> = {};
    if (!m) return out;
    const body = m[1];
    body.split(/\r?\n/).forEach(line => {
      const mm = line.match(/^(\w+):\s*(.*)$/);
      if (mm) out[mm[1]] = mm[2].replace(/^'|'$/g, '').trim();
    });
    return out;
  }

  ensureImports() {
    const content = this.input.value;
    const usedCaptioned = /<\s*CaptionedImage\b/.test(content);
    const usedGrid = /<\s*ImageGrid\b/.test(content);
    if (!usedCaptioned && !usedGrid) return;

    const fmMatch = content.match(/^---[\s\S]*?---\n?/);
    const startIndex = fmMatch ? fmMatch[0].length : 0;
    const head = content.slice(0, startIndex);
    let rest = content.slice(startIndex);

    const imports: string[] = [];
    if (usedCaptioned && !/import\s+CaptionedImage\s+from/.test(content)) {
      imports.push("import CaptionedImage from '@/components/CaptionedImage.astro';");
    }
    if (usedGrid && !/import\s+ImageGrid\s+from/.test(content)) {
      imports.push("import ImageGrid from '@/components/ImageGrid.astro';");
    }
    if (imports.length > 0) {
      rest = imports.join('\n') + '\n' + rest;
    }
    this.input.value = head + rest;
  }

  ensureComponentImport(name: 'CaptionedImage' | 'ImageGrid') {
    const content = this.input.value;
    const already = new RegExp(`^import\\s+${name}\\s+from`, 'm').test(content);
    if (already) return;
    const path =
      name === 'CaptionedImage'
        ? '@/components/CaptionedImage.astro'
        : '@/components/ImageGrid.astro';
    const fmMatch = content.match(/^---[\s\S]*?---\n?/);
    const startIndex = fmMatch ? fmMatch[0].length : 0;
    const head = content.slice(0, startIndex);
    const rest = content.slice(startIndex);
    this.input.value = `${head}import ${name} from '${path}';\n${rest}`;
  }

  async fetchAvailableImages() {
    const publishDate = this.publishDate.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) {
      this.availableImages = [];
      return;
    }
    try {
      const res = await fetch(
        `/api/dev/list-images?publishDate=${encodeURIComponent(publishDate)}`
      );
      if (!res.ok) throw new Error('failed to list images');
      const data = await res.json();
      const files: string[] = Array.isArray(data?.files) ? data.files : [];
      this.availableImages = files.map(p => ({
        name: p.split('/').pop() || p,
        path: p,
        url: `/api/dev/get-image?publishDate=${encodeURIComponent(publishDate)}&path=${encodeURIComponent(p)}`,
      }));
    } catch (e) {
      console.warn('画像リストの取得に失敗:', e);
      this.availableImages = [];
    }
  }

  // ----- Image import helpers -----
  ensureImageImportsWithSlug(paths: string[], slug: string): Record<string, string> {
    const map: Record<string, string> = {};
    let idx = this.nextIndexForSlug(slug);
    for (const p of paths) {
      const idExisting = this.getImportedIdentifierForPath(p);
      if (idExisting) {
        map[p] = idExisting;
      } else {
        const ident = `${slug}${this.zeroPad(idx++)}`;
        map[p] = this.ensureImageImport(p, ident);
      }
    }
    return map;
  }

  ensureImageImport(relPath: string, preferredIdent?: string): string {
    const pathStr = String(relPath).trim();
    if (!pathStr) return 'img0';
    const content = this.input.value;
    // If already imported, reuse identifier
    const re = new RegExp(
      `^import\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+['\"]${this.escapeForRegExp(pathStr)}['\"];?\\s*$`,
      'm'
    );
    const m = content.match(re);
    if (m) return m[1];

    // Generate unique identifier
    const base = preferredIdent
      ? this.normalizeIdent(preferredIdent)
      : this.toIdentifier(pathStr);
    const used = new Set(
      Array.from(
        content.matchAll(/^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"][^'"]+['"];?$/gm)
      ).map(x => x[1])
    );
    let ident = base;
    let i = 1;
    while (used.has(ident)) {
      ident = preferredIdent ? `${base}${this.zeroPad(i++)}` : `${base}${i++}`;
    }

    // Insert import after frontmatter
    const fmMatch = content.match(/^---[\s\S]*?---\n?/);
    const startIndex = fmMatch ? fmMatch[0].length : 0;
    const head = content.slice(0, startIndex);
    const rest = content.slice(startIndex);
    const importLine = `import ${ident} from '${pathStr}';\n`;
    this.input.value = head + importLine + rest;
    return ident;
  }

  getImportedIdentifierForPath(relPath: string): string | null {
    const pathStr = String(relPath).trim();
    const content = this.input.value;
    const re = new RegExp(
      `^import\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+['\"]${this.escapeForRegExp(pathStr)}['\"];?\\s*$`,
      'm'
    );
    const m = content.match(re);
    return m ? m[1] : null;
  }

  nextIndexForSlug(slug: string): number {
    const content = this.input.value;
    const re = new RegExp(
      `^import\\s+(${this.escapeForRegExp(slug)})(\\d+)\\s+from\\s+['\"][^'\"]+['\"];?\\s*$`,
      'gm'
    );
    let max = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content))) {
      const n = parseInt(m[2], 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return max + 1;
  }

  zeroPad(n: number): string {
    if (n >= 100) return String(n);
    return n < 10 ? `0${n}` : String(n);
  }

  normalizeSlugForIdent(s: string): string {
    return (s || 'img')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '-')
      .replace(/-+$/g, '')
      .replace(/^-+/g, '')
      .replace(/-([a-z0-9])/g, (_m, ch) => ch.toUpperCase());
  }

  normalizeIdent(s: string): string {
    let out = s.replace(/[^A-Za-z0-9_$]/g, '');
    if (!/^[A-Za-z_$]/.test(out)) out = 'img' + out;
    return out;
  }

  toIdentifier(pathStr: string): string {
    const file = pathStr.split('/').pop() || 'img';
    const name = file.replace(/\.[a-z0-9]+$/i, '');
    const camel = name
      .replace(/[^a-zA-Z0-9]+(.)/g, (_m, ch: string) => ch.toUpperCase())
      .replace(/^[^a-zA-Z_]+/, '');
    const prefixed = camel ? camel : 'img';
    const safe = /^[A-Za-z_$]/.test(prefixed) ? prefixed : 'img' + prefixed;
    return safe;
  }

  escapeForRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  downloadMDX() {
    const content = this.input.value;
    const filename = this.fileName.value || 'article';

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.mdx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async openLoadModal() {
    this.loadModal.classList.remove('hidden');
    await this.fetchMdxList();
    const search = document.getElementById('load-search') as HTMLInputElement;
    search.oninput = () => this.renderMdxList(search.value);
  }

  async fetchMdxList() {
    try {
      const res = await fetch('/api/dev/list-mdx');
      if (!res.ok) throw new Error('failed to list mdx');
      const data = await res.json();
      this.mdxList = (data?.files || []) as any[];
      this.renderMdxList('');
    } catch (e) {
      console.warn(e);
      const list = document.getElementById('load-list');
      if (list) list.innerHTML = '<div class="p-3 text-red-600">MDXの取得に失敗しました</div>';
    }
  }

  renderMdxList(query: string) {
    const list = document.getElementById('load-list') as HTMLDivElement;
    if (!list) return;
    const q = (query || '').toLowerCase();
    const files = this.mdxList.filter((f: any) => {
      const key = `${f.path} ${f.title || ''} ${f.pubDate || ''}`.toLowerCase();
      return key.includes(q);
    });
    if (files.length === 0) {
      list.innerHTML =
        '<div class="p-3 text-sm text-gray-500">一致するファイルがありません</div>';
      return;
    }
    const rows = files
      .map((f: any) => {
        const badge = f.pubDate
          ? `<span class="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 mr-2">${f.pubDate}</span>`
          : '';
        const title = f.title ? `<span class="font-medium">${escapeHtml(f.title)}</span>` : '';
        return `<button type="button" data-path="${encodeURIComponent(f.path)}" class="w-full text-left p-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <div class="text-sm flex items-center">${badge}${title}</div>
          <div class="text-xs text-gray-500">${escapeHtml(f.path)}</div>
        </button>`;
      })
      .join('');
    list.innerHTML = rows;
    list.querySelectorAll('button[data-path]')?.forEach((btn: any) => {
      btn.addEventListener('click', () => {
        const p = decodeURIComponent(btn.getAttribute('data-path'));
        this.loadMdxFromProject(p);
      });
    });
  }

  async loadMdxFromProject(relPath: string) {
    try {
      const res = await fetch(`/api/dev/read-mdx?path=${encodeURIComponent(relPath)}`);
      if (!res.ok) throw new Error('failed to read');
      const data = await res.json();
      const content = String(data?.content || '');
      this.input.value = content;
      // ファイル名
      this.fileName.value =
        relPath
          .split('/')
          .pop()
          ?.replace(/\.(mdx|md)$/i, '') || 'article';
      // pubDate はFMがあれば優先、なければパスから推測
      const fm = this.extractFrontmatter();
      if (fm['pubDate']) {
        this.publishDate.value = fm['pubDate'];
      } else {
        const m = relPath.match(/^(\d{4}-\d{2})\/(\d{4}-\d{2}-\d{2})\//);
        if (m) this.publishDate.value = m[2];
      }
      this.updatePreview();
      this.persist();
      this.closeModal(this.loadModal);
    } catch (e) {
      alert('読み込みに失敗しました');
      console.warn(e);
    }
  }

  newTemplate() {
    const today = new Date().toISOString().split('T')[0];
    this.publishDate.value = today;
    const template = `---
title: '新しい記事'
description: '記事の説明'
pubDate: '${today}'
category: ''
---

# 新しい記事

ここから本文を作成してください。
`;
    this.input.value = template;
    this.fileName.value = 'new-article';
    this.updatePreview();
    this.persist();
  }

  async saveMDX() {
    const content = this.input.value;
    const filename = (this.fileName.value || 'article').trim();
    const publishDate = this.publishDate.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) {
      alert('公開日が不正です (YYYY-MM-DD)');
      return;
    }
    try {
      const res = await fetch('/api/dev/save-mdx', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ publishDate, filename, content, overwrite: true }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(String(data?.error || res.status));
      const rel = data.path as string;
      alert(`保存しました: ${rel}`);
      // 最新の一覧を反映
      await this.fetchMdxList();
    } catch (e: any) {
      alert('保存に失敗しました: ' + String(e?.message || e));
      console.warn(e);
    }
  }

  saveToLocalStorage() {
    const data = {
      content: this.input.value,
      fileName: this.fileName.value,
      publishDate: this.publishDate.value,
    };

    localStorage.setItem('mdx-editor-data', JSON.stringify(data));
  }

  persist() {
    this.saveToLocalStorage();
  }

  restore() {
    const savedData = localStorage.getItem('mdx-editor-data');

    if (savedData) {
      try {
        const data = JSON.parse(savedData);

        if (data.content) {
          this.input.value = data.content;
          this.updatePreview();
        }
        if (data.fileName) {
          this.fileName.value = data.fileName;
        }
        if (data.publishDate) {
          this.publishDate.value = data.publishDate;
        }
      } catch (e) {
        console.error('LocalStorageからの読み込みエラー:', e);
      }
    }
  }

  autoResizeTextarea() {
    if (!this.input) return;
    this.input.style.height = 'auto';
    const baseLine = 200; // px, 約10行相当
    const next = Math.max(this.input.scrollHeight, baseLine);
    this.input.style.height = next + 'px';
    this.input.style.overflowY = 'hidden';
  }
}

// エスケープ用ユーティリティ（XSS対策）
function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

new SimpleMDXEditor();
