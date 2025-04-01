import { useCallback, useEffect, useState } from "react";
import type { RenderFunction } from "./Terminal";
import Terminal, { centeredLines, centeredText } from "./Terminal";

const BUTTONS = [
    { label: "About", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Configs", href: "/configs" },
];

const Homepage = () => {
    const [cursor, setCursor] = useState(0);

    const render: RenderFunction = useCallback((dimensions) => {
        const lines = [
            centeredText("Braden Godley", dimensions.chars),
            "",
            centeredText("Welcome to my homepage", dimensions.chars),
            "",

            ...BUTTONS.map((button, i) => {
                return centeredText((cursor === i ? '> ' : '') + button.label, dimensions.chars);
            })
        ];
        return centeredLines(lines, dimensions.lines);
    }, [cursor]);

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'k') {
            setCursor((cursor) => Math.max(0, cursor - 1));
        } else if (e.key === 'j') {
            setCursor((cursor) => Math.min(BUTTONS.length - 1, cursor + 1));
        } else if (e.key === 'Enter') {
            window.location.href = BUTTONS[cursor].href;
        }
    }, [cursor]);

    return <Terminal render={render} onKeyDown={onKeyDown} />
};

export default Homepage;
