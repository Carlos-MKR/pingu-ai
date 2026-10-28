function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

function formatInline(text) {
    const inlineCodes = []

    // 1. Extraer código en línea (`code`) para no alterar su contenido interno
    let processed = text.replace(/`([^`\n]+)`/g, (_, code) => {
        const idx = inlineCodes.length
        inlineCodes.push(`<code class="md-inline-code">${code}</code>`)
        return `\u0000INLINECODE_${idx}\u0000`
    })

    // 2. Enlaces [texto](https://...)
    processed = processed.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>'
    )

    // 3. Negrita + Cursiva (***texto***)
    processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")

    // 4. Negrita (**texto** o __texto__)
    processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    processed = processed.replace(/__(.+?)__/g, "<strong>$1</strong>")

    // 5. Cursiva (*texto*)
    processed = processed.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")

    // 6. Restaurar código en línea
    processed = processed.replace(/\u0000INLINECODE_(\d+)\u0000/g, (_, idx) => inlineCodes[Number(idx)])

    return processed
}

function renderTable(tableLines) {
    if (tableLines.length < 2) {
        return tableLines.map((l) => `<p class="md-p">${formatInline(l)}</p>`).join("")
    }

    const parseRow = (line) =>
        line
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((cell) => cell.trim())

    const headers = parseRow(tableLines[0])
    const isSeparator = /^[|\s:-]+$/.test(tableLines[1])
    const bodyStartIndex = isSeparator ? 2 : 1
    const bodyRows = tableLines.slice(bodyStartIndex).map(parseRow)

    const thead = `<thead><tr>${headers
        .map((h) => `<th>${formatInline(h)}</th>`)
        .join("")}</tr></thead>`

    const tbody = `<tbody>${bodyRows
        .map(
            (row) =>
                `<tr>${row.map((cell) => `<td>${formatInline(cell)}</td>`).join("")}</tr>`
        )
        .join("")}</tbody>`

    return `<div class="md-table-wrap"><table class="md-table">${thead}${tbody}</table></div>`
}

/**
 * Convierte texto en formato Markdown (incluyendo fragmentos en streaming) a HTML seguro y estilizado.
 */
export function renderMarkdown(rawText) {
    if (!rawText) return ""

    const normalized = rawText.replace(/\r\n/g, "\n")
    const codeBlocks = []

    // Extraer bloques de código cerrados (```lang ... ```) y también abiertos al final durante el streaming
    const withPlaceholders = normalized.replace(
        /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)(?:```|$)/g,
        (_, lang, code) => {
            const idx = codeBlocks.length
            const cleanLang = (lang || "código").toLowerCase()
            const trimmedCode = code.replace(/\n$/, "")
            const escapedCode = escapeHTML(trimmedCode)
            const encodedRaw = encodeURIComponent(trimmedCode)

            codeBlocks.push(`
              <div class="md-code-block">
                <div class="md-code-header">
                  <span class="md-code-lang">${escapeHTML(cleanLang)}</span>
                  <button type="button" class="code-copy-btn" data-code="${encodedRaw}">
                    Copiar código
                  </button>
                </div>
                <pre class="md-pre"><code>${escapedCode}</code></pre>
              </div>
            `)
            return `\n\u0000CODEBLOCK_${idx}\u0000\n`
        }
    )

    const lines = withPlaceholders.split("\n")
    const htmlBlocks = []
    let i = 0

    while (i < lines.length) {
        const rawLine = lines[i]
        const trimmed = rawLine.trim()

        // Línea vacía
        if (trimmed === "") {
            i++
            continue
        }

        // Placeholder de bloque de código
        const codeMatch = trimmed.match(/^\u0000CODEBLOCK_(\d+)\u0000$/)
        if (codeMatch) {
            htmlBlocks.push(codeBlocks[Number(codeMatch[1])])
            i++
            continue
        }

        const line = escapeHTML(rawLine)
        const trimmedEscaped = line.trim()

        // Línea divisoria (---, ***)
        if (/^(?:---|\*\*\*|___)$/.test(trimmedEscaped)) {
            htmlBlocks.push('<hr class="md-hr" />')
            i++
            continue
        }

        // Encabezados (# a ####)
        const headingMatch = trimmedEscaped.match(/^(#{1,4})\s+(.+)$/)
        if (headingMatch) {
            const level = headingMatch[1].length
            htmlBlocks.push(
                `<h${level} class="md-h${level}">${formatInline(headingMatch[2])}</h${level}>`
            )
            i++
            continue
        }

        // Citas (> texto)
        if (trimmedEscaped.startsWith("&gt;")) {
            const quoteLines = []
            while (i < lines.length && escapeHTML(lines[i].trim()).startsWith("&gt;")) {
                const cleanQuote = escapeHTML(lines[i].trim()).replace(/^&gt;\s?/, "")
                quoteLines.push(formatInline(cleanQuote))
                i++
            }
            htmlBlocks.push(
                `<blockquote class="md-blockquote">${quoteLines.join("<br />")}</blockquote>`
            )
            continue
        }

        // Tablas Markdown (| col | col |)
        if (trimmedEscaped.startsWith("|") && trimmedEscaped.endsWith("|")) {
            const tableLines = []
            while (
                i < lines.length &&
                lines[i].trim().startsWith("|") &&
                lines[i].trim().endsWith("|")
            ) {
                tableLines.push(escapeHTML(lines[i].trim()))
                i++
            }
            htmlBlocks.push(renderTable(tableLines))
            continue
        }

        // Listas desordenadas (- o *)
        if (/^\s*[-*+]\s+/.test(line)) {
            const items = []
            while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
                const itemText = escapeHTML(lines[i]).replace(/^\s*[-*+]\s+/, "")
                items.push(`<li>${formatInline(itemText)}</li>`)
                i++
            }
            htmlBlocks.push(`<ul class="md-ul">${items.join("")}</ul>`)
            continue
        }

        // Listas numeradas (1. , 2. )
        if (/^\s*\d+\.\s+/.test(line)) {
            const items = []
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
                const itemText = escapeHTML(lines[i]).replace(/^\s*\d+\.\s+/, "")
                items.push(`<li>${formatInline(itemText)}</li>`)
                i++
            }
            htmlBlocks.push(`<ol class="md-ol">${items.join("")}</ol>`)
            continue
        }

        // Párrafo estándar (agrupa líneas consecutivas normales)
        const paragraphLines = []
        while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !/^\u0000CODEBLOCK_\d+\u0000$/.test(lines[i].trim()) &&
            !/^(#{1,4})\s+/.test(lines[i].trim()) &&
            !/^(?:---|\*\*\*|___)$/.test(lines[i].trim()) &&
            !lines[i].trim().startsWith(">") &&
            !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
            !/^\s*[-*+]\s+/.test(lines[i]) &&
            !/^\s*\d+\.\s+/.test(lines[i])
        ) {
            paragraphLines.push(formatInline(escapeHTML(lines[i].trim())))
            i++
        }

        if (paragraphLines.length > 0) {
            htmlBlocks.push(`<p class="md-p">${paragraphLines.join("<br />")}</p>`)
        } else {
            i++
        }
    }

    return htmlBlocks.join("")
}

