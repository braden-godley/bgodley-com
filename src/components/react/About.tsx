import { useCallback, useState } from "react";
import type { BufferDispatch, BufferState, RenderFunction } from "./Terminal";
import Terminal, { centeredLines, centeredText, paragraph, useCursor } from "./Terminal";

const BUTTONS = [
    { id: "portfolio", label: "See my Portfolio", href: "/portfolio" },
    { id: "back", label: "Back", href: "/" },
];

const About = () => {
    const { cursor, next, prev } = useCursor(BUTTONS.map(button => button.id));

    const render: RenderFunction = useCallback((bufferState) => {
        const lines = [
            centeredText("ABOUT", bufferState.dim.chars),
            "",
            ...paragraph("I'm Braden Godley, a software engineer based in Portland, OR. Focused primarily on full stack development, but I'm also interested in cybersecurity and DevOps.", bufferState.dim.chars),
            "",
            ...paragraph("If you're interested in seeing some of my work, check out my portfolio", bufferState.dim.chars),
            "",

            ...BUTTONS.map(button => {
                return (cursor === button.id ? '> ' : '') + button.label
            }).map(button => centeredText(button, bufferState.dim.chars))
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

export default About;
