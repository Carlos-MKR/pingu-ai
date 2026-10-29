import React from "react"
import {
    AbsoluteFill,
    Audio,
    interpolate,
    spring,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from "remotion"
import { SYSTEM_PRESETS, getTemperatureDescription } from "../config/settings.js"

// =========================================================================
// COORDENADAS EXACTAS BLOQUEADAS DENTRO DE LA VENTANA (1360 x 840)
// Tanto los botones reales como el cursor usan exactamente estas constantes
// =========================================================================
const WIN_W = 1360
const WIN_H = 840

const POS = {
    // Botones de cabecera (centros exactos)
    settingsBtn: { x: 1102, y: 32, w: 112, h: 34 },
    clearChatBtn: { x: 1226, y: 32, w: 118, h: 34 },
    themeToggleBtn: { x: 1314, y: 32, w: 36, h: 36 },

    // Modal Ajustes (560 x 620 centrado -> left: 400, top: 110)
    modal: { left: 400, top: 110, w: 560, h: 620 },
    preset0: { x: 476, y: 274 }, // Especialista Tech
    preset1: { x: 616, y: 274 }, // Consultor Empresarial
    preset3: { x: 848, y: 274 }, // Abuelo Chistoso
    promptTextarea: { x: 660, y: 348 },
    sliderTrack: { left: 424, right: 936, width: 512, y: 536 },
    saveSettingsBtn: { x: 874, y: 698, w: 124, h: 36 },

    // Tarjeta de sugerencia 1 ("Buenas prácticas JS")
    suggestionCard0: { x: 420, y: 505 },

    // Botón "Copiar código" dentro de la respuesta Markdown
    copyCodeBtn: { x: 988, y: 454 },

    // Barra de entrada inferior (Composer)
    composerInput: { x: 560, y: 768 },
    composerSubmit: { x: 1032, y: 768 },
}

const PinguLogoSVG = ({ size = 36 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="16" fill="#18181B" />
        <path
            d="M32 12C22.611 12 15 19.611 15 29V46C15 49.314 17.686 52 21 52H43C46.314 52 49 49.314 49 46V29C49 19.611 41.389 12 32 12Z"
            fill="#27272A"
            stroke="#F4F4F5"
            strokeWidth="2.5"
        />
        <path
            d="M32 25C25.925 25 21 29.925 21 36V48C21 50.209 22.791 52 25 52H39C41.209 52 43 50.209 43 48V36C43 29.925 38.075 25 32 25Z"
            fill="#FAFAFA"
        />
        <circle cx="26.5" cy="22" r="2.2" fill="#FAFAFA" />
        <circle cx="37.5" cy="22" r="2.2" fill="#FAFAFA" />
        <path d="M28.5 25.5H35.5L32 30.5L28.5 25.5Z" fill="#F59E0B" />
    </svg>
)

// Iconos SVG idénticos a index.html
const SlidersIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
        />
    </svg>
)

const PlusIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
)

const SunIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
    </svg>
)

const MoonIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
        />
    </svg>
)

const SendArrowIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    </svg>
)

// Cursor colocado DENTRO del contenedor de la ventana (0..1360, 0..840)
// Así la punta del cursor jamás se desfasa aunque haya zoom de cámara
const AnimatedCursor = ({ x, y, clicking }) => {
    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                // La punta de la flecha en el SVG está en (5, 3), alineamos el origen exacto en (0, 0)
                transform: `translate(-5px, -3px) scale(${clicking ? 0.85 : 1})`,
                transformOrigin: "5px 3px",
                pointerEvents: "none",
                zIndex: 999,
            }}
        >
            {clicking && (
                <div
                    style={{
                        position: "absolute",
                        left: -17,
                        top: -19,
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        border: "2.5px solid #6366f1",
                        backgroundColor: "rgba(99, 102, 241, 0.25)",
                    }}
                />
            )}
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.45))" }}>
                <path
                    d="M5 3L22 11.8L13.8 14.5L10.8 23L5 3Z"
                    fill="#18181b"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}

// Subtítulo descriptivo inferior
const SubtitlePill = ({ badge, text, opacity }) => {
    if (opacity <= 0.01) return null
    return (
        <div
            style={{
                position: "absolute",
                bottom: 34,
                left: "50%",
                transform: `translateX(-50%) translateY(${(1 - opacity) * 14}px)`,
                opacity,
                zIndex: 950,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "11px 24px",
                borderRadius: 9999,
                background: "rgba(9, 9, 11, 0.90)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                boxShadow: "0 20px 45px rgba(0, 0, 0, 0.5)",
                color: "#fafafa",
                fontFamily: "Inter, system-ui, sans-serif",
                whiteSpace: "nowrap",
            }}
        >
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 11px",
                    borderRadius: 9999,
                    background: "#6366f1",
                    color: "#ffffff",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                }}
            >
                {badge}
            </span>
            <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>
                {text}
            </span>
        </div>
    )
}

