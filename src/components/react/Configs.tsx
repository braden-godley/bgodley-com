import { useCallback } from "react";
import type { BufferDispatch, BufferState, RenderFunction } from "./Terminal";
import Terminal, { asciiArtText, centeredText, paragraph, sectionHead, useCursor } from "./Terminal";

const BUTTONS = [
    {
        id: "neovim",
        label: "Neovim config",
        href: "https://github.com/braden-godley/neovim-config",
    },
    {
        id: "tmux",
        label: "Tmux config",
        href: "https://github.com/braden-godley/dotfiles/blob/main/.tmux.conf",
    },
    {
        id: "vimrc",
        label: ".vimrc",
        href: "https://github.com/braden-godley/dotfiles/blob/main/.vimrc",
    },
    {
        id: "alacritty",
        label: "alacritty config",
        href: "https://github.com/braden-godley/dotfiles/blob/main/alacritty.toml",
    },
    {
        id: "cursor-settings",
        label: "Cursor settings",
        href: "https://github.com/braden-godley/dotfiles/blob/main/cursor-settings.json",
    },
    {
        id: "back",
        label: "Back",
        href: "/"
    },
];

const OPTIONS = BUTTONS.map(button => button.id);

const Configs = () => {
    const { cursor, next, prev } = useCursor(OPTIONS);
    const render: RenderFunction = useCallback((bufferState) => {
        let lines = [
            ...asciiArtText("Configs", bufferState.dim.chars),
            "",
            ...paragraph("My configurations and dotfiles", bufferState.dim.chars),
            "",
        ];

        const optionsByLine: Record<string, number> = {};
        for (let i = 0; i < BUTTONS.length; i++) {
            const button = BUTTONS[i];
            if (button.id === "back") lines.push("");
            optionsByLine[button.id] = lines.length;
            lines.push(centeredText(`${button.id === cursor ? "> " : " "} ${button.label}`, bufferState.dim.chars));
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
            if (!button) return;
            if (button.id !== "back") {
                window.open(button.href, '_blank');
            } else {
                window.location.href = button.href;
            }
        }
    }, [cursor]);

    return <Terminal render={render} onKeyDown={onKeyDown} />;
};

export default Configs; 
