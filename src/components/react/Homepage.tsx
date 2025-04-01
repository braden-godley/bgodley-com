import { useCallback, useState } from "react";
import type { RenderFunction } from "./Terminal";
import Terminal, { centeredLines, centeredText, useCursor } from "./Terminal";

const BUTTONS = [
    { id: "about", label: "About", href: "/about" },
    { id: "portfolio", label: "Portfolio", href: "/portfolio" },
    { id: "configs", label: "Configs", href: "/configs" },
];

const Homepage = () => {
    const { cursor, next, prev } = useCursor(BUTTONS.map(button => button.id));

    const render: RenderFunction = useCallback((dimensions) => {
        const lines = [
            centeredText("Braden Godley", dimensions.chars),
            "",
            centeredText("Welcome to my homepage", dimensions.chars),
            "",

            ...BUTTONS.map((button, i) => {
                return centeredText((cursor === button.id ? '> ' : '') + button.label, dimensions.chars)
            })
        ];
        return centeredLines(lines, dimensions.lines);
    }, [cursor]);

    const onKeyDown = useCallback((e: KeyboardEvent) => {
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
