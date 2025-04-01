import { useCallback, useState } from "react";
import type { RenderFunction } from "./Terminal";
import Terminal, { centeredLines, centeredText, paragraph, sectionHead } from "./Terminal";

type Project = {
    title: string,
    description: string,
    href: string,
};

const PROJECTS: Array<Project> = [
    {
        title: "NoticeFlow",
        description: `NoticeFlow is an open-source and free web application designed to help universities and other organizations handle DMCA complaints.
I designed NoticeFlow because I didn’t want to maintain our Perl based in-house solution to handling DMCA notices. I hope that this application can provide an alternative to in-house solutions for this problem.`,
        href: "https://noticeflow.com",
    },
];

const Portfolio = () => {
    const [cursor, setCursor] = useState(0);

    const render: RenderFunction = useCallback((dimensions) => {
        let lines = [
            centeredText("PORTFOLIO", dimensions.chars),
            "",
        ];

        for (let i = 0; i < PROJECTS.length; i++) {
            const project = PROJECTS[i];
            lines = lines.concat([
                sectionHead(project.title.toUpperCase(), dimensions.chars),
                "",
                ...paragraph(project.description, dimensions.chars),
                "",
                centeredText((cursor === i ? "> " : "") + "View project", dimensions.chars),
            ]);
        }

        lines = lines.concat([
            "",
            centeredText((cursor === PROJECTS.length ? "> " : "") + "Back", dimensions.chars),
        ]);

        return centeredLines(lines, dimensions.lines);
    }, [cursor]);

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'k') {
            setCursor((cursor) => (cursor - 1 + PROJECTS.length + 1) % (PROJECTS.length + 1));
        } else if (e.key === 'j') {
            setCursor((cursor) => (cursor + 1 + PROJECTS.length + 1) % (PROJECTS.length + 1));
        } else if (e.key === 'Enter') {
            if (cursor < PROJECTS.length) {
                window.location.href = PROJECTS[cursor].href;
            } else {
                window.location.href = "/";
            }
        }
    }, [cursor]);

    return <Terminal render={render} onKeyDown={onKeyDown} />
};

export default Portfolio;
