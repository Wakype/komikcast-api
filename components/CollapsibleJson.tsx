/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

interface CollapsibleJsonProps {
  data: any;
  isLast?: boolean;
}

export const CollapsibleJson: React.FC<CollapsibleJsonProps> = ({
  data,
  isLast = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  if (data === null) {
    return (
      <span className="text-zinc-500 italic">null{isLast ? "" : ","}</span>
    );
  }

  if (typeof data === "boolean") {
    return (
      <span className="text-blue-400">
        {data ? "true" : "false"}
        {isLast ? "" : ","}
      </span>
    );
  }

  if (typeof data === "number") {
    return (
      <span className="text-blue-400">
        {data}
        {isLast ? "" : ","}
      </span>
    );
  }

  if (typeof data === "string") {
    return (
      <span className="text-emerald-400">
        &quot;{data}&quot;{isLast ? "" : ","}
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span>[]{isLast ? "" : ","}</span>;

    return (
      <span className="relative inline-block pl-3 align-top">
        <span
          className="cursor-pointer text-zinc-500 hover:text-zinc-300 select-none mr-0 absolute left-0 top-0 text-[10px] inline-flex items-center justify-center w-4 h-4 rounded hover:bg-zinc-800 transition-colors"
          onClick={toggleCollapse}
        >
          {isCollapsed ? "▶" : "▼"}
        </span>
        <span className="text-zinc-500">[</span>
        {!isCollapsed && (
          <div className="pl-1 border-l border-zinc-800/50 ml-0.5 my-0.5">
            {data.map((item, index) => (
              <div key={index}>
                <CollapsibleJson
                  data={item}
                  isLast={index === data.length - 1}
                />
              </div>
            ))}
          </div>
        )}
        {isCollapsed && <span className="text-zinc-500 px-1">...</span>}
        <span className="text-zinc-500">]{isLast ? "" : ","}</span>
      </span>
    );
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0)
      return (
        <span className="text-zinc-500">
          {`{}`}
          {isLast ? "" : ","}
        </span>
      );

    return (
      <span className="relative inline-block pl-3 align-top">
        <span
          className="cursor-pointer text-zinc-500 hover:text-zinc-300 select-none mr-0 absolute left-0 top-0 text-[10px] inline-flex items-center justify-center w-4 h-4 rounded hover:bg-zinc-800 transition-colors"
          onClick={toggleCollapse}
        >
          {isCollapsed ? "▶" : "▼"}
        </span>
        <span className="text-zinc-500">{`{`}</span>
        {!isCollapsed && (
          <div className="pl-1 border-l border-zinc-800/50 ml-0.5 my-0.5">
            {keys.map((key, index) => {
              return (
                <div key={key}>
                  <span className="text-zinc-300">&quot;{key}&quot;</span>
                  <span className="text-zinc-500 mr-1">:</span>
                  <CollapsibleJson
                    data={data[key]}
                    isLast={index === keys.length - 1}
                  />
                </div>
              );
            })}
          </div>
        )}
        {isCollapsed && <span className="text-zinc-500 px-1">...</span>}
        <span className="text-zinc-500">
          {`}`}
          {isLast ? "" : ","}
        </span>
      </span>
    );
  }

  return (
    <span>
      {String(data)}
      {isLast ? "" : ","}
    </span>
  );
};
