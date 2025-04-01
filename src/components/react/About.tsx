import { useCallback, useState } from "react";
import type { RenderFunction } from "./Terminal";
import Terminal, { centeredLines, centeredText, paragraph } from "./Terminal";

const BUTTONS = [
    { label: "See my Portfolio", href: "/portfolio" },
    { label: "Back", href: "/" },
];

const About = () => {
    const [cursor, setCursor] = useState(0);

    const render: RenderFunction = useCallback((dimensions) => {
        const lines = [
            centeredText("ABOUT", dimensions.chars),
            "",
            ...paragraph("I'm Braden Godley, a software engineer based in Portland, OR. Focused primarily on full stack development, but I'm also interested in cybersecurity and DevOps.", dimensions.chars),
            "",
            ...paragraph("If you're interested in seeing some of my work, check out my portfolio", dimensions.chars),
            "",

            ...BUTTONS.map((button, i) => {
                return (cursor === i ? '> ' : '') + button.label
            }).map(button => centeredText(button, dimensions.chars))
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

export default About;
