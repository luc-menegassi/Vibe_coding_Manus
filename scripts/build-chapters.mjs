import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const projectRoot = path.resolve(currentDirectory, "..");

const chaptersDirectory = path.join(projectRoot, "capitulos");
const outputDirectory = path.join(projectRoot, "_site", "capitulos");

const chapterDefinitions = [
  {
    number: 1,
    file: "01-ambiente-terminal.html",
    title: "Ambiente e terminal"
  },
  {
    number: 2,
    file: "02-linguagem.html",
    title: "Planejamento e decisão da linguagem"
  },
  {
    number: 3,
    file: "03-entrega-organizacao.html",
    title: "Entrega e organização do projeto"
  },
  {
    number: 4,
    file: "04-debug-camadas.html",
    title: "Debug em camadas"
  },
  {
    number: 5,
    file: "05-calibrar-ia.html",
    title: "Como calibrar a IA"
  },
  {
    number: 6,
    file: "06-github-actions.html",
    title: "Construção e publicação no GitHub com Actions"
  },
  {
    number: 7,
    file: "07-contexto-exploracao.html",
    title: "Contexto e exploração do projeto"
  },
  {
    number: 8,
    file: "08-especificacao.html",
    title: "Especificação"
  },
  {
    number: 9,
    file: "09-planejamento.html",
    title: "Planejamento"
  },
  {
    number: 10,
    file: "10-implementacao-ia.html",
    title: "Implementação com a IA"
  },
  {
    number: 11,
    file: "11-seguranca-arquitetura.html",
    title: "Engenharia e arquitetura de segurança"
  }
];

marked.setOptions({
  gfm: true,
  breaks: false
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getTitle(markdown, fallbackTitle) {
  const match = markdown.match(/^#\s+(.+)$/m);

  if (!match) {
    return fallbackTitle;
  }

  return match[1]
    .replace(/\s+/g, " ")
    .trim();
}

function removeFirstHeading(markdown) {
  return markdown
    .replace(/^#\s+.+\r?\n?/m, "")
    .trim();
}

function extractHeadings(markdown) {
  const headings = [];
  const pattern = /^##\s+(.+)$/gm;

  let match;

  while ((match = pattern.exec(markdown)) !== null) {
    const text = match[1]
      .replace(/[`*_]/g, "")
      .trim();

    headings.push({
      text,
      id: slugify(text)
    });
  }

  return headings;
}

function addHeadingIds(html) {
  return html.replace(
    /<h2>(.*?)<\/h2>/g,
    (fullMatch, headingContent) => {
      const plainText = headingContent.replace(/<[^>]+>/g, "");
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
  const previous = chapterDefinitions[currentIndex - 1];
  const next = chapterDefinitions[currentIndex + 1];

  const previousLink = previous
    ? `
      <a href="./${previous.file}">
        <small>← Anterior</small>
        <strong>${escapeHtml(previous.title)}</strong>
      </a>
    `
    : `
      <a href="../guia.html">
        <small>← Voltar</small>
        <strong>Voltar para a trilha</strong>
      </a>
    `;

  const nextLink = next
    ? `
      <a href="./${next.file}">
        <small>Próximo →</small>
        <strong>${escapeHtml(next.title)}</strong>
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
  number,
  content,
  headings,
  currentIndex
}) {
  const escapedTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

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
        ${createBreadcrumb(title )}

        <p class="eyebrow">CAPÍTULO ${number}</p>

        <h1>${escapedTitle}</h1>

        <p class="page-hero-description">
          Guia de Vibe Coding responsável: contexto, implementação,
          verificação, segurança e entrega.
        </p>

        <div class="page-meta">
          <span class="meta-tag">Capítulo ${number}</span>
          <span class="meta-tag">Vibe Coding</span>
          <span class="meta-tag">Engenharia de software</span>
        </div>
      </div>
    </section>

    <section class="chapter-layout">
      <article class="chapter-content">
        ${content}

        ${createChapterNavigation(currentIndex)}
      </article>

      ${createSidebar(headings)}
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

function getChapterNumber(fileName) {
  const match = fileName.match(/^Capítulo\s+(\d+)/i);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

async function findChapterFiles() {
  const entries = await fs.readdir(chaptersDirectory, {
    withFileTypes: true
  });

  const markdownFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".md")
    )
    .map((entry) => entry.name);

  const chapters = [];

  for (const definition of chapterDefinitions) {
    const source = markdownFiles.find(
      (fileName) => getChapterNumber(fileName) === definition.number
    );

    if (!source) {
      throw new Error(
        `Não foi encontrado um arquivo Markdown para o capítulo ${definition.number}.`
      );
    }

    chapters.push({
      ...definition,
      source
    });
  }

  return chapters;
}

async function buildChapters() {
  const chapters = await findChapterFiles();

  await fs.rm(outputDirectory, {
    recursive: true,
    force: true
  });

  await fs.mkdir(outputDirectory, {
    recursive: true
  });

  for (const [index, chapter] of chapters.entries()) {
    const markdownPath = path.join(
      chaptersDirectory,
      chapter.source
    );

    const markdown = await fs.readFile(
      markdownPath,
      "utf8"
    );

    const title = getTitle(
      markdown,
      chapter.title
    );

    const bodyMarkdown = removeFirstHeading(markdown);
    const headings = extractHeadings(bodyMarkdown);

    const parsedContent = await marked.parse(bodyMarkdown);
    const contentWithIds = addHeadingIds(parsedContent);

    const outputPath = path.join(
      outputDirectory,
      chapter.file
    );

    const page = createPage({
      title,
      number: String(chapter.number).padStart(2, "0"),
      content: contentWithIds,
      headings,
      currentIndex: index
    });

    await fs.writeFile(
      outputPath,
      page,
      "utf8"
    );

    console.log(
      `Gerado: ${chapter.source} -> _site/capitulos/${chapter.file}`
    );
  }

  console.log(
    `Build concluído: ${chapters.length} capítulo(s) gerado(s).`
  );
}

buildChapters().catch((error) => {
  console.error("Falha ao gerar os capítulos:");
  console.error(error.message);
  process.exitCode = 1;
});
