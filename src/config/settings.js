const STORAGE_KEY = "pingu-ai-settings"

export const SYSTEM_PRESETS = [
    {
        id: "tech-senior",
        label: "Especialista Tech",
        prompt: "Actúa como un Arquitecto de Software Senior y especialista en tecnología. Responde siempre en español de manera clara, estructurada y profesional, aplicando buenas prácticas y ejemplos prácticos cuando sea útil."
    },
    {
        id: "business",
        label: "Consultor Empresarial",
        prompt: "Actúa como un consultor estratégico de negocios y comunicación ejecutiva. Responde siempre en español con tono corporativo, directo, orientado a resultados y fácil de presentar a directivos."
    },
    {
        id: "teacher",
        label: "Mentor Didáctico",
        prompt: "Actúa como un profesor paciente y didáctico. Explica cualquier concepto paso a paso en español con analogías sencillas y ejemplos fáciles de entender."
    },
    {
        id: "grandpa-jokes",
        label: "Abuelo Chistoso",
        prompt: "Eres un abuelo simpático de 70 años y cuentas chistes en tus respuestas."
    }
]

export const DEFAULT_SETTINGS = {
    systemPrompt: SYSTEM_PRESETS[0].prompt,
    temperature: 0.2
}

export function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return { ...DEFAULT_SETTINGS }

        const parsed = JSON.parse(raw)
        const systemPrompt =
            typeof parsed.systemPrompt === "string" && parsed.systemPrompt.trim() !== ""
                ? parsed.systemPrompt.trim()
                : DEFAULT_SETTINGS.systemPrompt

        const tempNum = Number(parsed.temperature)
        const temperature =
            !Number.isNaN(tempNum) && tempNum >= 0 && tempNum <= 1
                ? Math.round(tempNum * 10) / 10
                : DEFAULT_SETTINGS.temperature

        return { systemPrompt, temperature }
    } catch {
        return { ...DEFAULT_SETTINGS }
    }
}

export function saveSettings(settings) {
    const cleanSettings = {
        systemPrompt:
            typeof settings.systemPrompt === "string" && settings.systemPrompt.trim() !== ""
                ? settings.systemPrompt.trim()
                : DEFAULT_SETTINGS.systemPrompt,
        temperature: Math.min(1, Math.max(0, Math.round(Number(settings.temperature) * 10) / 10))
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanSettings))
    return cleanSettings
}

export function getTemperatureDescription(temp) {
    const value = Number(temp)
    if (value <= 0.2) {
        return "Preciso y predecible · Ideal para programación, lógica y respuestas exactas."
    }
    if (value <= 0.5) {
        return "Equilibrado · Combina exactitud técnica con redacción natural y fluida."
    }
    if (value <= 0.8) {
        return "Creativo · Ideal para redacción de contenido, lluvia de ideas y narrativa."
    }
    return "Alta creatividad · Respuestas muy variadas, originales y menos predecibles."
}

