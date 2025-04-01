import React, { useEffect, useMemo, useRef, useState, type KeyboardEventHandler } from "react";

const LINE_HEIGHT = 22;

export type RenderFunction = (dimensions: Dimensions) => string[];

export type Dimensions = {
    lines: number,
    chars: number,
};

const Terminal: React.FC<{ render: RenderFunction, onKeyDown: (e: KeyboardEvent) => void }> = ({ render, onKeyDown }) => {
    const [dimensions, setDimensions] = useState<Dimensions>({ lines: 60, chars: 150 });
    const [charWidth, setCharWidth] = useState(11);

    useEffect(() => {
        setCharWidth(getCharWidth());
        const body = document.body
        const resizeListener = () => {
            const box = body.getBoundingClientRect();
            const lines = Math.floor(box.height / LINE_HEIGHT);
            const chars = Math.floor(box.width / charWidth);
            setDimensions({ lines, chars });
        };
        window.addEventListener("resize", resizeListener);
        resizeListener();
        return () => {
            window.removeEventListener("resize", resizeListener)
        }
    }, [])

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onKeyDown]);

    const lines = useMemo(() => {
        const dims = {
            lines: dimensions.lines,
            chars: dimensions.chars - 1,
        };
        return render(dims).map(line => "~" + line);
    }, [dimensions, render])

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
    let line = "";

    const offset = Math.floor(numChars / 2 - text.length / 2);
    for (let i = 0; i < numChars; i++) {
        const char = text[i - offset] ?? ' ';
        line += char;
    }

    return line;
}

export const centeredLines = (lines: string[], numLines: number): string[] => {
    let out: string[] = [];
    const offset = Math.floor(numLines / 2 - lines.length / 2);
    for (let i = 0; i < numLines; i++) {
        const line = lines[i - offset] ?? '';
        out.push(line);
    }
    return out;
}

