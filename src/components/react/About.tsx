import { useCallback, useState } from "react";
import type { RenderFunction } from "./Terminal";
import Terminal, { centeredLines, centeredText, paragraph, useCursor } from "./Terminal";

const BUTTONS = [
    { id: "portfolio", label: "See my Portfolio", href: "/portfolio" },
    { id: "back", label: "Back", href: "/" },
];

const About = () => {
    const { cursor, next, prev } = useCursor(BUTTONS.map(button => button.id));

    const render: RenderFunction = useCallback((dimensions) => {
        const lines = [
            centeredText("ABOUT", dimensions.chars),
            "",
            ...paragraph("I'm Braden Godley, a software engineer based in Portland, OR. Focused primarily on full stack development, but I'm also interested in cybersecurity and DevOps.", dimensions.chars),
            "",
            ...paragraph("If you're interested in seeing some of my work, check out my portfolio", dimensions.chars),
            "",

            ...BUTTONS.map((button, i) => {
                return (cursor === button.id ? '> ' : '') + button.label
            }).map(button => centeredText(button, dimensions.chars))
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

export default About;
