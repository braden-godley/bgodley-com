import { useCallback, useState } from "react";
import type { BufferDispatch, BufferState, RenderFunction } from "./Terminal";
import Terminal, { asciiArtText, centeredText, useCursor } from "./Terminal";

const BUTTONS = [
    { id: "about", label: "About", href: "/about" },
    { id: "portfolio", label: "Portfolio", href: "/portfolio" },
    { id: "configs", label: "Configs", href: "/configs" },
];

const OPTIONS = BUTTONS.map(button => button.id);

const Homepage = () => {
    const { cursor, next, prev } = useCursor(OPTIONS);

    const render: RenderFunction = useCallback((bufferState) => {
        let lines = [
            ...asciiArtText("Braden Godley", bufferState.dim.chars),
            "",
            centeredText("", bufferState.dim.chars),
            "",
        ];

        const optionsByLine: Record<string, number> = {};

        for (let i = 0; i < BUTTONS.length; i++) {
            const button = BUTTONS[i];
            optionsByLine[button.id] = lines.length;
            lines.push(centeredText((cursor === button.id ? '> ' : '') + button.label, bufferState.dim.chars))
        }

        return { lines, selectedLine: optionsByLine[cursor] };
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
