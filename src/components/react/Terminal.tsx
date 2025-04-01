import React, { useEffect, useMemo, useReducer, useState } from "react";

const LINE_HEIGHT = 22;

export type RenderFunction = (bufferState: BufferState) => {
    lines: string[],
    selectedLine: number | null,
};

export type Dimensions = {
    lines: number,
    chars: number,
};

export type BufferState = {
    dim: Dimensions,
};

type BufferAction = {
    type: "SET_DIM",
    payload: Dimensions,
} | {
    type: "SET_SCROLL",
    payload: number,
};

export type BufferDispatch = (action: BufferAction) => void;

const initialState: BufferState = {
    dim: { lines: 50, chars: 150 },
};

const bufferReducer = (state: BufferState, action: BufferAction): BufferState => {
    if (action.type === "SET_DIM") {
        return {
            ...state,
            dim: action.payload,
        };
    } else {
        return state;
    }
};

const Terminal: React.FC<{
    render: RenderFunction,
    onKeyDown: (bufferState: BufferState, dispatch: BufferDispatch) => (e: KeyboardEvent) => void,
}> = ({ render, onKeyDown }) => {
    const [bufferState, dispatch] = useReducer(bufferReducer, initialState);
    const [charWidth, setCharWidth] = useState(11);

    useEffect(() => {
        setCharWidth(getCharWidth());
        const body = document.body;
        const resizeListener = () => {
            const box = body.getBoundingClientRect();
            const lines = Math.floor(box.height / LINE_HEIGHT) - 1;
            const chars = Math.floor(box.width / charWidth) - 1;
            dispatch({ type: "SET_DIM", payload: { lines, chars } });
        };
        window.addEventListener("resize", resizeListener);
        resizeListener();
        return () => {
            window.removeEventListener("resize", resizeListener);
        };
    }, [])

    useEffect(() => {
        const fn = onKeyDown(bufferState, dispatch);
        window.addEventListener("keydown", fn);
        return () => {
            window.removeEventListener("keydown", fn);
        };
    }, [onKeyDown, bufferState, dispatch]);

    const { lines, selectedLine } = useMemo(() => render(bufferState), [bufferState, render]);

    let scroll = 0;
    if (selectedLine !== null) {
        scroll = Math.max(0, Math.floor(selectedLine - bufferState.dim.lines / 2));
    }

    const { lines: scrolledLines, lineMapper: scrolledLineMapper } = scrollLines(lines, bufferState.dim.lines, scroll);
    const { lines: centeredLines, lineMapper: centeredLineMapper } = centerLines(scrolledLines, bufferState.dim.lines);

    const bufferLines = [
        ...centeredLines,
        centeredText("[navigate using jk and Enter]", bufferState.dim.chars - 1),
    ];

    const lineMapper = (lineNum: number) => centeredLineMapper(scrolledLineMapper(lineNum));

    return (
        <pre style={{ margin: 0, height: "100vh" }}>
            {bufferLines.map((line, i) => (
                <div data-line={i} style={{ height: LINE_HEIGHT }} key={i}>
                    ~<span style={{ color: (selectedLine !== null && i === lineMapper(selectedLine)) ? "#AAAAFF" : undefined }}>{line}</span>
                </div>
            ))}
        </pre>
    )
};

export default Terminal;


const getCharWidth = () => {
    const count = 10_000;
    const span = document.createElement("span");
    span.innerText = "~".repeat(count);
    document.body.appendChild(span);

    const width = span.getBoundingClientRect().width;

    span.remove();

    return width / count;
};

export const centeredText = (text: string, numChars: number): string => {
    const offset = Math.max(0, Math.floor(numChars / 2 - text.length / 2));

    return " ".repeat(offset) + text;
}

export const centerLines = (lines: string[], numLines: number): { lines: string[], lineMapper: (lineNum: number) => number } => {
    if (lines.length >= numLines) return { lines, lineMapper: (x) => x };

    const offset = Math.floor(numLines / 2 - lines.length / 2);
    const lineMapper = (lineNum: number) => lineNum + offset;

    let out: string[] = [];
    for (let i = 0; i < numLines; i++) {
        const line = lines[i - offset] ?? '';
        out.push(line);
    }
    return { lines: out, lineMapper };
}

const SECTION_WIDTH = 80;

export const paragraph = (p: string, numChars: number): string[] => {
    let out: string[] = [];

    p = p.replaceAll("\n", " __NEWLINE__ ")
    const words = p.split(" ");

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if (word === "__NEWLINE__") {
            out.push("");
            continue;
        }

        const currentLine = out[out.length - 1];
        if (currentLine !== undefined && currentLine !== "" && currentLine.length + 1 + word.length < SECTION_WIDTH) {
            out[out.length - 1] += " " + word;
        } else {
            out.push(word);
        }
    }

    const offset = Math.max(0, Math.floor(numChars / 2 - SECTION_WIDTH / 2));

    return out.map(line => " ".repeat(offset) + line);
};

