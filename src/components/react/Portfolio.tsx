import { useCallback } from "react";
import type { BufferDispatch, BufferState, RenderFunction } from "./Terminal";
import Terminal, { asciiArtText, centeredText, paragraph, sectionHead, useCursor } from "./Terminal";

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
        id: "hop-on-bro",
        title: "Hop On, Bro",
        description: `A website that allows you to generate funny AI messages to plead for your friends to join your game. Allows you to use many different styles (Mark Twain, Alpha Male Influencer, Marketing Email, etc.) and tones (Jealous, Flirty, Guilt Trippy, etc.)`,
        href: "https://hop-on-bro.vercel.app/",
    },
    {
        id: "equation-crypt",
        title: "Equation Crypt",
        description: `Encrypt/decrypt a string using a custom float equation!`,
        href: "https://github.com/braden-godley/equation-crypt",
    },
    {
        id: "fastdict",
        title: "FastDict",
        description: "A very fast dictionary made with Laravel. Lets you look up words without having to click around a bunch and get pulled out of your flow.",
        href: "https://fastdict.bgodley.com/",
    },
    {
        id: "thebestcolorever",
        title: "The Best Color Ever",
        description: "A website that crowdsources votes by comparing two colors. Eventually, the leaderboard will converge on the best color ever.",
        href: "https://thebestcolorever.com/",
    },
    {
        id: "rustis",
        title: "Rustis",
        description: "Rustis is a Rust-based implementation of a subset of Redis's functionality. It provides an executable that can be used to start a server or issue commands to a server as a client.",
        href: "https://github.com/braden-godley/rustis",
    },
    {
        id: "illugens",
        title: "Illugens",
        description: `IlluGens is a website that allows users to generate Stable Diffusion images that have an illusion baked into them. Users can place text or images in a canvas which is then used as a "stencil" for the illusion that is generated.`,
        href: "https://github.com/braden-godley/illugens",
    }
];

const OPTIONS = [
    ...PROJECTS.map(project => project.id),
    "back",
];

const Portfolio = () => {
    const { cursor, next, prev } = useCursor(OPTIONS);

    const render: RenderFunction = useCallback((bufferState) => {
        let lines = [
            ...asciiArtText("PORTFOLIO", bufferState.dim.chars),
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
                "",
                "",
            ]);
            optionsByLine[project.id] = lines.length - 4;
        }

        optionsByLine["back"] = lines.length + 1;
        lines = lines.concat([
            "",
            centeredText((cursor === "back" ? "> " : "") + "Back", bufferState.dim.chars),
            "",
        ]);

        const selectedLine = optionsByLine[cursor];

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
                window.open(project.href, '_blank');
            } else if (cursor === "back") {
                window.location.href = "/";
            }
        }
    }, [cursor]);

    return <Terminal render={render} onKeyDown={onKeyDown} />
};

export default Portfolio;
