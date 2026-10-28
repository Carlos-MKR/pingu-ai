import { renderMarkdown } from "../utils/markdown.js"

const THEME_KEY = "pingu-ai-theme"

export function applyTheme(isDark, iconSun, iconMoon) {
    document.documentElement.classList.toggle("dark", isDark)
    if (iconSun && iconMoon) {
        iconSun.classList.toggle("hidden", !isDark)
        iconMoon.classList.toggle("hidden", isDark)
    }
}

export function initTheme(iconSun, iconMoon) {
    const savedTheme = localStorage.getItem(THEME_KEY)
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    applyTheme(isDark, iconSun, iconMoon)
}

export function toggleTheme(iconSun, iconMoon) {
    const isDark = !document.documentElement.classList.contains("dark")
    applyTheme(isDark, iconSun, iconMoon)
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light")
}

export function scrollToBottom(chatViewport) {
    chatViewport?.scrollTo({
        top: chatViewport.scrollHeight,
        behavior: "smooth",
    })
}

function getTimeFormatted() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function createUserBubble({ app, emptyState, chatViewport, text }) {
    emptyState?.classList.add("hidden")

    const wrapper = document.createElement("div")
    wrapper.className = "flex justify-end message-enter"

    const inner = document.createElement("div")
    inner.className = "max-w-[85%] sm:max-w-[75%] space-y-1"

    const bubble = document.createElement("div")
    bubble.className =
        "rounded-2xl rounded-tr-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-sm leading-relaxed shadow-xs whitespace-pre-wrap"
    bubble.textContent = text

    const time = document.createElement("div")
    time.className = "text-[10px] text-zinc-400 dark:text-zinc-500 text-right pr-1"
    time.textContent = getTimeFormatted()

    inner.appendChild(bubble)
    inner.appendChild(time)
    wrapper.appendChild(inner)
    app.appendChild(wrapper)
    scrollToBottom(chatViewport)
}

export function createAIBubble({ app, chatViewport }) {
    const wrapper = document.createElement("div")
    wrapper.className = "flex items-start gap-3 message-enter"

    wrapper.innerHTML = `
      <div class="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
        <svg class="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="14" fill="#18181B"/>
          <path d="M32 12C22.611 12 15 19.611 15 29V46C15 49.314 17.686 52 21 52H43C46.314 52 49 49.314 49 46V29C49 19.611 41.389 12 32 12Z" fill="#27272A" stroke="#F4F4F5" stroke-width="2.5"/>
          <path d="M32 25C25.925 25 21 29.925 21 36V48C21 50.209 22.791 52 25 52H39C41.209 52 43 50.209 43 48V36C43 29.925 38.075 25 32 25Z" fill="#FAFAFA"/>
          <circle cx="26.5" cy="22" r="2.2" fill="#FAFAFA"/>
          <circle cx="37.5" cy="22" r="2.2" fill="#FAFAFA"/>
          <path d="M28.5 25.5H35.5L32 30.5L28.5 25.5Z" fill="#F59E0B"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0 max-w-[88%] space-y-1.5">
        <div class="ai-content md-prose rounded-2xl rounded-tl-xs border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-4 py-3.5 text-sm shadow-2xs">
          <span class="ai-loading inline-flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
            <span>Generando respuesta</span>
            <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.15s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.3s]"></span>
          </span>
        </div>
        <div class="flex items-center justify-between px-1">
          <span class="text-[10px] text-zinc-400 dark:text-zinc-500">${getTimeFormatted()}</span>
          <button type="button" class="copy-btn text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer">
            Copiar respuesta
          </button>
        </div>
      </div>
    `

    const contentBox = wrapper.querySelector(".ai-content")
    const copyBtn = wrapper.querySelector(".copy-btn")

    // Copiar respuesta completa
    copyBtn?.addEventListener("click", () => {
        const raw = contentBox.dataset.rawText || contentBox.textContent || ""
        navigator.clipboard.writeText(raw)
        copyBtn.textContent = "¡Copiado!"
        setTimeout(() => {
            copyBtn.textContent = "Copiar respuesta"
        }, 1800)
    })

    // Delegación de eventos para botones "Copiar código" dentro de bloques Markdown
    contentBox?.addEventListener("click", (e) => {
        const btn = e.target.closest(".code-copy-btn")
        if (!btn) return
        const encoded = btn.getAttribute("data-code") || ""
        const code = decodeURIComponent(encoded)
        navigator.clipboard.writeText(code)
        const prev = btn.textContent
        btn.textContent = "¡Copiado!"
        setTimeout(() => {
            btn.textContent = prev
        }, 1600)
    })

    app.appendChild(wrapper)
    scrollToBottom(chatViewport)
    return contentBox
}

export function updateAIMessageMarkdown(contentBox, rawText) {
    contentBox.dataset.rawText = rawText
    contentBox.innerHTML = renderMarkdown(rawText)
}

export function showBubbleError(contentBox, message) {
    contentBox.className =
        "ai-content rounded-2xl rounded-tl-xs border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-4 py-3 text-sm leading-relaxed shadow-2xs"
    contentBox.textContent = message
}
