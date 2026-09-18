import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const projectRoot = path.resolve(currentDirectory, "..");

const chaptersDirectory = path.join(projectRoot, "capitulos");
const outputDirectory = path.join(projectRoot, "_site", "capitulos");

const navigationItems = [
  {
    source: "Capítulo 1 — Ambiente e terminal.md",
    file: "01-ambiente-terminal.html",
    number: "01",
    title: "Ambiente e terminal"
  },
  {
    source: "Capítulo 2 — Planejamento e decisão da linguagem.md",
    file: "02-linguagem.html",
    number: "02",
    title: "Planejamento e decisão da linguagem"
  },
  {
    source: "Capítulo 3 — Entrega e organização do projeto.md",
    file: "03-entrega-organizacao.html",
    number: "03",
    title: "Entrega e organização do projeto"
  },
  {
    source: "Capítulo 4 — Debug em camadas.md",
    file: "04-debug-camadas.html",
    number: "04",
    title: "Debug em camadas"
  },
  {
    source: "Capítulo 5 — Como calibrar a IA.md",
    file: "05-calibrar-ia.html",
    number: "05",
    title: "Como calibrar a IA"
  },
  {
    source: "Capítulo 6 — Construção e publicação no GitHub com Actions.md",
    file: "06-github-actions.html",
    number: "06",
    title: "Construção e publicação no GitHub com Actions"
  },
  {
    source: "Capítulo 7 — Contexto e exploração do projeto.md",
    file: "07-contexto-exploracao.html",
    number: "07",
    title: "Contexto e exploração do projeto"
  },
  {
    source: "Capítulo 8 — Especificação.md",
    file: "08-especificacao.html",
    number: "08",
    title: "Especificação"
  },
  {
    source: "Capítulo 9 — Planejamento.md",
    file: "09-planejamento.html",
    number: "09",
    title: "Planejamento"
  },
  {
    source: "Capítulo 10 — Implementação com a IA.md",
    file: "10-implementacao-ia.html",
    number: "10",
    title: "Implementação com a IA"
  },
  {
    source: "Capítulo 11 — Engenharia e arquitetura de segurança do projeto.md",
    file: "11-seguranca-arquitetura.html",
    number: "11",
    title: "Engenharia e arquitetura de segurança"
  }
];