export const sectionHead = (head: string, numChars: number): string => {
    const offset = Math.floor(SECTION_WIDTH / 2 - head.length / 2);

    let text = "";

    for (let i = 0; i < SECTION_WIDTH; i++) {
        if (i < offset - 1) {
            text += "#";
        } else if (i === offset - 1) {
            text += " ";
        } else if (i < offset + head.length) {
            text += head[i - offset];
        } else if (i === offset + head.length) {
            text += " ";
        } else {
            text += "#";
        }
    }

    return centeredText(text, numChars);
};

export const scrollLines = (lines: string[], numLines: number, scroll: number): { lines: string[], lineMapper: (lineNum: number) => number } => {
    const overflow = Math.max(0, lines.length - numLines);
    const actualScroll = Math.min(overflow, scroll);
    return { lines: lines.slice(actualScroll, actualScroll + numLines), lineMapper: (x) => x - actualScroll };
}

export const useCursor = (options: Array<string>) => {
    const [cursor, setCursorRaw] = useState(0);

    const next = () => setCursorRaw((cursor) => (cursor + 1) % options.length);
    const prev = () => setCursorRaw((cursor) => (cursor - 1 + options.length) % options.length);
    const setCursor = (option: string) => setCursorRaw(options.indexOf(option));

    return { cursor: options[cursor], next, prev, setCursor };
}

export const asciiArtText = (text: string, numChars: number): string[] => {
    // ASCII art patterns for each character
    const patterns: { [key: string]: string[] } = {
        'A': [
            '  ██  ',
            ' ████ ',
            '██  ██',
            '██████',
            '██  ██'
        ],
        'B': [
            '█████ ',
            '██  ██',
            '█████ ',
            '██  ██',
            '█████ '
        ],
        'C': [
            ' █████',
            '██    ',
            '██    ',
            '██    ',
            ' █████'
        ],
        'D': [
            '█████ ',
            '██  ██',
            '██  ██',
            '██  ██',
            '█████ '
        ],
        'E': [
            '██████',
            '██    ',
            '████  ',
            '██    ',
            '██████'
        ],
        'F': [
            '██████',
            '██    ',
            '████  ',
            '██    ',
            '██    '
        ],
        'G': [
            ' █████',
            '██    ',
            '██ ███',
            '██  ██',
            ' █████'
        ],
        'H': [
            '██  ██',
            '██  ██',
            '██████',
            '██  ██',
            '██  ██'
        ],
        'I': [
            '██████',
            '  ██  ',
            '  ██  ',
            '  ██  ',
            '██████'
        ],
        'J': [
            '██████',
            '   ██ ',
            '   ██ ',
            '██ ██  ',
            ' ███  '
        ],
        'K': [
            '██  ██',
            '██ ██ ',
            '████  ',
            '██ ██ ',
            '██  ██'
        ],
        'L': [
            '██   ',
            '██   ',
            '██   ',
            '██   ',
            '█████'
        ],
        'M': [
            '██     ███',
            '████  ████',
            '██ ████ ██',
            '██  ██  ██',
            '██      ██'
        ],
        'N': [
            '██   ██',
            '███  ██',
            '████ ██',
            '██ ████',
            '██  ███'
        ],
        'O': [
            ' ████ ',
            '██  ██',
            '██  ██',
            '██  ██',
            ' ████ '
        ],
        'P': [
            '█████ ',
            '██  ██',
            '█████ ',
            '██    ',
            '██    '
        ],
        'Q': [
            ' ████ ',
            '██  ██',
            '██  ██',
            '██ ██ ',
            ' ███ █'
        ],
        'R': [
            '█████ ',
            '██  ██',
            '█████ ',
            '██  ██',
            '██  ██'
        ],
        'S': [
            ' █████',
            '██    ',
            ' ████ ',
            '    ██',
            '█████ '
        ],
        'T': [
            '██████',
            '  ██  ',
            '  ██  ',
            '  ██  ',
            '  ██  '
        ],
        'U': [
            '██  ██',
            '██  ██',
            '██  ██',
            '██  ██',
            ' ████ '
        ],
        'V': [
            '██  ██',
            '██  ██',
            '██  ██',
            ' ████ ',
            '  ██  '
        ],
        'W': [
            '██     ██',
            '██  █  ██',
            '██ ███ ██',
            '█████████',
            ' ██   ██ '
        ],
        'X': [
            '██  ██',
            ' ████ ',
            '  ██  ',
            ' ████ ',
            '██  ██'
        ],
        'Y': [
            '██  ██',
            ' ████ ',
            '  ██  ',
            '  ██  ',
            '  ██  '
        ],
        'Z': [
            '██████',
            '   ██ ',
            '  ██  ',
            ' ██   ',
            '██████'
        ],
        ' ': [
            '   ',
            '   ',
            '   ',
            '   ',
            '   '
        ],
    };

    const chars = text.toUpperCase().split('').map(char => patterns[char]);

    const lines: string[] = [
        "",
        "",
        "",
        "",
        "",
    ];

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        for (let j = 0; j < 5; j++) {
            lines[j] += char[j] + ' ';
        }
    }

    const length = Math.max(...lines.map(line => line.length));
    const offset = Math.max(0, Math.floor(numChars / 2 - length / 2));

    return lines.map(line => " ".repeat(offset) + line);
};
