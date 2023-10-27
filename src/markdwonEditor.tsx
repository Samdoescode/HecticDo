import { invoke } from "@tauri-apps/api"
import { children, onMount, For } from "solid-js"
import { createStore } from "solid-js/store"

export default function MarkDownEditor() {

    type textStore = {
        MarkdownText: string[],
        HTMLElements: Element[]
    }

    const [editorText, setEditorText] = createStore<textStore>({
        MarkdownText: ["## Hello World", "this is some text", "**this is bold**"],
        HTMLElements: []
    })

    const makeHTML = (i: string) => document.createRange().createContextualFragment(i).firstElementChild!

    const getText = async (text: string | string[], id: number | number[]) => {
        if (typeof text === "string") {
            setEditorText("HTMLElements", id, "")
            await invoke<string>("markdown", { text: text }).then(a => setEditorText("HTMLElements", id, makeHTML(a)))
        } else if (typeof text === "object") {
            for (let i = 0; i < text.length; i++) {
                await invoke<string>("markdown", { text: text[i] }).then(a => setEditorText("HTMLElements", id, makeHTML(a)))
            }
        }
    }

    onMount(() => {
        const markdown = editorText.MarkdownText
        for (let i = 0; i < markdown.length; i++)
            getText(markdown[i], i)
    })

    const updateEditorText = (id: number | number[], newText: string | string[]) => {
        if (typeof id === "number" && typeof newText === "string") {
            setEditorText("MarkdownText", id, newText)
            updateHTML(id)
        }
    }

    const updateHTML = (id: number) => {
        getText(editorText.MarkdownText[id], id)
    }

    const updateToFocusedState = (i: number) => {
        editorText.HTMLElements[i].textContent = editorText.MarkdownText[i]
    }
    
    const updateToUnfocusedState = (i: number) => {
        updateEditorText(i, editorText.MarkdownText[i])
    }
    function eventHandler(e: Event) {
        e.preventDefault()
        updateToFocusedState(0)
        const selection = getCaret() //return currentSelect
        for (let i = 0; i < selection.length; i++) {
            if (selection[i].state === "selected") {
                updateToFocusedState(selection[i].index)
            } else {
                updateToUnfocusedState(selection[i].index)
            }
        }
    }
    type selectorReturn = {
        el: Element,
        state: string,
        index: number
    }[]

    const getCaret = (): selectorReturn => {
        const getCurrentSelection = (selection: Selection | null) => {
            if (selection !== null) {
                if (selection.anchorNode !== null) {
                    if (selection.anchorNode.parentNode !== null) {
                        return selection?.anchorNode?.parentNode
                    }
                }
            }
        }
        const returnArray: selectorReturn = []
        const documentHTML = editorText.HTMLElements
        const currentSelectEl = getCurrentSelection(document.getSelection())
        for (let i = 0; i < documentHTML.length; i++) {
            const HTMLToCheck = editorText.HTMLElements[i]
            if (HTMLToCheck && currentSelectEl) {
                if (HTMLToCheck.firstElementChild) {
                    if (currentSelectEl?.isEqualNode(HTMLToCheck.firstElementChild)) {
                        returnArray.push({ el: HTMLToCheck, state: "selected", index: i })
                    } else {
                        returnArray.push({ el: HTMLToCheck, state: "not selected", index: i })
                    }
                } else {
                    if (currentSelectEl.isEqualNode(HTMLToCheck)) {
                        returnArray.push({ el: HTMLToCheck, state: "selected", index: i })
                    } else {
                        returnArray.push({ el: HTMLToCheck, state: "not selected", index: i })
                    }
                }
            }
        }
        return returnArray
    }
    const TextEditorWrapped = (props: any) => {
        const c = children(() => props.children)


        return (
            <article
                onclick={eventHandler}
                contentEditable={true}
                class="prose prose-sm  dark:prose-invert  prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600 h-full w-full">
                {c()}
            </article>
        )
    }
    const LineInEditor = (props: any) => {
        if (props.props.line.tagName === undefined) {
            return
        }
        return (
            props.props.line)
    }

    return (
        <>
            <TextEditorWrapped >
                <For each={editorText.HTMLElements}>{(line) =>
                    <LineInEditor props={{ line: line }} />
                }
                </For>
            </TextEditorWrapped>
        </>
    )
}
