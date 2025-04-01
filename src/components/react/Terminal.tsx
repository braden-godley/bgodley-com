import React, { useEffect, useMemo, useReducer, useState } from "react";

const LINE_HEIGHT = 22;

export type RenderFunction = (bufferState: BufferState) => string[];

export type Dimensions = {
    lines: number,
    chars: number,
};

export type BufferState = {
    dim: Dimensions,
    scroll: number,
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
    dim: { lines: 60, chars: 150 },
    scroll: 0,
};

const bufferReducer = (state: BufferState, action: BufferAction): BufferState => {
    if (action.type === "SET_DIM") {
        return {
            ...state,
            scroll: Math.max(0, Math.min(action.payload.lines, state.scroll)),
            dim: action.payload,
        };
    } else if (action.type === "SET_SCROLL") {
        return {
            ...state,
            scroll: Math.max(0, Math.min(state.dim.lines, action.payload)),
        };
    } else {
        return state;
    }
};

const Terminal: React.FC<{ render: RenderFunction, onKeyDown: (bufferState: BufferState, dispatch: BufferDispatch) => (e: KeyboardEvent) => void }> = ({ render, onKeyDown }) => {
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

    const renderedLines = useMemo(() => render(bufferState).map(line => "~" + line), [bufferState, render]);

    const lines = [
        ...scrollLines(renderedLines, bufferState.dim.lines, bufferState.scroll),
        "~" + centeredText("[navigate using jk and Enter]", bufferState.dim.chars - 1),
    ];

    return (
        <pre style={{ margin: 0, height: "100vh" }}>
            {lines.map((line, i) => <div style={{ height: LINE_HEIGHT }} key={i}>{line}</div>)}
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

export const centeredLines = (lines: string[], numLines: number): string[] => {
    if (lines.length >= numLines) return lines;

    let out: string[] = [];
    const offset = Math.floor(numLines / 2 - lines.length / 2);
    for (let i = 0; i < numLines; i++) {
        const line = lines[i - offset] ?? '';
        out.push(line);
    }
    return out;
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

export const scrollLines = (lines: string[], numLines: number, scroll: number): string[] => {
    const overflow = Math.max(0, lines.length - numLines);
    const actualScroll = Math.min(overflow, scroll);
    return lines.slice(actualScroll, actualScroll + numLines);
}

export const useCursor = (options: Array<string>) => {
    const [cursor, setCursorRaw] = useState(0);

    const next = () => setCursorRaw((cursor) => (cursor + 1) % options.length);
    const prev = () => setCursorRaw((cursor) => (cursor - 1 + options.length) % options.length);
    const setCursor = (option: string) => setCursorRaw(options.indexOf(option));

    return { cursor: options[cursor], next, prev, setCursor };
}
