import './style.css'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { loadSettings } from './config/settings.js'
import {
    initTheme,
    toggleTheme,
    scrollToBottom,
    createUserBubble,
    createAIBubble,
    updateAIMessageMarkdown,
    showBubbleError,
} from './ui/chatUI.js'
import { initSettingsModal } from './ui/settingsModal.js'


const openRouter = createOpenRouter({
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
})

// Modelo configurable vía .env (Explora más modelos en: https://openrouter.ai/models)
const DEFAULT_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'nvidia/nemotron-3.5-super-vl:free'

// Referencias del DOM principal
const form = document.querySelector("#chat-form")
const app = document.querySelector("#app")
const submitBtn = document.querySelector("#submit")
const promptInput = document.querySelector("#prompt")
const emptyState = document.querySelector("#empty-state")
const chatViewport = document.querySelector("#chat-viewport")
const themeToggleBtn = document.querySelector("#theme-toggle")
const iconSun = document.querySelector("#icon-sun")
const iconMoon = document.querySelector("#icon-moon")
const clearChatBtn = document.querySelector("#clear-chat")
const suggestionBtns = document.querySelectorAll(".suggestion-btn")

// Estado de configuración (System Prompt y Temperatura)
const currentSettings = loadSettings()

// Inicializar tema (Claro / Oscuro)
initTheme(iconSun, iconMoon)

themeToggleBtn?.addEventListener("click", () => {
    toggleTheme(iconSun, iconMoon)
})

// Inicializar modal de Ajustes IA
initSettingsModal({
    currentSettings,
})

// Limpiar conversación actual
clearChatBtn?.addEventListener("click", () => {
    while (app.firstChild) {
        app.removeChild(app.firstChild)
    }
    emptyState?.classList.remove("hidden")
    promptInput.value = ""
    promptInput.focus()
})

// Tarjetas de sugerencias rápidas
suggestionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-prompt")
        if (text) {
            promptInput.value = text
            form.requestSubmit()
        }
    })
})

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const prompt = promptInput.value

    if (prompt.trim() === "") return

    promptInput.value = ""
    submitBtn.disabled = true
    submitBtn.classList.add("opacity-50")

    createUserBubble({ app, emptyState, chatViewport, text: prompt })
    const aiContentBox = createAIBubble({ app, chatViewport })
    let streamError = null

    try {
        const result = streamText({
            model: openRouter(DEFAULT_MODEL), // modelo configurable vía .env con fallback
            prompt, // prompt para generar texto
            // system: "Actúa como un asistente de programación. Responde siempre en español.",
            // system: "Eres un niño de 3 años",
            system: currentSettings.systemPrompt, // establece el comportamiento de la IA
            temperature: currentSettings.temperature, // indica que la IA será más predecible y menos creativa (va de 0 a 1)
            onError({ error }) {
                streamError = error
                console.error(error)
            }
        })

        let fullMarkdown = ""

        for await (const text of result.textStream) {
            fullMarkdown += text
            updateAIMessageMarkdown(aiContentBox, fullMarkdown)
            scrollToBottom(chatViewport)
        }

        if (streamError) {
            showBubbleError(
                aiContentBox,
                "Error al conectar con el modelo en OpenRouter (posible límite 429 o modelo saturado). Intenta de nuevo en unos segundos."
            )
        } else if (fullMarkdown.trim() === "") {
            aiContentBox.textContent = "No se recibió respuesta del modelo."
        }
    } catch (error) {
        console.error(error)
        showBubbleError(
            aiContentBox,
            "Error al conectar con el modelo en OpenRouter (posible límite 429). Intenta nuevamente en unos segundos."
        )
    } finally {
        submitBtn.disabled = false
        submitBtn.classList.remove("opacity-50")
        promptInput.focus()
    }
})
