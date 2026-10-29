import React from "react"
import { AbsoluteFill } from "remotion"

const PinguLogoSVG = ({ size = 84 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="16" fill="#18181B" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
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

export const PinguThumbnail = () => {
    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#09090b",
                backgroundImage: `
                  radial-gradient(circle at 18% 22%, rgba(99, 102, 241, 0.28) 0%, transparent 48%),
                  radial-gradient(circle at 82% 75%, rgba(16, 185, 129, 0.18) 0%, transparent 45%),
                  linear-gradient(135deg, #09090b 0%, #0f172a 100%)
                `,
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                color: "#fafafa",
                overflow: "hidden",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 88px",
            }}
        >
            {/* Patrón de cuadrícula sutil de fondo */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    pointerEvents: "none",
                }}
            />

            {/* COLUMNA IZQUIERDA: COPY DE ALTO IMPACTO PARA YOUTUBE */}
            <div
                style={{
                    width: 720,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                }}
            >
                {/* Insignia superior */}
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 18px",
                        borderRadius: 9999,
                        backgroundColor: "rgba(99, 102, 241, 0.16)",
                        border: "1px solid rgba(129, 140, 248, 0.4)",
                        marginBottom: 28,
                    }}
                >
                    <span
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                            boxShadow: "0 0 12px #10b981",
                        }}
                    />
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#c7d2fe",
                        }}
                    >
                        JAVASCRIPT + OPENROUTER AI
                    </span>
                </div>

                {/* Logo + Nombre grande */}
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 18 }}>
                    <PinguLogoSVG size={96} />
                    <span
                        style={{
                            fontSize: 98,
                            fontWeight: 900,
                            letterSpacing: "-0.04em",
                            lineHeight: 1,
                            color: "#ffffff",
                        }}
                    >
                        Pingu AI
                    </span>
                </div>

                {/* Subtítulo llamativo */}
                <h2
                    style={{
                        fontSize: 48,
                        fontWeight: 800,
                        lineHeight: 1.18,
                        letterSpacing: "-0.025em",
                        margin: "0 0 34px 0",
                        background: "linear-gradient(90deg, #f4f4f5 0%, #a5b4fc 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Chat IA Minimalista en Tiempo Real
                </h2>

                {/* Píldoras de características */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {[
                        "⚡ Streaming Token a Token",
                        "🎛️ System Prompt & Temperatura",
                        "📝 Formato Markdown",
                        "🌗 Modo Claro / Oscuro",
                    ].map((pill) => (
                        <div
                            key={pill}
                            style={{
                                padding: "10px 18px",
                                borderRadius: 12,
                                backgroundColor: "rgba(24, 24, 27, 0.9)",
                                border: "1px solid rgba(255, 255, 255, 0.14)",
                                fontSize: 17,
                                fontWeight: 600,
                                color: "#e4e4e7",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                            }}
                        >
                            {pill}
                        </div>
                    ))}
                </div>
            </div>

            {/* COLUMNA DERECHA: COMPOSICIÓN VISUAL DE LA INTERFAZ REAL */}
            <div
                style={{
                    position: "relative",
                    width: 960,
                    height: 820,
                    zIndex: 10,
                }}
            >
                {/* Ventana Principal en Modo Oscuro (inclinación sutil estilo showcase) */}
                <div
                    style={{
                        position: "absolute",
                        top: 40,
                        right: -20,
                        width: 860,
                        height: 620,
                        borderRadius: 24,
                        backgroundColor: "#09090b",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                        boxShadow: "0 45px 100px rgba(0, 0, 0, 0.8), 0 0 60px rgba(99, 102, 241, 0.18)",
                        overflow: "hidden",
                        transform: "perspective(1400px) rotateY(-8deg) rotateX(3deg)",
                    }}
                >
                    {/* Header de la ventana */}
                    <div
                        style={{
                            height: 64,
                            padding: "0 26px",
                            borderBottom: "1px solid #27272a",
                            backgroundColor: "#18181b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <PinguLogoSVG size={36} />
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>Pingu AI</div>
                                <div style={{ fontSize: 12, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#10b981" }} />
                                    <span style={{ color: "#e4e4e7", fontWeight: 600 }}>Especialista Tech</span>
                                    <span>·</span>
                                    <span style={{ fontFamily: "monospace" }}>Temp 0.2</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 9,
                                    backgroundColor: "#27272a",
                                    border: "1px solid #3f3f46",
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                }}
                            >
                                Ajustes IA
                            </div>
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 9,
                                    backgroundColor: "#27272a",
                                    border: "1px solid #3f3f46",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#facc15",
                                }}
                            >
                                ☀
                            </div>
                        </div>
                    </div>

                    {/* Contenido del Chat con Código Markdown */}
                    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <div
                                style={{
                                    padding: "12px 18px",
                                    borderRadius: "18px 18px 4px 18px",
                                    backgroundColor: "#f4f4f5",
                                    color: "#18181b",
                                    fontSize: 14.5,
                                    fontWeight: 600,
                                }}
                            >
                                ¿Cómo escribir código limpio y modular en JavaScript?
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <PinguLogoSVG size={34} />
                            <div
                                style={{
                                    flex: 1,
                                    padding: "18px 20px",
                                    borderRadius: "4px 18px 18px 18px",
                                    backgroundColor: "#18181b",
                                    border: "1px solid #27272a",
                                }}
                            >
                                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
                                    Arquitectura Modular en ES6+
                                </div>
                                <div style={{ fontSize: 13.5, color: "#d4d4d8", marginBottom: 14, lineHeight: 1.5 }}>
                                    Separa responsabilidades en funciones puras y mantén la configuración desacoplada:
                                </div>

                                <div
                                    style={{
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        border: "1px solid #3f3f46",
                                        backgroundColor: "#09090b",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "8px 14px",
                                            backgroundColor: "#27272a",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: 11.5,
                                            fontFamily: "monospace",
                                        }}
                                    >
                                        <span style={{ color: "#a1a1aa", fontWeight: 700 }}>JAVASCRIPT</span>
                                        <span style={{ color: "#34d399", fontWeight: 700 }}>¡Copiado!</span>
                                    </div>
                                    <pre
                                        style={{
                                            margin: 0,
                                            padding: "14px 16px",
                                            fontFamily: "monospace",
                                            fontSize: 13,
                                            lineHeight: 1.55,
                                            color: "#e4e4e7",
                                        }}
                                    >
                                        {`const result = streamText({
  model: openRouter('nemotron-3.5:free'),
  system: currentSettings.systemPrompt,
  temperature: currentSettings.temperature,
});`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarjeta Flotante Superpuesta: Modal de Ajustes IA (Abajo a la izquierda de la vista previa) */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 28,
                        left: 0,
                        width: 440,
                        borderRadius: 20,
                        backgroundColor: "rgba(24, 24, 27, 0.96)",
                        border: "1.5px solid rgba(99, 102, 241, 0.55)",
                        boxShadow: "0 30px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(99, 102, 241, 0.25)",
                        padding: 22,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
                            🎛️ Ajustes del Agente IA
                        </span>
                        <span
                            style={{
                                padding: "3px 10px",
                                borderRadius: 6,
                                backgroundColor: "#6366f1",
                                color: "#ffffff",
                                fontFamily: "monospace",
                                fontSize: 12.5,
                                fontWeight: 700,
                            }}
                        >
                            Temp 0.2
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {["Especialista Tech", "Consultor", "Personalizado"].map((tag, i) => (
                            <span
                                key={tag}
                                style={{
                                    padding: "5px 10px",
                                    borderRadius: 8,
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    backgroundColor: i === 0 ? "#fafafa" : "#27272a",
                                    color: i === 0 ? "#18181b" : "#d4d4d8",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Barra de Temperatura visual */}
                    <div
                        style={{
                            height: 9,
                            borderRadius: 999,
                            backgroundColor: "#27272a",
                            position: "relative",
                            marginBottom: 10,
                        }}
                    >
                        <div
                            style={{
                                width: "28%",
                                height: "100%",
                                borderRadius: 999,
                                backgroundColor: "#6366f1",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                left: "28%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                backgroundColor: "#ffffff",
                                border: "3px solid #6366f1",
                            }}
                        />
                    </div>
                    <div style={{ fontSize: 12, color: "#a1a1aa" }}>
                        Preciso y predecible · Ideal para programación y lógica
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    )
}

