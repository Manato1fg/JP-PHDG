import { clearAll, clearDraw, initApplePencil, undoDraw, getCanvasAsImage } from "./applepencil.js"

document.addEventListener("DOMContentLoaded", async function() {
    const rightDiv = document.querySelector("#body-right")
    const width = rightDiv.clientWidth * 0.8
    const height = rightDiv.clientHeight * 0.8
    const size = Math.min(width, height)
    initApplePencil(size, size)

    const undoButton = document.querySelector("#canvas-control-undo")
    undoButton.addEventListener("click", () => undoDraw())

    const clearButton = document.querySelector("#canvas-control-clear")
    clearButton.addEventListener("click", () => clearDraw())

    let index_count = 0
    async function getNextCharacter() {
        const response = await fetch(`/get-character?index_count=${index_count}`)
        index_count += 1
        const data = await response.json()
        const character = data["character"]
        const c = document.querySelector("#character")
        c.textContent = character
    }

    const nextButton = document.querySelector("#control-next")
    nextButton.addEventListener("click", async () => {
        let imageBase64 = getCanvasAsImage()
        if (imageBase64 !== null) {
            imageBase64 = imageBase64.split(",")[1]
            // save image but don't wait for it
            const formData = new FormData()
            formData.append("image", imageBase64)
            formData.append("character", document.querySelector(".character").textContent)
            fetch("/save-image", {
                method: "POST",
                body: formData
            })
        }
        await getNextCharacter()
        clearAll()
    })
    await getNextCharacter()
})