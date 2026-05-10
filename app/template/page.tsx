"use client";

import { useState, useMemo } from "react";

export default function Home() {
  const [apiUrl, setApiUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [inputJson, setInputJson] = useState<string>("");
  const [outputTemplate, setOutputTemplate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Helper function to recursively determine the type of the value
  const getTypeTemplate = (value: any, indentLevel: number = 1): string => {
    const indent = "  ".repeat(indentLevel);
    const closingIndent = "  ".repeat(indentLevel - 1);

    if (value === null) return "null";

    if (Array.isArray(value)) {
      if (value.length > 0) {
        // Assume homogeneous array, check the first element
        const elementType = getTypeTemplate(value[0], indentLevel);
        return value[0] !== null &&
          typeof value[0] === "object" &&
          !Array.isArray(value[0])
          ? `${elementType}[]`
          : `${elementType}[]`;
      }
      return "any[]";
    }

    if (typeof value === "object") {
      let result = "{\n";
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          // Check if key needs quotes (e.g., contains spaces or special chars)
          const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
            ? key
            : `"${key}"`;
          result += `${indent}${formattedKey}: ${getTypeTemplate(value[key], indentLevel + 1)},\n`;
        }
      }
      result += `${closingIndent}}`;
      return result;
    }

    // Return primitive types: 'string', 'number', 'boolean'
    return typeof value;
  };

  // Handle the manual generation process
  const handleGenerate = () => {
    setError(null);
    if (!inputJson.trim()) {
      setOutputTemplate("");
      return;
    }

    try {
      const parsedJson = JSON.parse(inputJson);
      const generatedTemplate = getTypeTemplate(parsedJson);
      setOutputTemplate(generatedTemplate);
    } catch (err) {
      setError("Invalid JSON format. Please check your input.");
      setOutputTemplate("");
    }
  };

  // Handle fetching data from an API URL
  const handleFetchApi = async () => {
    if (!apiUrl.trim()) return;

    setIsLoading(true);
    setFetchError(null);
    setError(null);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Format the JSON nicely with 2 spaces indentation
      const formattedJson = JSON.stringify(data, null, 2);

      // Show response in the Input card
      setInputJson(formattedJson);

      // Auto-generate the template
      const generatedTemplate = getTypeTemplate(data);
      setOutputTemplate(generatedTemplate);
    } catch (err: any) {
      setFetchError(err.message || "Failed to fetch data from API.");
      // Keep previous data if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!outputTemplate) return;
    navigator.clipboard.writeText(outputTemplate);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Simple syntax highlighter without external libraries
  const highlightedOutput = useMemo(() => {
    if (!outputTemplate) return "";
    return (
      outputTemplate
        // Highlight string properties (keys) with quotes
        .replace(/"([^"]+)"(?=:)/g, '<span class="text-blue-400">"$1"</span>')
        // Highlight string properties (keys) without quotes
        .replace(
          /([a-zA-Z_$][a-zA-Z0-9_$]*)(?=:)/g,
          '<span class="text-blue-400">$1</span>',
        )
        // Highlight primitive types
        .replace(
          /:\s*(string|number|boolean|any|null)((\[])*)/g,
          ': <span class="text-yellow-300">$1$2</span>',
        )
        // Highlight brackets and braces
        .replace(/([{}[\],])/g, '<span class="text-zinc-500">$1</span>')
    );
  }, [outputTemplate]);

  return (
    // FIX: Removed overflow-x-hidden from the main wrapper to prevent double page scrollbars
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#0a0a0a] text-white relative py-16">
      {/* Custom Scrollbar Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `,
        }}
      />

      {/* FIX: Background Gradients wrapped in an overflow-hidden container to prevent layout shifting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <main className="z-10 flex flex-col items-center text-center px-4 max-w-6xl w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium border border-white/10 rounded-full bg-white/5 backdrop-blur-sm text-zinc-300">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Fast Type Inference</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          JSON to Template
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed">
          Instantly convert your JSON responses into strictly typed structures.
          Paste your payload below or fetch directly from an API endpoint.
        </p>

        {/* API Fetch Section */}
        <div className="w-full mb-8 flex flex-col gap-3 text-left">
          <label className="text-sm font-semibold text-zinc-300 ml-1">
            Option 1: Fetch from API
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              placeholder="https://api.example.com/data"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchApi()}
              className="flex-1 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm focus:border-white/20 focus:bg-white/10 outline-none transition-colors font-mono text-sm text-zinc-300 placeholder:text-zinc-600"
            />
            <button
              onClick={handleFetchApi}
              disabled={isLoading}
              className="px-8 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-zinc-200 disabled:bg-zinc-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Fetching
                </>
              ) : (
                "Fetch API"
              )}
            </button>
          </div>
          {fetchError && (
            <span className="text-red-400 text-xs font-medium ml-1">
              {fetchError}
            </span>
          )}
        </div>

        {/* Input / Output Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mb-8">
          {/* Input Section */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-zinc-300 ml-1">
              Option 2: Manual Input JSON
            </label>
            {/* FIX: added w-full to container, absolute inset-0 to textarea */}
            <div className="relative group h-[500px] w-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm focus-within:border-white/20 focus-within:bg-white/10 transition-colors overflow-hidden">
              <textarea
                className="absolute inset-0 w-full h-full p-5 bg-transparent outline-none resize-none font-mono text-sm text-zinc-300 placeholder:text-zinc-600 custom-scrollbar"
                placeholder='{\n  "message": "Hello World",\n  "status": 200\n}'
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-zinc-300">
                Output Template
              </label>
              {error && (
                <span className="text-red-400 text-xs font-medium">
                  {error}
                </span>
              )}
            </div>
            {/* FIX: added w-full to container, absolute inset-0 to pre block */}
            <div className="relative group h-[500px] w-full rounded-2xl bg-[#0f0f0f] border border-white/5 shadow-inner overflow-hidden">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`absolute top-4 right-4 z-20 flex items-center justify-center p-2 rounded-lg backdrop-blur-md border transition-all duration-200 ${
                  isCopied
                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100"
                }`}
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>

              <pre className="absolute inset-0 w-full h-full p-5 m-0 bg-transparent outline-none overflow-auto font-mono text-sm text-zinc-400 custom-scrollbar">
                {outputTemplate ? (
                  <code
                    dangerouslySetInnerHTML={{ __html: highlightedOutput }}
                  />
                ) : (
                  <span className="text-zinc-600">
                    Generated template will appear here...
                  </span>
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Generate Template from Manual Input
          </button>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                <path d="M3 12A9 3 0 0 0 21 12"></path>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Smart Inference</h3>
            <p className="text-zinc-400 text-sm">
              Automatically detects primitives, nested objects, and arrays to
              build accurate templates.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Instant Parsing</h3>
            <p className="text-zinc-400 text-sm">
              Client-side execution ensures lightning-fast generation without
              sending data to a server.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Strictly Typed</h3>
            <p className="text-zinc-400 text-sm">
              Creates clean structures ready to be used as TypeScript Interfaces
              or Types.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
