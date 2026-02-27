import { Node, mergeAttributes, InputRule } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import katex from "katex";
import { useCallback, useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
 *  InlineMath — custom Tiptap node for inline LaTeX rendering
 *  Uses KaTeX for fast, lightweight math rendering.
 *
 *  Usage in editor:
 *    - Type $latex$ to auto-convert  (InputRule)
 *    - Or click the Σ toolbar button
 *    - Click rendered formula to edit the LaTeX source
 * ──────────────────────────────────────────────────────────── */

/** React component for rendering/editing a math node inside Tiptap */
function MathNodeView({ node, updateAttributes, selected }: ReactNodeViewProps) {
    const latexValue = (node.attrs["latex"] as string) ?? "";
    const [isEditing, setIsEditing] = useState(false);
    const [latex, setLatex] = useState(latexValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const renderedRef = useRef<HTMLSpanElement>(null);

    // Render KaTeX into the span
    useEffect(() => {
        if (!isEditing && renderedRef.current) {
            try {
                katex.render(latexValue || "\\text{?}", renderedRef.current, {
                    throwOnError: false,
                    displayMode: false,
                });
            } catch {
                if (renderedRef.current) {
                    renderedRef.current.textContent = latexValue;
                }
            }
        }
    }, [latexValue, isEditing]);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const commitEdit = useCallback(() => {
        const trimmed = latex.trim();
        if (trimmed) {
            updateAttributes({ latex: trimmed });
        }
        setIsEditing(false);
    }, [latex, updateAttributes]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                commitEdit();
            }
            if (e.key === "Escape") {
                setLatex(latexValue);
                setIsEditing(false);
            }
        },
        [commitEdit, latexValue]
    );

    return (
        <NodeViewWrapper as="span" className="inline">
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={latex}
                    onChange={(e) => setLatex(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    className="Tiptap-mathematics-editor"
                    style={{ minWidth: "80px", width: `${Math.max(80, latex.length * 8)}px` }}
                    spellCheck={false}
                />
            ) : (
                <span
                    ref={renderedRef}
                    onClick={() => setIsEditing(true)}
                    className={`Tiptap-mathematics-render Tiptap-mathematics-render--is-editable ${selected ? "Tiptap-mathematics-editor--is-selected" : ""
                        }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setIsEditing(true);
                    }}
                />
            )}
        </NodeViewWrapper>
    );
}

/** The Tiptap Node extension */
export const InlineMath = Node.create({
    name: "inlineMath",
    group: "inline",
    inline: true,
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: "",
                parseHTML: (element: HTMLElement) =>
                    element.getAttribute("data-latex") ?? "",
                renderHTML: (attributes: { latex: string }) => ({
                    "data-latex": attributes.latex,
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-type="inline-math"]' }];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
        return [
            "span",
            mergeAttributes(HTMLAttributes, { "data-type": "inline-math" }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathNodeView);
    },

    addInputRules() {
        return [
            // Type $latex$ to create an inline math node
            new InputRule({
                find: /\$([^$]+)\$$/,
                handler: ({ state, range, match }) => {
                    const latex = match[1];
                    const { tr } = state;
                    if (latex) {
                        const node = this.type.create({ latex });
                        tr.replaceWith(range.from, range.to, node);
                    }
                },
            }),
        ];
    },
});
