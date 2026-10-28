import {
    DEFAULT_SETTINGS,
    SYSTEM_PRESETS,
    getTemperatureDescription,
    saveSettings,
} from "../config/settings.js"

export function initSettingsModal({ currentSettings, onSettingsChange }) {
    const dialog = document.querySelector("#settings-dialog")
    const openBtn = document.querySelector("#open-settings")
    const closeBtn = document.querySelector("#close-settings")
    const cancelBtn = document.querySelector("#cancel-settings")
    const resetBtn = document.querySelector("#reset-settings")
    const settingsForm = document.querySelector("#settings-form")
    const systemPromptInput = document.querySelector("#system-prompt-input")
    const temperatureInput = document.querySelector("#temperature-input")
    const temperatureValueLabel = document.querySelector("#temperature-value")
    const temperatureDescLabel = document.querySelector("#temperature-desc")
    const presetsContainer = document.querySelector("#presets-container")
    const activeTempBadge = document.querySelector("#active-temp-badge")
    const activeRoleBadge = document.querySelector("#active-role-badge")
    const statusBanner = document.querySelector("#settings-status")

    if (!dialog || !settingsForm) return

    // Renderizar botones de plantillas (Presets)
    function renderPresets() {
        if (!presetsContainer) return
        presetsContainer.innerHTML = ""

        SYSTEM_PRESETS.forEach((preset) => {
            const btn = document.createElement("button")
            btn.type = "button"
            const isSelected = systemPromptInput.value.trim() === preset.prompt
            btn.className = isSelected
                ? "px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 transition-all cursor-pointer"
                : "px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all cursor-pointer"
            btn.textContent = preset.label

            btn.addEventListener("click", () => {
                systemPromptInput.value = preset.prompt
                renderPresets()
            })

            presetsContainer.appendChild(btn)
        })
    }

    function updateTemperatureUI(val) {
        const formatted = Number(val).toFixed(1)
        if (temperatureValueLabel) {
            temperatureValueLabel.textContent = formatted
        }
        if (temperatureDescLabel) {
            temperatureDescLabel.textContent = getTemperatureDescription(val)
        }
    }

    function updateHeaderBadges(settings) {
        if (activeTempBadge) {
            activeTempBadge.textContent = `Temp ${Number(settings.temperature).toFixed(1)}`
        }
        if (activeRoleBadge) {
            const matchedPreset = SYSTEM_PRESETS.find(
                (p) => p.prompt === settings.systemPrompt.trim()
            )
            activeRoleBadge.textContent = matchedPreset
                ? matchedPreset.label
                : "Rol personalizado"
        }
    }

    function syncFormWithSettings(settings) {
        if (systemPromptInput) {
            systemPromptInput.value = settings.systemPrompt
        }
        if (temperatureInput) {
            temperatureInput.value = settings.temperature
        }
        updateTemperatureUI(settings.temperature)
        renderPresets()
    }

    // Inicializar estado visual de las insignias en la cabecera
    updateHeaderBadges(currentSettings)

    // Eventos del modal
    openBtn?.addEventListener("click", () => {
        syncFormWithSettings(currentSettings)
        statusBanner?.classList.add("hidden")
        dialog.showModal()
    })

    closeBtn?.addEventListener("click", () => dialog.close())
    cancelBtn?.addEventListener("click", () => dialog.close())

    // Cerrar al hacer clic en el fondo (backdrop)
    dialog.addEventListener("click", (e) => {
        const rect = dialog.getBoundingClientRect()
        const clickedInDialog =
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
        if (!clickedInDialog) {
            dialog.close()
        }
    })

    temperatureInput?.addEventListener("input", (e) => {
        updateTemperatureUI(e.target.value)
    })

    systemPromptInput?.addEventListener("input", () => {
        renderPresets()
    })

    // Restaurar valores por defecto
    resetBtn?.addEventListener("click", () => {
        syncFormWithSettings(DEFAULT_SETTINGS)
    })

    // Guardar ajustes
    settingsForm.addEventListener("submit", (e) => {
        e.preventDefault()

        const updated = saveSettings({
            systemPrompt: systemPromptInput.value,
            temperature: temperatureInput.value,
        })

        currentSettings.systemPrompt = updated.systemPrompt
        currentSettings.temperature = updated.temperature

        updateHeaderBadges(updated)
        onSettingsChange?.(updated)

        if (statusBanner) {
            statusBanner.classList.remove("hidden")
            setTimeout(() => {
                statusBanner.classList.add("hidden")
                dialog.close()
            }, 650)
        } else {
            dialog.close()
        }
    })
}

