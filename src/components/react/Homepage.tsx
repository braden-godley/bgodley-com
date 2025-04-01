import { useCallback, useState } from "react";
import type { BufferDispatch, BufferState, RenderFunction } from "./Terminal";
import Terminal, { centeredLines, centeredText, useCursor } from "./Terminal";

const BUTTONS = [
    { id: "about", label: "About", href: "/about" },
    { id: "portfolio", label: "Portfolio", href: "/portfolio" },
    { id: "configs", label: "Configs", href: "/configs" },
];

const Homepage = () => {
    const { cursor, next, prev } = useCursor(BUTTONS.map(button => button.id));

    const render: RenderFunction = useCallback((bufferState) => {
        const lines = [
            centeredText("Braden Godley", bufferState.dim.chars),
            "",
            centeredText("Welcome to my homepage", bufferState.dim.chars),
            "",

            ...BUTTONS.map(button => {
                return centeredText((cursor === button.id ? '> ' : '') + button.label, bufferState.dim.chars)
            })
        ];
        return centeredLines(lines, bufferState.dim.lines);
    }, [cursor]);

    const onKeyDown = useCallback((_bufferState: BufferState, _dispatch: BufferDispatch) => (e: KeyboardEvent) => {
        if (e.key === 'k') {
            prev();
        } else if (e.key === 'j') {
            next();
        } else if (e.key === 'Enter') {
            const button = BUTTONS.find(button => button.id === cursor);
            if (button) window.location.href = button.href;
        }
    }, [cursor]);

    return <Terminal render={render} onKeyDown={onKeyDown} />
};

export default Homepage;
