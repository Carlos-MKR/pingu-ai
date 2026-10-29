import fs from "node:fs"
import path from "node:path"

/**
 * Genera una pista de música ambiental minimalista (estilo tech / Apple / Linear)
 * en formato WAV estéreo de 44.1kHz para el video promocional de Pingu AI (34 segundos).
 */
const SAMPLE_RATE = 44100
const DURATION_SECONDS = 34
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SECONDS
const NUM_CHANNELS = 2

// Progresión de acordes cálida y minimalista (Fmaj9 -> Em7 -> Dm9 -> Cmaj9)
const CHORDS = [
    [174.61, 220.0, 261.63, 329.63, 392.0],  // Fmaj9
    [164.81, 196.0, 246.94, 293.66, 392.0],  // Em7
    [146.83, 174.61, 220.0, 261.63, 329.63], // Dm9
    [130.81, 164.81, 196.0, 246.94, 293.66], // Cmaj9
]

function softSine(freq, t) {
    return Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-t * 0.4)
}

function createWavBuffer() {
    const dataSize = NUM_SAMPLES * NUM_CHANNELS * 2
    const buffer = Buffer.alloc(44 + dataSize)

    // Cabecera RIFF WAVE
    buffer.write("RIFF", 0)
    buffer.writeUInt32LE(36 + dataSize, 4)
    buffer.write("WAVE", 8)
    buffer.write("fmt ", 12)
    buffer.writeUInt32LE(16, 16)
    buffer.writeUInt16LE(1, 20) // PCM
    buffer.writeUInt16LE(NUM_CHANNELS, 22)
    buffer.writeUInt32LE(SAMPLE_RATE, 24)
    buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * 2, 28)
    buffer.writeUInt16LE(NUM_CHANNELS * 2, 32)
    buffer.writeUInt16LE(16, 34)
    buffer.write("data", 36)
    buffer.writeUInt32LE(dataSize, 40)

    const chordDuration = 4.25 // 8 compases en 34s

    for (let i = 0; i < NUM_SAMPLES; i++) {
        const t = i / SAMPLE_RATE
        const chordIndex = Math.floor(t / chordDuration) % CHORDS.length
        const localT = t % chordDuration
        const chord = CHORDS[chordIndex]

        // Envolvente suave de cada acorde
        const attack = Math.min(1, localT / 0.9)
        const release = Math.min(1, (chordDuration - localT) / 1.1)
        const padEnv = attack * release

        let left = 0
        let right = 0

        // Pad cálido estéreo
        chord.forEach((freq, idx) => {
            const pan = (idx / (chord.length - 1)) * 0.6 + 0.2
            const sigL = softSine(freq * 0.999, t) * (1 - pan * 0.4)
            const sigR = softSine(freq * 1.001, t) * (0.6 + pan * 0.4)
            left += sigL * 0.08 * padEnv
            right += sigR * 0.08 * padEnv
        })

        // Pulso minimalista suave cada 0.5s
        const beatDur = 0.5
        const beatIndex = Math.floor(t / beatDur)
        const beatLocalT = t % beatDur
        const arpNote = chord[beatIndex % chord.length] * 2
        const pluckEnv = Math.exp(-beatLocalT * 9.0) * Math.min(1, beatLocalT / 0.015)
        const pluck = Math.sin(2 * Math.PI * arpNote * t) * pluckEnv * 0.045

        left += pluck * (beatIndex % 2 === 0 ? 1.1 : 0.7)
        right += pluck * (beatIndex % 2 === 0 ? 0.7 : 1.1)

        // Sub-bajo suave
        const bassFreq = chord[0] * 0.5
        const bass = Math.sin(2 * Math.PI * bassFreq * t) * padEnv * 0.09
        left += bass
        right += bass

        // Fade in inicial (1.8s) y Fade out final (2.5s)
        const masterFadeIn = Math.min(1, t / 1.8)
        const masterFadeOut = Math.min(1, (DURATION_SECONDS - t) / 2.5)
        const masterGain = masterFadeIn * masterFadeOut * 0.85

        const sampleL = Math.max(-1, Math.min(1, left * masterGain))
        const sampleR = Math.max(-1, Math.min(1, right * masterGain))

        const offset = 44 + i * 4
        buffer.writeInt16LE(Math.round(sampleL * 32767), offset)
        buffer.writeInt16LE(Math.round(sampleR * 32767), offset + 2)
    }

    return buffer
}

const outPath = path.resolve("public", "demo-music.wav")
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, createWavBuffer())
console.log(`Música ambiental (34s) generada en: ${outPath}`)
