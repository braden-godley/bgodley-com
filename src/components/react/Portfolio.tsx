import { useCallback, useState } from "react";
import type { BufferDispatch, BufferState, RenderFunction } from "./Terminal";
import Terminal, { centeredText, paragraph, sectionHead, useCursor } from "./Terminal";

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
    {
        id: "secret-exchange",
        title: "WebStrata Secret Exchange",
        description: `I had the pleasure of designing and coding a web application for WebStrata Internet Services that allows them to securely exchange secrets and credentials with web hosting clients.`,
        href: "https://secret.webstrata.com/",
    },
    {
        id: "adventure-chat",
        title: "Adventure Chat",
        description: `Adventure Chat is a next-generation choose your own adventure game that uses ChatGPT to create unique stories.
You choose a character to play as and the chatbot will generate a scenario for you to take part in. The story evolves as you take actions, allowing for a unique experience every time.
Behind the scenes, the application uses ChatGPT not only for generating the story, but also for validating and categorizing user inputs`,
        href: "https://adventurechat.app/",
    },
    {
        id: "fredericksburg-bbq",
        title: "Fredericksburg BBQ Cleaning",
        description: `Created a professional business website for a fictional BBQ cleaning business in Fredericksburg. The website is built using Next.js and follows responsive web design principles.`,
        href: "https://fredericksburg-bbq.vercel.app/",
    },
];

const OPTIONS = [
    ...PROJECTS.map(project => project.id),
    "back",
];

const Portfolio = () => {
    const { cursor, next, prev } = useCursor(OPTIONS);

    const render: RenderFunction = useCallback((bufferState) => {
        let lines = [
            "",
            centeredText("PORTFOLIO", bufferState.dim.chars),
            "",
        ];

        const optionsByLine: Record<string, number> = {};

        for (let i = 0; i < PROJECTS.length; i++) {
            const project = PROJECTS[i];
            lines = lines.concat([
                sectionHead(project.title.toUpperCase(), bufferState.dim.chars),
                "",
                ...paragraph(project.description, bufferState.dim.chars),
                "",
                centeredText((cursor === project.id ? "> " : "") + "View project", bufferState.dim.chars),
                "",
            ]);
            optionsByLine[project.id] = lines.length - 2;
        }

        optionsByLine["back"] = lines.length + 1;
        lines = lines.concat([
            "",
            centeredText((cursor === "back" ? "> " : "") + "Back", bufferState.dim.chars),
            "",
        ]);

        const selectedLine = optionsByLine[cursor];

        console.log(cursor, selectedLine);

        return { lines, selectedLine };
    }, [cursor]);

    const onKeyDown = useCallback((bufferState: BufferState, dispatch: BufferDispatch) => (e: KeyboardEvent) => {
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
