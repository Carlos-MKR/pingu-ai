import React from "react"
import { registerRoot, Composition, Still } from "remotion"
import { PinguPromoVideo } from "./PinguPromoVideo.jsx"
import { PinguThumbnail } from "./PinguThumbnail.jsx"

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="PinguAIDemo"
                component={PinguPromoVideo}
                durationInFrames={34 * 60} // 34 segundos a 60 FPS (2040 frames)
                fps={60}
                width={1920}
                height={1080}
            />
            <Still
                id="PinguAIThumbnail"
                component={PinguThumbnail}
                width={1920}
                height={1080}
            />
        </>
    )
}

registerRoot(RemotionRoot)