marked.setOptions({
  gfm: true,
  breaks: false
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getChapterTitle(markdown, fallbackTitle) {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);

  if (!titleMatch) {
    return fallbackTitle;
  }

  return titleMatch[1]
    .replaceAll("—", "—")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function removeFirstHeading(markdown) {
  return markdown.replace(/^#\s+.+\r?\n?/m, "").trim();
}

function extractHeadings(markdown) {
  const headings = [];
  const headingPattern = /^##\s+(.+)$/gm;

  let match;

  while ((match = headingPattern.exec(markdown)) !== null) {
    const headingText = match[1]
      .replaceAll(/[`*_]/g, "")
      .trim();

    const headingId = slugify(headingText);

    headings.push({
      text: headingText,
      id: headingId
    });
  }

  return headings;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
}

function addHeadingIds(html) {
  return html.replace(
    /<h2>(.*?)<\/h2>/g,
    (fullMatch, headingContent) => {
      const plainText = headingContent.replaceAll(/<[^>]+>/g, "");
      const id = slugify(plainText);

      return `<h2 id="${id}">${headingContent}</h2>`;
    }
  );
}

function createSidebar(headings) {
  if (headings.length === 0) {
    return "";
  }

  const links = headings
    .map(
      (heading) =>
        `<a href="#${heading.id}">${escapeHtml(heading.text)}</a>`
    )
    .join("\n");

  return `
    <aside class="chapter-sidebar">
      <div class="chapter-sidebar-title">Nesta página</div>
      ${links}
    </aside>
  `;
}

function createBreadcrumb(title) {
  return `
    <nav class="breadcrumb" aria-label="Navegação estrutural">
      <a href="../index.html">Início</a>
      <span>/</span>
      <a href="../guia.html">Trilha</a>
      <span>/</span>
      <span>${escapeHtml(title)}</span>
    </nav>
  `;
}

function createChapterNavigation(currentIndex) {
  const previousChapter = navigationItems[currentIndex - 1];
  const nextChapter = navigationItems[currentIndex + 1];

  const previousLink = previousChapter
    ? `
      <a href="./${previousChapter.file}">
        <small>← Anterior</small>
        <strong>${escapeHtml(previousChapter.title)}</strong>
      </a>
    `
    : `
      <a href="../guia.html">
        <small>← Voltar</small>
        <strong>Voltar para a trilha</strong>
      </a>
    `;

  const nextLink = nextChapter
    ? `
      <a href="./${nextChapter.file}">
        <small>Próximo →</small>
        <strong>${escapeHtml(nextChapter.title)}</strong>
      </a>
    `
    : `
      <a href="../projeto-integrador.html">
        <small>Próximo →</small>
        <strong>Projeto integrador</strong>
      </a>
    `;

  return `
    <nav class="chapter-navigation" aria-label="Navegação entre capítulos">
      ${previousLink}
      ${nextLink}
    </nav>
  `;
}

function createPage({
  title,
  chapterNumber,
  content,
  headings,
  currentIndex
}) {
  const escapedTitle = escapeHtml(title);
  const sidebar = createSidebar(headings);
  const breadcrumb = createBreadcrumb(title);
  const chapterNavigation = createChapterNavigation(currentIndex);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="description"
    content="${escapedTitle} — Guia de Vibe Coding responsável."
  >

  <title>${escapedTitle} — Vibe Coding responsável</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
    rel="stylesheet"
  >

  <link rel="stylesheet" href="../assets/css/style.css">
</head>

<body>
  <header class="site-header">
    <div class="container header-content">
      <a class="brand" href="../index.html">
        <span class="brand-mark">VC</span>

        <span class="brand-text">
          <strong>Vibe Coding</strong>
          <small>responsável</small>
        </span>
      </a>

      <button
        class="mobile-menu-button"
        type="button"
        aria-label="Abrir menu"
        aria-expanded="false"
        data-menu-toggle
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="main-navigation" data-menu>
        <a href="../index.html">Início</a>
        <a class="active" href="../guia.html">Trilha</a>
        <a href="../projeto-integrador.html">Projeto integrador</a>
        <a href="../checklists.html">Checklists</a>
        <a href="../sobre.html">Sobre</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="page-hero">
      <div class="container page-hero-content">
        ${breadcrumb}

        <p class="eyebrow">CAPÍTULO ${chapterNumber}</p>

        <h1>${escapedTitle}</h1>

        <p class="page-hero-description">
          Guia de Vibe Coding responsável: contexto, implementação,
          verificação, segurança e entrega.
        </p>

        <div class="page-meta">
          <span class="meta-tag">Capítulo ${chapterNumber}</span>
          <span class="meta-tag">Vibe Coding</span>
          <span class="meta-tag">Engenharia de software</span>
        </div>
      </div>
    </section>

    <section class="chapter-layout">
      <article class="chapter-content">
        ${content}

        ${chapterNavigation}
      </article>

      ${sidebar}
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-content">
      <div>
        <a class="brand footer-brand" href="../index.html">
          <span class="brand-mark">VC</span>

          <span class="brand-text">
            <strong>Vibe Coding</strong>
            <small>responsável</small>
          </span>
        </a>

        <p>
          Engenharia de software com inteligência artificial,
          contexto e responsabilidade.
        </p>
      </div>

      <div class="footer-links">
        <a href="../guia.html">Trilha</a>
        <a href="../projeto-integrador.html">Projeto integrador</a>
        <a href="../checklists.html">Checklists</a>
        <a href="../sobre.html">Sobre</a>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>Conteúdo educacional sobre engenharia de software.</span>
      <span>Vibe Coding responsável © 2026</span>
    </div>
  </footer>

  <script src="../assets/js/app.js"></script>
</body>
</html>
`;
}

async function ensureDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
}

async function getMarkdownFiles() {
  const availableFiles = await fs.readdir(chaptersDirectory);

  const missingFiles = navigationItems
    .map((chapter) => chapter.source)
    .filter((fileName) => !availableFiles.includes(fileName));

  if (missingFiles.length > 0) {
    throw new Error(
      `Capítulos Markdown não encontrados:\n- ${missingFiles.join("\n- ")}`
    );
  }

  return navigationItems;
}


async function buildChapters() {
  const markdownFiles = await getMarkdownFiles();

  if (markdownFiles.length === 0) {
    throw new Error(
      `Nenhum arquivo Markdown foi encontrado em: ${chaptersDirectory}`
    );
  }

  await fs.rm(outputDirectory, {
    recursive: true,
    force: true
  });

  await ensureDirectory(outputDirectory);

for (const [index, navigationItem] of markdownFiles.entries()) {
  const markdownFile = navigationItem.source;
  const markdownPath = path.join(chaptersDirectory, markdownFile);
  const markdown = await fs.readFile(markdownPath, "utf8");


    const title = getChapterTitle(
      markdown,
      navigationItem.title
    );

    const chapterMarkdown = removeFirstHeading(markdown);
    const headings = extractHeadings(chapterMarkdown);

    const parsedContent = await marked.parse(chapterMarkdown);
    const contentWithIds = addHeadingIds(parsedContent);

    const outputFileName = markdownFile
      .replace(/\.md$/i, ".html")
      .toLowerCase();

    const outputPath = path.join(
      outputDirectory,
      outputFileName
    );

    const page = createPage({
      title,
      chapterNumber: navigationItem.number,
      content: contentWithIds,
      headings,
      currentIndex: index
    });

    await fs.writeFile(outputPath, page, "utf8");

    console.log(
      `Gerado: capitulos/${markdownFile} -> _site/capitulos/${outputFileName}`
    );
  }

  console.log(
    `\nBuild concluído: ${markdownFiles.length} capítulo(s) gerado(s).`
  );
}

buildChapters().catch((error) => {
  console.error("\nFalha ao gerar os capítulos:");
  console.error(error.message);
  process.exitCode = 1;
});
