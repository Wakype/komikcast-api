/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

// Helper function to recursively determine the type of the value for the copy button
export const getTypeTemplate = (
  value: any,
  indentLevel: number = 1,
): string => {
  const indent = "  ".repeat(indentLevel);
  const closingIndent = "  ".repeat(indentLevel - 1);

  if (value === null) return "null";

  if (Array.isArray(value)) {
    if (value.length > 0) {
      const elementType = getTypeTemplate(value[0], indentLevel);
      return `${elementType}[]`;
    }
    return "any[]";
  }

  if (typeof value === "object") {
    let result = "{\n";
    for (const key in value) {
      if (Object.hasOwn(value, key)) {
        const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
          ? key
          : `"${key}"`;
        result += `${indent}${formattedKey}: ${getTypeTemplate(
          value[key],
          indentLevel + 1,
        )},\n`;
      }
    }
    result += `${closingIndent}}`;
    return result;
  }

  return typeof value;
};

interface CollapsibleTemplateProps {
  data: any;
  /** When true, renders inline (no leading newline). Used for values after "key:" */
  inline?: boolean;
}

export const CollapsibleTemplate: React.FC<CollapsibleTemplateProps> = ({
  data,
  inline = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // ── Primitives ──────────────────────────────────────────────────────────────
  if (data === null) return <span className="text-emerald-400">null</span>;

  if (!Array.isArray(data) && typeof data !== "object") {
    return <span className="text-emerald-400">{typeof data}</span>;
  }

  // ── Array ───────────────────────────────────────────────────────────────────
  if (Array.isArray(data)) {
    // Empty array
    if (data.length === 0) {
      return <span className="text-emerald-400">any[]</span>;
    }

    // Primitive array (string[], number[], etc.)
    if (typeof data[0] !== "object" || data[0] === null) {
      return (
        <span>
          <CollapsibleTemplate data={data[0]} />
          <span className="text-zinc-500">[]</span>
        </span>
      );
    }

    // Object array → Array<{...}>
    return (
      // block so that ">" lands on its own line after the closing "}"
      <span className="block">
        {/* First line: ▼ Array< */}
        <span className="inline-flex items-center gap-0.5">
          <button
            onClick={toggleCollapse}
            className="cursor-pointer text-zinc-500 hover:text-zinc-300 select-none text-[10px] inline-flex items-center justify-center w-4 h-4 rounded hover:bg-zinc-800 transition-colors"
          >
            {isCollapsed ? "▶" : "▼"}
          </button>
          <span className="text-emerald-400">Array&lt;</span>
          {isCollapsed && (
            <>
              <span className="text-zinc-500 px-0.5">...</span>
              <span className="text-emerald-400">&gt;</span>
            </>
          )}
        </span>

        {/* Expanded: indented object, then closing > on new line */}
        {!isCollapsed && (
          <>
            <div className="pl-2 border-l border-zinc-800/50 ml-1 my-0.5">
              <CollapsibleTemplate data={data[0]} inline />
            </div>
            <span className="text-emerald-400">&gt;</span>
          </>
        )}
      </span>
    );
  }

  // ── Object ──────────────────────────────────────────────────────────────────
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return <span className="text-zinc-500">{`{}`}</span>;
  }

  return (
    <span className="block">
      {/* First line: ▼ { */}
      <span className="inline-flex items-center gap-0.5">
        <button
          onClick={toggleCollapse}
          className="cursor-pointer text-zinc-500 hover:text-zinc-300 select-none text-[10px] inline-flex items-center justify-center w-4 h-4 rounded hover:bg-zinc-800 transition-colors"
        >
          {isCollapsed ? "▶" : "▼"}
        </button>
        <span className="text-zinc-500">{`{`}</span>
        {isCollapsed && (
          <>
            <span className="text-zinc-500 px-0.5">...</span>
            <span className="text-zinc-500">{`}`}</span>
          </>
        )}
      </span>

      {/* Expanded: each key on its own line */}
      {!isCollapsed && (
        <>
          <div className="pl-2 border-l border-zinc-800/50 ml-1 my-0.5">
            {keys.map((key) => {
              const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
                ? key
                : `"${key}"`;
              const value = data[key];
              const isComplex = value !== null && typeof value === "object";

              return (
                <div key={key} className="flex items-start">
                  {/* key: */}
                  <span className="text-zinc-300 shrink-0">{formattedKey}</span>
                  <span className="text-zinc-500 mr-1 shrink-0">:</span>
                  {/* value — block elements (object/array) go on same line, they handle their own newlines */}
                  <span className={isComplex ? "flex-1 min-w-0" : ""}>
                    <CollapsibleTemplate data={value} inline />
                  </span>
                  {/* semicolon always on same line as the closing bracket/value */}
                  {!isComplex && <span className="text-zinc-500">;</span>}
                </div>
              );
            })}
          </div>
          <span className="text-zinc-500">{`}`}</span>
        </>
      )}
    </span>
  );
};