export const PinguPromoVideo = () => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()

    // =========================================================================
    // CRONOGRAMA COMPLETO (34 Segundos @ 60 FPS = 2040 Frames)
    // =========================================================================
    // 000 - 140 (0.0s - 2.3s): Intro Pingu AI
    // 140 - 390 (2.3s - 6.5s): Escena 1 — Alternar Tema Claro / Oscuro (clic exacto en botón Luna/Sol)
    // 390 - 1020 (6.5s - 17.0s): Escena 2 — Abrir Ajustes IA -> Probar Presets -> Escribir System Prompt propio -> Ajustar Temperatura -> Guardar
    // 1020 - 1540 (17.0s - 25.6s): Escena 3 — Clic en Tarjeta -> Streaming Markdown (Títulos, Lista, Tabla y Código) -> Copiar Código
    // 1540 - 1870 (25.6s - 31.1s): Escena 4 — Clic en "Nueva sesión" -> Escribir pregunta en Input -> Clic en Enviar
    // 1870 - 2040 (31.1s - 34.0s): Outro Pingu AI

    // 1. Estado del Tema (Claro / Oscuro):
    // Empieza en Modo Claro, cambia a Oscuro en f=225, vuelve a Claro en f=295, y pasa a Oscuro en f=350
    const isDark = (frame >= 225 && frame < 295) || frame >= 350

    // 2. Estado del Modal de Ajustes IA (abierto entre f=435 y f=985)
    const isModalOpen = frame >= 435 && frame < 985

    // Selección de Presets y escritura de System Prompt personalizado:
    // f < 525: Preset 0 (Especialista Tech)
    // f 525..595: Clic en Preset 1 (Consultor Empresarial)
    // f 595..655: Clic en Preset 3 (Abuelo Chistoso)
    // f >= 655: El usuario hace clic en el Textarea y escribe su propio System Prompt personalizado
    const CUSTOM_SYSTEM_PROMPT =
        "Eres un Arquitecto Senior en JavaScript y Seguridad Web. Responde en español con tablas comparativas y bloques de código limpios."

    let activePresetId = "tech-senior"
    let displayedSystemPrompt = SYSTEM_PRESETS[0].prompt
    let roleBadgeText = "Especialista Tech"

    if (frame >= 525 && frame < 595) {
        activePresetId = "business"
        displayedSystemPrompt = SYSTEM_PRESETS[1].prompt
        roleBadgeText = "Consultor Empresarial"
    } else if (frame >= 595 && frame < 660) {
        activePresetId = "grandpa-jokes"
        displayedSystemPrompt = SYSTEM_PRESETS[3].prompt
        roleBadgeText = "Abuelo Chistoso"
    } else if (frame >= 660) {
        activePresetId = "custom"
        const typedChars = Math.floor(
            interpolate(frame, [670, 775], [0, CUSTOM_SYSTEM_PROMPT.length], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
            })
        )
        displayedSystemPrompt = CUSTOM_SYSTEM_PROMPT.slice(0, typedChars)
        if (frame >= 940) {
            roleBadgeText = "Rol personalizado"
        }
    }

    // Temperatura: empieza en 0.2, en el modal sube a 0.7 (f 800..845) y luego se ajusta a 0.3 (f 855..905)
    let tempNumeric = 0.2
    if (frame >= 435 && frame < 800) {
        tempNumeric = 0.2
    } else if (frame >= 800 && frame < 850) {
        tempNumeric = interpolate(frame, [800, 845], [0.2, 0.8], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
    } else if (frame >= 850) {
        tempNumeric = interpolate(frame, [855, 905], [0.8, 0.3], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
    }
    const currentTemp = tempNumeric.toFixed(1)
    const sliderThumbX = POS.sliderTrack.left + Number(currentTemp) * POS.sliderTrack.width
    const isSettingsSavedToast = frame >= 940 && frame < 985

    // 3. Estado de la Conversación
    // Primera conversación (f=1060 a f=1605), luego se limpia con "Nueva sesión" en f=1605, y segunda consulta por input en f=1745
    const isChatCleared = frame >= 1605
    const hasFirstPrompt = frame >= 1060 && !isChatCleared
    const hasSecondPrompt = frame >= 1745

    const stream1Progress = interpolate(frame, [1085, 1370], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    })
    const isCodeCopied = frame >= 1465 && frame < 1605

    // Escritura en vivo en el input inferior (#prompt) entre f=1645 y f=1725
    const SECOND_PROMPT_TEXT = "¿Cómo implementar debounce en JavaScript moderno?"
    let composerInputValue = ""
    if (frame >= 1645 && frame < 1745) {
        const chars = Math.floor(
            interpolate(frame, [1645, 1720], [0, SECOND_PROMPT_TEXT.length], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
            })
        )
        composerInputValue = SECOND_PROMPT_TEXT.slice(0, chars)
    }

    const stream2Progress = interpolate(frame, [1765, 1860], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    })

    // =========================================================================
    // TRAYECTORIA EXACTA DEL CURSOR (en coordenadas de la ventana 1360x840)
    // =========================================================================
    let cursorX = 680
    let cursorY = 420
    let clicking = false

    if (frame < 385) {
        // Escena 1: Va al centro exacto de themeToggleBtn (1314, 32)
        cursorX = interpolate(frame, [155, 210], [680, POS.themeToggleBtn.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = interpolate(frame, [155, 210], [420, POS.themeToggleBtn.y], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        clicking =
            (frame >= 220 && frame <= 234) ||
            (frame >= 290 && frame <= 304) ||
            (frame >= 345 && frame <= 360)
    } else if (frame < 445) {
        // Se desplaza al centro exacto del botón "Ajustes IA" (1102, 32)
        cursorX = interpolate(frame, [385, 425], [POS.themeToggleBtn.x, POS.settingsBtn.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = POS.settingsBtn.y
        clicking = frame >= 428 && frame <= 442
    } else if (frame < 560) {
        // Modal abierto: va al preset "Consultor Empresarial" (616, 274)
        cursorX = interpolate(frame, [450, 515], [POS.settingsBtn.x, POS.preset1.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = interpolate(frame, [450, 515], [POS.settingsBtn.y, POS.preset1.y], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        clicking = frame >= 520 && frame <= 534
    } else if (frame < 630) {
        // Va al preset "Abuelo Chistoso" (848, 274)
        cursorX = interpolate(frame, [560, 590], [POS.preset1.x, POS.preset3.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = POS.preset3.y
        clicking = frame >= 592 && frame <= 606
    } else if (frame < 780) {
        // Hace clic dentro del Textarea de System Prompt (660, 348) para escribir uno personalizado
        cursorX = interpolate(frame, [630, 655], [POS.preset3.x, POS.promptTextarea.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = interpolate(frame, [630, 655], [POS.preset3.y, POS.promptTextarea.y], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        clicking = frame >= 656 && frame <= 670
    } else if (frame < 915) {
        // Se mueve al thumb del Slider de Temperatura y lo arrastra en vivo
        const startSliderX = POS.sliderTrack.left + 0.2 * POS.sliderTrack.width
        if (frame < 800) {
            cursorX = interpolate(frame, [780, 798], [POS.promptTextarea.x, startSliderX], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
            })
            cursorY = interpolate(frame, [780, 798], [POS.promptTextarea.y, POS.sliderTrack.y], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
            })
        } else {
            // Pegado exactamente al círculo del slider mientras se mueve
            cursorX = sliderThumbX
            cursorY = POS.sliderTrack.y
            clicking = frame >= 800 && frame <= 905
        }
    } else if (frame < 990) {
        // Va al botón "Guardar ajustes" (874, 698)
        cursorX = interpolate(frame, [915, 935], [sliderThumbX, POS.saveSettingsBtn.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = interpolate(frame, [915, 935], [POS.sliderTrack.y, POS.saveSettingsBtn.y], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        clicking = frame >= 936 && frame <= 952
    } else if (frame < 1080) {
        // Modal cerrado: va a la primera tarjeta de sugerencia "Buenas prácticas JS" (420, 505)
        cursorX = interpolate(frame, [995, 1050], [POS.saveSettingsBtn.x, POS.suggestionCard0.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = interpolate(frame, [995, 1050], [POS.saveSettingsBtn.y, POS.suggestionCard0.y], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        clicking = frame >= 1054 && frame <= 1068
    } else if (frame < 1530) {
        // Espera el streaming y va al botón "Copiar código" (988, 454)
        cursorX = interpolate(frame, [1395, 1455], [POS.suggestionCard0.x, POS.copyCodeBtn.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = interpolate(frame, [1395, 1455], [POS.suggestionCard0.y, POS.copyCodeBtn.y], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        clicking = frame >= 1460 && frame <= 1476
    } else if (frame < 1625) {
        // Va al botón "Nueva sesión" en el header (1226, 32) y limpia el chat
        cursorX = interpolate(frame, [1535, 1595], [POS.copyCodeBtn.x, POS.clearChatBtn.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = interpolate(frame, [1535, 1595], [POS.copyCodeBtn.y, POS.clearChatBtn.y], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        clicking = frame >= 1598 && frame <= 1614
    } else if (frame < 1725) {
        // Baja al input inferior (#prompt) en (560, 768) y hace clic para escribir
        cursorX = interpolate(frame, [1625, 1644], [POS.clearChatBtn.x, POS.composerInput.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = interpolate(frame, [1625, 1644], [POS.clearChatBtn.y, POS.composerInput.y], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        clicking = frame >= 1642 && frame <= 1654
    } else {
        // Va al botón Enviar (1032, 768) y envía el segundo prompt
        cursorX = interpolate(frame, [1722, 1742], [POS.composerInput.x, POS.composerSubmit.x], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        cursorY = POS.composerSubmit.y
        clicking = frame >= 1740 && frame <= 1756
    }

    // =========================================================================
    // CÁMARA CINEMATOGRÁFICA (Zooms suaves enfocados en la acción)
    // =========================================================================
    const z1In = spring({ frame: frame - 165, fps, config: { damping: 19, stiffness: 75 } })
    const z1Out = spring({ frame: frame - 375, fps, config: { damping: 19, stiffness: 75 } })

    const z2In = spring({ frame: frame - 445, fps, config: { damping: 19, stiffness: 75 } })
    const z2Out = spring({ frame: frame - 980, fps, config: { damping: 19, stiffness: 75 } })

    const z3In = spring({ frame: frame - 1380, fps, config: { damping: 19, stiffness: 75 } })
    const z3Out = spring({ frame: frame - 1530, fps, config: { damping: 19, stiffness: 75 } })

    const cameraScale =
        1 +
        0.48 * (z1In - z1Out) +
        0.22 * (z2In - z2Out) +
        0.34 * (z3In - z3Out)

    const cameraX =
        -380 * (z1In - z1Out) +
        0 * (z2In - z2Out) +
        -110 * (z3In - z3Out)

    const cameraY =
        215 * (z1In - z1Out) +
        -10 * (z2In - z2Out) +
        -40 * (z3In - z3Out)

    // =========================================================================
    // SUBTÍTULOS EXPLICATIVOS
    // =========================================================================
    let subtitleBadge = ""
    let subtitleText = ""
    let subtitleOpacity = 0

    if (frame >= 150 && frame < 385) {
        subtitleBadge = "1 · Temas Claro y Oscuro"
        subtitleText = "Alternancia instantánea entre modo claro y oscuro con persistencia automática"
        subtitleOpacity = interpolate(frame, [150, 170, 365, 385], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    } else if (frame >= 400 && frame < 655) {
        subtitleBadge = "2 · Perfiles de IA"
        subtitleText = "Selecciona perfiles predefinidos con un clic desde el panel de Ajustes IA"
        subtitleOpacity = interpolate(frame, [400, 420, 640, 655], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    } else if (frame >= 655 && frame < 990) {
        subtitleBadge = "3 · Personalización Total"
        subtitleText = "Escribe tu propio System Prompt y ajusta la Temperatura (0.0 preciso a 1.0 creativo)"
        subtitleOpacity = interpolate(frame, [655, 675, 970, 990], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    } else if (frame >= 1010 && frame < 1535) {
        subtitleBadge = "4 · Streaming & Markdown"
        subtitleText = "Respuestas en tiempo real con tablas, listas y bloques de código copiables"
        subtitleOpacity = interpolate(frame, [1010, 1030, 1515, 1535], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    } else if (frame >= 1545 && frame < 1865) {
        subtitleBadge = "5 · Nueva Sesión & Consultas"
        subtitleText = "Limpia el historial en cualquier momento o envía tus propias consultas al instante"
        subtitleOpacity = interpolate(frame, [1545, 1565, 1845, 1865], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    }

    // Colores idénticos a tu app (Tailwind Zinc)
    const bgApp = isDark ? "#09090b" : "#fafafa"
    const bgHeader = isDark ? "rgba(24, 24, 27, 0.90)" : "rgba(255, 255, 255, 0.90)"
    const bgSurface = isDark ? "#18181b" : "#ffffff"
    const borderCol = isDark ? "#27272a" : "#e4e4e7"
    const textPrimary = isDark ? "#f4f4f5" : "#18181b"
    const textMuted = isDark ? "#a1a1aa" : "#71717a"
    const btnPrimaryBg = isDark ? "#f4f4f5" : "#18181b"
    const btnPrimaryText = isDark ? "#18181b" : "#ffffff"

    const introOpacity = interpolate(frame, [0, 18, 118, 142], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    const outroOpacity = interpolate(frame, [1870, 1900, 2040], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(circle at 50% 18%, #1e1b4b 0%, #09090b 75%)",
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                overflow: "hidden",
            }}
        >
            <Audio src={staticFile("demo-music.wav")} volume={0.85} />

            {/* ESCENARIO CON CÁMARA */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
                    transformOrigin: "center center",
                }}
            >
                {/* VENTANA DE LA APP (1360 x 840) */}
                <div
                    style={{
                        width: WIN_W,
                        height: WIN_H,
                        borderRadius: 22,
                        overflow: "hidden",
                        backgroundColor: bgApp,
                        color: textPrimary,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 40px 100px rgba(0, 0, 0, 0.65)",
                        position: "relative",
                    }}
                >
                    {/* ================= HEADER (h: 64px) ================= */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: WIN_W,
                            height: 64,
                            borderBottom: `1px solid ${borderCol}`,
                            backgroundColor: bgHeader,
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: 28,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <PinguLogoSVG size={36} />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
                                    Pingu AI
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: textMuted }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }} />
                                    <span style={{ fontWeight: 500, color: textPrimary }}>{roleBadgeText}</span>
                                    <span>·</span>
                                    <span style={{ fontFamily: "monospace", fontSize: 11 }}>Temp {currentTemp}</span>
                                </div>
                            </div>
                        </div>

                        {/* Botón Ajustes IA — Posición exacta (center: 1102, 32) */}
                        <div
                            style={{
                                position: "absolute",
                                left: POS.settingsBtn.x - POS.settingsBtn.w / 2,
                                top: POS.settingsBtn.y - POS.settingsBtn.h / 2,
                                width: POS.settingsBtn.w,
                                height: POS.settingsBtn.h,
                                borderRadius: 8,
                                backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                                border: `1px solid ${frame >= 415 && frame <= 445 ? "#6366f1" : borderCol}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            <SlidersIcon />
                            <span>Ajustes IA</span>
                        </div>

                        {/* Botón Nueva sesión — Posición exacta (center: 1226, 32) */}
                        <div
                            style={{
                                position: "absolute",
                                left: POS.clearChatBtn.x - POS.clearChatBtn.w / 2,
                                top: POS.clearChatBtn.y - POS.clearChatBtn.h / 2,
                                width: POS.clearChatBtn.w,
                                height: POS.clearChatBtn.h,
                                borderRadius: 8,
                                backgroundColor: frame >= 1585 && frame <= 1620 ? (isDark ? "#27272a" : "#f4f4f5") : "transparent",
                                border: `1px solid ${frame >= 1585 && frame <= 1620 ? "#6366f1" : "transparent"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 500,
                                color: textMuted,
                            }}
                        >
                            <PlusIcon />
                            <span>Nueva sesión</span>
                        </div>

                        {/* Botón Tema Claro / Oscuro — Posición exacta (center: 1314, 32) */}
                        <div
                            style={{
                                position: "absolute",
                                left: POS.themeToggleBtn.x - POS.themeToggleBtn.w / 2,
                                top: POS.themeToggleBtn.y - POS.themeToggleBtn.h / 2,
                                width: POS.themeToggleBtn.w,
                                height: POS.themeToggleBtn.h,
                                borderRadius: 8,
                                border: `1px solid ${frame >= 205 && frame <= 370 ? "#6366f1" : borderCol}`,
                                backgroundColor: bgSurface,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: textPrimary,
                            }}
                        >
                            {isDark ? <SunIcon /> : <MoonIcon />}
                        </div>
                    </div>

                    {/* ================= CONTENIDO CENTRAL (top: 64..720) ================= */}
                    <div
                        style={{
                            position: "absolute",
                            top: 64,
                            left: 0,
                            width: WIN_W,
                            height: 660,
                            padding: "28px 300px",
                            boxSizing: "border-box",
                        }}
                    >
                        {!hasFirstPrompt && !hasSecondPrompt ? (
                            /* Estado Inicial idéntico a tu index.html */
                            <div style={{ textAlign: "center", marginTop: 115 }}>
                                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                                    <PinguLogoSVG size={56} />
                                </div>
                                <h2 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                                    ¿Cómo puedo ayudarte?
                                </h2>
                                <p style={{ fontSize: 14, color: textMuted, maxWidth: 440, margin: "0 auto 28px auto", lineHeight: 1.55 }}>
                                    Consulta arquitectura de software, resuelve dudas técnicas o personaliza el comportamiento del asistente desde{" "}
                                    <strong style={{ color: textPrimary }}>Ajustes IA</strong>.
                                </p>

                                {/* 3 tarjetas de sugerencia (centro de tarjeta 0 en x: 420, y: 505) */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, textAlign: "left" }}>
                                    {[
                                        { title: "Buenas prácticas JS", desc: "Principios clave de código limpio" },
                                        { title: "Arquitectura API", desc: "Comparativa REST vs GraphQL vs gRPC" },
                                        { title: "Gestión & Liderazgo", desc: "Minuta ejecutiva de lanzamiento" },
                                    ].map((card, idx) => {
                                        const isHovered = idx === 0 && frame >= 1035 && frame < 1065
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: 14,
                                                    borderRadius: 12,
                                                    border: `1px solid ${isHovered ? "#6366f1" : borderCol}`,
                                                    backgroundColor: bgSurface,
                                                    boxShadow: isHovered ? "0 0 0 2px rgba(99, 102, 241, 0.25)" : "none",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: isHovered ? "#818cf8" : textPrimary,
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {card.title}
                                                </div>
                                                <div style={{ fontSize: 11, color: textMuted, lineHeight: 1.4 }}>{card.desc}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : hasFirstPrompt ? (
                            /* Primera Conversación con Tabla Markdown y Bloque de Código */
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <div
                                        style={{
                                            maxWidth: "78%",
                                            padding: "10px 16px",
                                            borderRadius: "16px 16px 4px 16px",
                                            backgroundColor: btnPrimaryBg,
                                            color: btnPrimaryText,
                                            fontSize: 13.5,
                                        }}
                                    >
                                        Explica de forma breve las mejores prácticas para escribir código limpio y mantenible en JavaScript.
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                    <PinguLogoSVG size={32} />
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                padding: "16px 20px",
                                                borderRadius: "4px 16px 16px 16px",
                                                border: `1px solid ${borderCol}`,
                                                backgroundColor: bgSurface,
                                                fontSize: 13.5,
                                                lineHeight: 1.55,
                                            }}
                                        >
                                            {stream1Progress <= 0.04 ? (
                                                <span style={{ color: textMuted }}>Generando respuesta...</span>
                                            ) : (
                                                <div>
                                                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                                                        Buenas Prácticas de Código Limpio en JS
                                                    </div>

                                                    {stream1Progress > 0.18 && (
                                                        <ul style={{ margin: "0 0 12px 0", paddingLeft: 18 }}>
                                                            <li>
                                                                Usa <strong>funciones puras</strong> con responsabilidad única y evita mutaciones globales.
                                                            </li>
                                                            {stream1Progress > 0.32 && (
                                                                <li>
                                                                    Valida entradas tempranamente (<em>Guard Clauses</em>) para reducir anidamiento.
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}

                                                    {/* Tabla comparativa Markdown */}
                                                    {stream1Progress > 0.45 && (
                                                        <div
                                                            style={{
                                                                borderRadius: 8,
                                                                border: `1px solid ${borderCol}`,
                                                                overflow: "hidden",
                                                                marginBottom: 14,
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: "grid",
                                                                    gridTemplateColumns: "1fr 2fr",
                                                                    backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                                                                    padding: "6px 12px",
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                <span>Patrón</span>
                                                                <span>Beneficio en Producción</span>
                                                            </div>
                                                            <div
                                                                style={{
                                                                    display: "grid",
                                                                    gridTemplateColumns: "1fr 2fr",
                                                                    padding: "6px 12px",
                                                                    borderTop: `1px solid ${borderCol}`,
                                                                }}
                                                            >
                                                                <span>Inmutabilidad</span>
                                                                <span>Previene efectos secundarios inesperados</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Bloque de Código con botón Copiar código en (x: 988, y: 454) */}
                                                    {stream1Progress > 0.62 && (
                                                        <div
                                                            style={{
                                                                borderRadius: 10,
                                                                overflow: "hidden",
                                                                border: "1px solid #27272a",
                                                                backgroundColor: "#09090b",
                                                                color: "#f4f4f5",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    height: 32,
                                                                    padding: "0 12px",
                                                                    backgroundColor: "#18181b",
                                                                    borderBottom: "1px solid #27272a",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "space-between",
                                                                    fontSize: 11,
                                                                }}
                                                            >
                                                                <span style={{ fontFamily: "monospace", color: "#a1a1aa", fontWeight: 600 }}>
                                                                    JAVASCRIPT
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        padding: "3px 10px",
                                                                        borderRadius: 6,
                                                                        fontWeight: 600,
                                                                        color: isCodeCopied ? "#34d399" : "#e4e4e7",
                                                                        backgroundColor: isCodeCopied
                                                                            ? "rgba(16, 185, 129, 0.18)"
                                                                            : "rgba(255, 255, 255, 0.08)",
                                                                    }}
                                                                >
                                                                    {isCodeCopied ? "¡Copiado!" : "Copiar código"}
                                                                </span>
                                                            </div>
                                                            <pre
                                                                style={{
                                                                    margin: 0,
                                                                    padding: "12px 14px",
                                                                    fontFamily: "monospace",
                                                                    fontSize: 12,
                                                                    lineHeight: 1.5,
                                                                }}
                                                            >
                                                                {`export function calcularTotal(items = [], impuesto = 0.16) {
  if (!items.length) return 0;
  const subtotal = items.reduce((acc, item) => acc + item.precio, 0);
  return Number((subtotal * (1 + impuesto)).toFixed(2));
}`}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Segunda Conversación enviada desde el Input Inferior */
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <div
                                        style={{
                                            maxWidth: "78%",
                                            padding: "10px 16px",
                                            borderRadius: "16px 16px 4px 16px",
                                            backgroundColor: btnPrimaryBg,
                                            color: btnPrimaryText,
                                            fontSize: 13.5,
                                        }}
                                    >
                                        {SECOND_PROMPT_TEXT}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                    <PinguLogoSVG size={32} />
                                    <div
                                        style={{
                                            flex: 1,
                                            padding: "16px 20px",
                                            borderRadius: "4px 16px 16px 16px",
                                            border: `1px solid ${borderCol}`,
                                            backgroundColor: bgSurface,
                                            fontSize: 13.5,
                                            lineHeight: 1.55,
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                            Implementación de Debounce en ES6+
                                        </div>
                                        {stream2Progress > 0.25 && (
                                            <div
                                                style={{
                                                    borderRadius: 10,
                                                    overflow: "hidden",
                                                    border: "1px solid #27272a",
                                                    backgroundColor: "#09090b",
                                                    color: "#f4f4f5",
                                                    marginTop: 8,
                                                }}
                                            >
                                                <pre style={{ margin: 0, padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>
                                                    {`export const debounce = (fn, delay = 300) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};`}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ================= FOOTER COMPOSER (y: 742..794) ================= */}
                    <div
                        style={{
                            position: "absolute",
                            left: 300,
                            top: 742,
                            width: 760,
                            height: 52,
                            borderRadius: 16,
                            border: `1px solid ${frame >= 1640 && frame < 1750 ? "#6366f1" : borderCol}`,
                            backgroundColor: bgSurface,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 10px 0 18px",
                            boxSizing: "border-box",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 14,
                                color: composerInputValue ? textPrimary : textMuted,
                            }}
                        >
                            {composerInputValue || "Pregunta lo que quieras..."}
                        </span>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: btnPrimaryBg,
                                color: btnPrimaryText,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <SendArrowIcon />
                        </div>
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 804,
                            width: WIN_W,
                            textAlign: "center",
                            fontSize: 11,
                            color: textMuted,
                        }}
                    >
                        Pingu AI Workspace · Puedes personalizar el rol y la creatividad del modelo en <strong>Ajustes IA</strong>.
                    </div>

                    {/* ================= MODAL DE AJUSTES IA (560 x 620 en left: 400, top: 110) ================= */}
                    {isModalOpen && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: "rgba(9, 9, 11, 0.60)",
                                backdropFilter: "blur(4px)",
                                zIndex: 50,
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    left: POS.modal.left,
                                    top: POS.modal.top,
                                    width: POS.modal.w,
                                    height: POS.modal.h,
                                    borderRadius: 18,
                                    backgroundColor: bgSurface,
                                    border: `1px solid ${borderCol}`,
                                    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.55)",
                                    boxSizing: "border-box",
                                }}
                            >
                                {/* Cabecera del Modal */}
                                <div
                                    style={{
                                        height: 64,
                                        padding: "0 24px",
                                        borderBottom: `1px solid ${borderCol}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 600 }}>Ajustes del Agente IA</div>
                                        <div style={{ fontSize: 11.5, color: textMuted }}>
                                            Personaliza el comportamiento y la precisión de las respuestas
                                        </div>
                                    </div>
                                    <span style={{ color: textMuted, fontSize: 16 }}>✕</span>
                                </div>

                                {/* Cuerpo del Modal */}
                                <div style={{ padding: "18px 24px" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                                        System Prompt (Instrucciones del Sistema)
                                    </div>
                                    <div style={{ fontSize: 11.5, color: textMuted, lineHeight: 1.45, marginBottom: 12 }}>
                                        Define la <strong>identidad, profesión, tono y reglas</strong> que la IA adoptará antes de responderte.
                                    </div>

                                    <div style={{ fontSize: 11, color: textMuted, marginBottom: 6 }}>Perfiles rápidos:</div>

                                    {/* Fila de botones de Presets en y=274 (relativo a ventana) -> top=164 relativo a modal */}
                                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                                        {SYSTEM_PRESETS.map((preset) => {
                                            const active = activePresetId === preset.id
                                            return (
                                                <span
                                                    key={preset.id}
                                                    style={{
                                                        padding: "5px 10px",
                                                        borderRadius: 8,
                                                        fontSize: 11.5,
                                                        fontWeight: 600,
                                                        backgroundColor: active ? btnPrimaryBg : isDark ? "#27272a" : "#f4f4f5",
                                                        color: active ? btnPrimaryText : textPrimary,
                                                        border: `1px solid ${borderCol}`,
                                                    }}
                                                >
                                                    {preset.label}
                                                </span>
                                            )
                                        })}
                                    </div>

                                    {/* Textarea del System Prompt */}
                                    <div
                                        style={{
                                            height: 92,
                                            padding: "10px 14px",
                                            borderRadius: 12,
                                            border: `1px solid ${frame >= 655 && frame < 780 ? "#6366f1" : borderCol}`,
                                            backgroundColor: bgApp,
                                            fontSize: 12.5,
                                            lineHeight: 1.5,
                                            boxSizing: "border-box",
                                            marginBottom: 18,
                                        }}
                                    >
                                        {displayedSystemPrompt}
                                        {frame >= 665 && frame < 778 && (
                                            <span style={{ color: "#6366f1", fontWeight: 700 }}>|</span>
                                        )}
                                    </div>

                                    {/* Sección Temperatura */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                                            Temperatura (Nivel de Creatividad)
                                        </span>
                                        <span
                                            style={{
                                                padding: "2px 10px",
                                                borderRadius: 6,
                                                fontFamily: "monospace",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                backgroundColor: btnPrimaryBg,
                                                color: btnPrimaryText,
                                            }}
                                        >
                                            {currentTemp}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11.5, color: textMuted, lineHeight: 1.4, marginBottom: 14 }}>
                                        Controla qué tan predecible o creativa es la IA (de <strong>0.0 a 1.0</strong>).
                                    </div>

                                    {/* Barra Slider en y = 536 relativo a ventana (top: 426 relativo al modal) */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 24,
                                            top: POS.sliderTrack.y - POS.modal.top - 4,
                                            width: POS.sliderTrack.width,
                                            height: 8,
                                            borderRadius: 999,
                                            backgroundColor: isDark ? "#27272a" : "#e4e4e7",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${Number(currentTemp) * 100}%`,
                                                height: "100%",
                                                borderRadius: 999,
                                                backgroundColor: "#6366f1",
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: `${Number(currentTemp) * 100}%`,
                                                top: "50%",
                                                transform: "translate(-50%, -50%)",
                                                width: 18,
                                                height: 18,
                                                borderRadius: "50%",
                                                backgroundColor: btnPrimaryBg,
                                                border: "2px solid #6366f1",
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            marginTop: 30,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: 10.5,
                                            color: textMuted,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <span>0.0 · Más preciso (Código)</span>
                                        <span>0.5 · Equilibrado</span>
                                        <span>1.0 · Más creativo</span>
                                    </div>

                                    <div
                                        style={{
                                            padding: "9px 12px",
                                            borderRadius: 10,
                                            backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                                            fontSize: 11.5,
                                        }}
                                    >
                                        {getTemperatureDescription(currentTemp)}
                                    </div>
                                </div>

                                {/* Pie del Modal con botón Guardar ajustes en (x: 874, y: 698) */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        width: "100%",
                                        height: 64,
                                        padding: "0 24px",
                                        borderTop: `1px solid ${borderCol}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: isSettingsSavedToast ? "#34d399" : textMuted, fontWeight: isSettingsSavedToast ? 600 : 400 }}>
                                        {isSettingsSavedToast ? "✓ Configuración guardada y aplicada" : "Restaurar por defecto"}
                                    </span>

                                    <div
                                        style={{
                                            width: POS.saveSettingsBtn.w,
                                            height: POS.saveSettingsBtn.h,
                                            borderRadius: 10,
                                            backgroundColor: btnPrimaryBg,
                                            color: btnPrimaryText,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Guardar ajustes
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CURSOR ANIMADO DENTRO DEL MISMO SISTEMA DE COORDENADAS DE LA VENTANA */}
                    {frame >= 150 && frame < 1860 && (
                        <AnimatedCursor x={cursorX} y={cursorY} clicking={clicking} />
                    )}
                </div>
            </div>

            {/* SUBTÍTULO INFERIOR */}
            <SubtitlePill badge={subtitleBadge} text={subtitleText} opacity={subtitleOpacity} />

            {/* INTRO */}
            {introOpacity > 0.01 && (
                <AbsoluteFill
                    style={{
                        backgroundColor: "#09090b",
                        opacity: introOpacity,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fafafa",
                        zIndex: 1000,
                    }}
                >
                    <PinguLogoSVG size={110} />
                    <h1 style={{ fontSize: 64, fontWeight: 800, margin: "24px 0 12px 0", letterSpacing: "-0.03em" }}>
                        Pingu AI
                    </h1>
                    <p style={{ fontSize: 23, color: "#a1a1aa", margin: "0 0 28px 0" }}>
                        Asistente de IA Minimalista con Streaming en Tiempo Real
                    </p>
                    <div style={{ display: "flex", gap: 12 }}>
                        {["Vite", "Tailwind CSS v4", "OpenRouter API", "Markdown Live"].map((tag) => (
                            <span
                                key={tag}
                                style={{
                                    padding: "6px 16px",
                                    borderRadius: 999,
                                    backgroundColor: "#18181b",
                                    border: "1px solid #27272a",
                                    fontSize: 14,
                                    color: "#e4e4e7",
                                    fontWeight: 500,
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </AbsoluteFill>
            )}

            {/* OUTRO */}
            {outroOpacity > 0.01 && (
                <AbsoluteFill
                    style={{
                        backgroundColor: "#09090b",
                        opacity: outroOpacity,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fafafa",
                        zIndex: 1000,
                    }}
                >
                    <PinguLogoSVG size={96} />
                    <h2 style={{ fontSize: 52, fontWeight: 800, margin: "20px 0 10px 0", letterSpacing: "-0.03em" }}>
                        Pingu AI
                    </h2>
                    <p style={{ fontSize: 22, color: "#a1a1aa", margin: 0 }}>
                        Diseño minimalista · Personalizable · Tiempo real
                    </p>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    )
}
