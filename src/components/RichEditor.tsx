"use client";
import { useRef, useEffect, useState } from "react";
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Palette } from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function isHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

function plainToHtml(text: string): string {
  if (!text) return "";
  return text
    .split("\n")
    .map((line) => `<p>${line.trim() || "<br>"}</p>`)
    .join("");
}

const EMPTY_PATTERNS = ["", "<br>", "<p><br></p>", "<div><br></div>"];

export default function RichEditor({ value, onChange, placeholder = "내용을 입력하세요", minHeight = 280 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const colorRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const html = isHtml(value) ? value : plainToHtml(value);
    editorRef.current.innerHTML = html;
    setIsEmpty(!value);
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val ?? undefined);
    editorRef.current?.focus();
    isInternalChange.current = true;
    const html = editorRef.current?.innerHTML || "";
    onChange(html);
    setIsEmpty(EMPTY_PATTERNS.includes(html));
  };

  const handleInput = () => {
    isInternalChange.current = true;
    const html = editorRef.current?.innerHTML || "";
    onChange(html);
    setIsEmpty(EMPTY_PATTERNS.includes(html));
  };

  const Btn = ({
    cmd, val, title, children,
  }: { cmd: string; val?: string; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition"
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#8B1A2B] transition">
      {/* 툴바 */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">
        <select
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => exec("formatBlock", e.target.value)}
          defaultValue="p"
          className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-700 h-7 mr-0.5"
        >
          <option value="p">본문</option>
          <option value="h1">제목1</option>
          <option value="h2">제목2</option>
          <option value="h3">소제목</option>
        </select>

        <Sep />

        <Btn cmd="bold" title="굵게 (Ctrl+B)"><Bold size={13} /></Btn>
        <Btn cmd="italic" title="기울임 (Ctrl+I)"><Italic size={13} /></Btn>
        <Btn cmd="underline" title="밑줄 (Ctrl+U)"><Underline size={13} /></Btn>
        <Btn cmd="strikeThrough" title="취소선"><Strikethrough size={13} /></Btn>

        <Sep />

        <Btn cmd="justifyLeft" title="왼쪽 정렬"><AlignLeft size={13} /></Btn>
        <Btn cmd="justifyCenter" title="가운데 정렬"><AlignCenter size={13} /></Btn>
        <Btn cmd="justifyRight" title="오른쪽 정렬"><AlignRight size={13} /></Btn>

        <Sep />

        <Btn cmd="insertUnorderedList" title="글머리 기호"><List size={13} /></Btn>
        <Btn cmd="insertOrderedList" title="번호 목록"><ListOrdered size={13} /></Btn>

        <Sep />

        <select
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => exec("fontSize", e.target.value)}
          defaultValue=""
          className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-700 h-7"
        >
          <option value="" disabled>크기</option>
          <option value="1">아주 작게</option>
          <option value="2">작게</option>
          <option value="3">보통</option>
          <option value="4">크게</option>
          <option value="5">더 크게</option>
          <option value="6">제목 크기</option>
        </select>

        <Sep />

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); colorRef.current?.click(); }}
          title="글자 색상"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition relative"
        >
          <Palette size={13} />
          <input
            ref={colorRef}
            type="color"
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            onChange={(e) => exec("foreColor", e.target.value)}
          />
        </button>
      </div>

      {/* 에디터 */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{ minHeight }}
          className="rich-editor px-3 py-2.5 text-sm outline-none leading-relaxed"
        />
        {isEmpty && (
          <div className="absolute top-2.5 left-3 text-sm text-gray-400 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
