import { useCallback, useState } from "react";
import type { RenderFunction } from "./Terminal";
import Terminal, { centeredLines, centeredText, paragraph, sectionHead, useCursor } from "./Terminal";

type Project = {
    id: string,
    title: string,
    description: string,
    href: string,
};

const PROJECTS: Array<Project> = [
    {
        id: "noticeflow",
        title: "NoticeFlow",
        description: `NoticeFlow is an open-source and free web application designed to help universities and other organizations handle DMCA complaints.
I designed NoticeFlow because I didn’t want to maintain our Perl based in-house solution to handling DMCA notices. I hope that this application can provide an alternative to in-house solutions for this problem.`,
        href: "https://noticeflow.com",
    },
];

const OPTIONS = [
    ...PROJECTS.map(project => project.id),
    "back",
];

const Portfolio = () => {
    const { cursor, next, prev } = useCursor(OPTIONS);

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
                centeredText((cursor === project.id ? "> " : "") + "View project", dimensions.chars),
            ]);
        }

        lines = lines.concat([
            "",
            centeredText((cursor === "back" ? "> " : "") + "Back", dimensions.chars),
        ]);

        return centeredLines(lines, dimensions.lines);
    }, [cursor]);

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'k') {
            prev();
        } else if (e.key === 'j') {
            next();
        } else if (e.key === 'Enter') {
            const project = PROJECTS.find(project => project.id === cursor);
            if (project) {
                window.location.href = project.href;
            } else if (cursor === "back") {
                window.location.href = "/";
            }
        }
    }, [cursor]);

    return <Terminal render={render} onKeyDown={onKeyDown} />
};

export default Portfolio;
