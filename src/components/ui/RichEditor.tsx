"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

export interface RichEditorHandle {
  getHTML: () => string;
  setHTML: (html: string) => void;
  focus: () => void;
}

interface Props {
  placeholder?: string;
  defaultValue?: string;
  minHeight?: number;
  onChange?: (html: string) => void;
}

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"];
const SIZES = [{ label: "8pt", val: "1" }, { label: "10pt", val: "2" }, { label: "12pt", val: "3" }, { label: "14pt", val: "4" }, { label: "18pt", val: "5" }, { label: "24pt", val: "6" }, { label: "36pt", val: "7" }];
const EMOJIS = ["😊", "👍", "✅", "⭐", "🔥", "💡", "🏠", "🔧", "📦", "🎯", "💎", "🚀", "⚡", "🌟", "❤️", "✨"];

const RichEditor = forwardRef<RichEditorHandle, Props>(function RichEditor(
  { placeholder = "Start writing here…", defaultValue = "", minHeight = 220, onChange },
  ref
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const showEmojiRef = useRef(false);

  useImperativeHandle(ref, () => ({
    getHTML: () => editorRef.current?.innerHTML ?? "",
    setHTML: (html) => { if (editorRef.current) editorRef.current.innerHTML = html; },
    focus: () => editorRef.current?.focus(),
  }));

  useEffect(() => {
    if (editorRef.current && defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
  }, []);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    onChange?.(editorRef.current?.innerHTML ?? "");
  };

  const btn = (
    content: React.ReactNode,
    cmd: string,
    val?: string,
    title?: string,
    extraStyle?: React.CSSProperties
  ) => (
    <button
      key={`${cmd}-${val ?? ""}`}
      type="button"
      title={title ?? cmd}
      onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}
      style={{
        minWidth: 30, height: 28, padding: "0 5px",
        border: "1px solid #d1d5db", background: "#fff",
        borderRadius: 4, cursor: "pointer", fontSize: 12,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#1f2937", ...extraStyle,
      }}
    >
      {content}
    </button>
  );

  const divider = () => (
    <span style={{ width: 1, height: 20, background: "#e5e7eb", margin: "0 3px", display: "inline-block" }} />
  );

  const insertLink = () => {
    const url = prompt("Enter link URL:");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  };

  const insertTable = () => {
    const html = `<table border="1" style="border-collapse:collapse;width:100%;margin:8px 0"><tr><td style="padding:6px;border:1px solid #d1d5db">&nbsp;</td><td style="padding:6px;border:1px solid #d1d5db">&nbsp;</td><td style="padding:6px;border:1px solid #d1d5db">&nbsp;</td></tr><tr><td style="padding:6px;border:1px solid #d1d5db">&nbsp;</td><td style="padding:6px;border:1px solid #d1d5db">&nbsp;</td><td style="padding:6px;border:1px solid #d1d5db">&nbsp;</td></tr></table>`;
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    onChange?.(editorRef.current?.innerHTML ?? "");
  };

  const toggleEmoji = () => {
    showEmojiRef.current = !showEmojiRef.current;
    if (emojiRef.current) {
      emojiRef.current.style.display = showEmojiRef.current ? "flex" : "none";
    }
  };

  const insertEmoji = (em: string) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, em);
    onChange?.(editorRef.current?.innerHTML ?? "");
    showEmojiRef.current = false;
    if (emojiRef.current) emojiRef.current.style.display = "none";
  };

  const selectAll = () => { editorRef.current?.focus(); document.execCommand("selectAll"); };
  const clearAll = () => { if (editorRef.current) { editorRef.current.innerHTML = ""; onChange?.(""); } };

  const toolbarRow: React.CSSProperties = {
    display: "flex", flexWrap: "wrap", alignItems: "center",
    gap: 3, padding: "5px 8px",
    borderBottom: "1px solid #e5e7eb", background: "#f9fafb",
  };

  return (
    <div style={{ border: "2px solid #ffc800", borderRadius: 8, overflow: "hidden", background: "#fff" }}>

      {/* ── Row 1: History | Format | Font | Color ── */}
      <div style={toolbarRow}>
        {btn("↶", "undo", undefined, "Undo")}
        {btn("↷", "redo", undefined, "Redo")}
        {divider()}
        {btn(<strong>B</strong>, "bold", undefined, "Bold")}
        {btn(<em>I</em>, "italic", undefined, "Italic")}
        {btn(<span style={{ textDecoration: "underline" }}>U</span>, "underline", undefined, "Underline")}
        {btn(<span style={{ textDecoration: "line-through" }}>S</span>, "strikeThrough", undefined, "Strikethrough")}
        {divider()}
        {/* Font Family */}
        <select
          title="Font Family"
          defaultValue="Arial"
          onChange={e => exec("fontName", e.target.value)}
          style={{ height: 28, fontSize: 12, border: "1px solid #d1d5db", borderRadius: 4, padding: "0 4px", background: "#fff", color: "#1f2937" }}
        >
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        {/* Font Size */}
        <select
          title="Font Size"
          defaultValue="3"
          onChange={e => exec("fontSize", e.target.value)}
          style={{ height: 28, fontSize: 12, border: "1px solid #d1d5db", borderRadius: 4, padding: "0 4px", background: "#fff", color: "#1f2937" }}
        >
          {SIZES.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
        </select>
        {divider()}
        {/* Text Color */}
        <label title="Text Color" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
          <div style={{ width: 24, height: 24, border: "1px solid #d1d5db", borderRadius: 4, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>A</span>
          </div>
          <input type="color" style={{ display: "none" }} onChange={e => exec("foreColor", e.target.value)} />
        </label>
        {/* Highlight */}
        <label title="Highlight Color" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
          <div style={{ width: 24, height: 24, border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12 }}>A</span>
          </div>
          <input type="color" style={{ display: "none" }} onChange={e => exec("hiliteColor", e.target.value)} />
        </label>
        {/* Format painter (clear format) */}
        {btn("🖌", "removeFormat", undefined, "Clear Formatting", { background: "#17a2b8", color: "#fff", border: "none" })}
      </div>

      {/* ── Row 2: Alignment | Lists | Indent | Quote ── */}
      <div style={toolbarRow}>
        {btn("≡L", "justifyLeft", undefined, "Align Left")}
        {btn("≡C", "justifyCenter", undefined, "Center")}
        {btn("≡R", "justifyRight", undefined, "Align Right")}
        {btn("≡J", "justifyFull", undefined, "Justify")}
        {divider()}
        {btn("•", "insertUnorderedList", undefined, "Bullet List")}
        {btn("1.", "insertOrderedList", undefined, "Numbered List")}
        {btn("⬅", "outdent", undefined, "Outdent")}
        {btn("➡", "indent", undefined, "Indent")}
        {divider()}
        {btn("❝", "formatBlock", "blockquote", "Blockquote")}
        {btn("</>", "formatBlock", "pre", "Code Block")}
        {btn("X₂", "subscript", undefined, "Subscript")}
        {btn("X²", "superscript", undefined, "Superscript")}
      </div>

      {/* ── Row 3: Insert tools ── */}
      <div style={{ ...toolbarRow, position: "relative" }}>
        <button
          type="button" title="Insert Link"
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
          style={{ minWidth: 30, height: 28, padding: "0 5px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1f2937" }}
        >🔗</button>
        <button
          type="button" title="Insert Image URL"
          onMouseDown={(e) => { e.preventDefault(); insertImage(); }}
          style={{ minWidth: 30, height: 28, padding: "0 5px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1f2937" }}
        >🖼</button>
        <label
          title="Upload & Insert Image"
          style={{ minWidth: 30, height: 28, padding: "0 5px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1f2937" }}
        >
          📁
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => {
              editorRef.current?.focus();
              document.execCommand("insertHTML", false, `<img src="${reader.result}" style="max-width:100%;height:auto;margin:4px 0;border-radius:4px" />`);
              onChange?.(editorRef.current?.innerHTML ?? "");
            };
            reader.readAsDataURL(file);
          }} />
        </label>
        <button
          type="button" title="Insert Table"
          onMouseDown={(e) => { e.preventDefault(); insertTable(); }}
          style={{ minWidth: 30, height: 28, padding: "0 5px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1f2937" }}
        >⊞</button>
        {btn("—", "insertHorizontalRule", undefined, "Horizontal Rule")}
        {divider()}
        {/* Emoji picker */}
        <div style={{ position: "relative" }}>
          <button
            type="button" title="Insert Emoji"
            onMouseDown={(e) => { e.preventDefault(); toggleEmoji(); }}
            style={{ minWidth: 30, height: 28, padding: "0 5px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 15, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >😊</button>
          <div
            ref={emojiRef}
            style={{
              display: "none", position: "absolute", bottom: "110%", left: 0,
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
              padding: 8, zIndex: 100, flexWrap: "wrap", gap: 4, width: 200,
              boxShadow: "0 4px 16px rgba(0,0,0,.12)",
            }}
          >
            {EMOJIS.map(em => (
              <button
                key={em} type="button"
                onMouseDown={(e) => { e.preventDefault(); insertEmoji(em); }}
                style={{ fontSize: 18, background: "none", border: "none", cursor: "pointer", borderRadius: 4, padding: 2 }}
              >{em}</button>
            ))}
          </div>
        </div>
        {divider()}
        <button
          type="button" title="Select All"
          onMouseDown={(e) => { e.preventDefault(); selectAll(); }}
          style={{ height: 28, padding: "0 10px", border: "1px solid #d1d5db", background: "#f3f4f6", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "#374151", fontWeight: 500 }}
        >Select All</button>
        <button
          type="button" title="Clear Content"
          onMouseDown={(e) => { e.preventDefault(); clearAll(); }}
          style={{ height: 28, padding: "0 10px", border: "1px solid #d1d5db", background: "#f3f4f6", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "#374151", fontWeight: 500 }}
        >Clear</button>
      </div>

      {/* ── Editable Area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => onChange?.(editorRef.current?.innerHTML ?? "")}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "b") { e.preventDefault(); exec("bold"); }
          if (e.ctrlKey && e.key === "i") { e.preventDefault(); exec("italic"); }
          if (e.ctrlKey && e.key === "u") { e.preventDefault(); exec("underline"); }
        }}
        style={{
          minHeight, padding: "12px 14px", outline: "none",
          fontSize: 14, lineHeight: 1.7, color: "#111",
          background: "#fff",
        }}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] table { width:100%; border-collapse:collapse; margin:8px 0; }
        [contenteditable] td, [contenteditable] th { padding:6px; border:1px solid #d1d5db; }
        [contenteditable] blockquote { border-left:3px solid #ffc800; margin:8px 0; padding:6px 12px; background:#fffdf0; color:#555; }
        [contenteditable] pre { background:#1e293b; color:#f8f8f2; padding:10px 14px; border-radius:6px; font-family:monospace; white-space:pre-wrap; }
        [contenteditable] a { color:#2563eb; text-decoration:underline; }
        [contenteditable] img { max-width:100%; border-radius:4px; }
        [contenteditable] hr { border:none; border-top:2px solid #e5e7eb; margin:12px 0; }
      `}</style>
    </div>
  );
});

export default RichEditor;
