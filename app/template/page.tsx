"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function TemplateGenerator() {
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
          result += `${indent}${formattedKey}: ${getTypeTemplate(
            value[key],
            indentLevel + 1,
          )},\n`;
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

    // Use default placeholder if empty to show functionality
    const defaultJson = '{\n  "message": "Hello World",\n  "status": 200\n}';
    const jsonToParse = inputJson.trim() ? inputJson : defaultJson;

    try {
      const parsedJson = JSON.parse(jsonToParse);
      const generatedTemplate = getTypeTemplate(parsedJson);

      if (!inputJson.trim()) {
        setInputJson(defaultJson);
      }

      setOutputTemplate(generatedTemplate);
    } catch (err: any) {
      setError(`Invalid JSON: ${err.message || "Please check your input"}`);
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
      // Use dev-proxy to bypass CORS and Cloudflare blocks
      const proxyUrl = `/api/dev-proxy?url=${encodeURIComponent(apiUrl)}`;
      const response = await fetch(proxyUrl);
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

  // Simple syntax highlighter tailored for the minimalist dark theme
  const highlightedOutput = useMemo(() => {
    if (!outputTemplate) return "";
    return (
      outputTemplate
        // Highlight string properties (keys) with quotes
        .replace(/"([^"]+)"(?=:)/g, '<span class="text-zinc-300">"$1"</span>')
        // Highlight string properties (keys) without quotes
        .replace(
          /([a-zA-Z_$][a-zA-Z0-9_$]*)(?=:)/g,
          '<span class="text-zinc-300">$1</span>',
        )
        // Highlight primitive types
        .replace(
          /:\s*(string|number|boolean|any|null)((\[])*)/g,
          ': <span class="text-emerald-400">$1$2</span>',
        )
        // Highlight brackets and braces
        .replace(/([{}[\],])/g, '<span class="text-zinc-500">$1</span>')
    );
  }, [outputTemplate]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-zinc-950 text-zinc-50 relative pt-16 font-sans selection:bg-zinc-800">
      {/* Custom Scrollbar Styles for Textarea and Pre */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3f3f46 transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `,
        }}
      />

      <main className="z-10 flex flex-col items-center px-6 max-w-5xl w-full">
        {/* Top Navigation / Back Button */}
        <div className="w-full flex justify-start mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-xs font-medium border border-zinc-800 rounded-full bg-zinc-900/50 text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
          </span>
          <span>Fast Type Inference</span>
        </div>

        {/* Heading Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-zinc-100">
            JSON to Template
          </h1>
          <p className="text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Instantly convert your JSON responses into strictly typed
            structures. Paste your payload below or fetch directly from an API
            endpoint.
          </p>
        </div>

        {/* API Fetch Section */}
        <div className="w-full mb-8 flex flex-col gap-2 text-left">
          <label className="text-sm font-medium text-zinc-300">
            Option 1: Fetch from API
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="https://api.example.com/data"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchApi()}
              className="flex-1 px-4 py-2.5 rounded-md bg-zinc-900 border border-zinc-800 focus:border-zinc-600 focus:bg-zinc-800/50 outline-none transition-colors font-mono text-sm text-zinc-300 placeholder:text-zinc-600"
            />
            <button
              onClick={handleFetchApi}
              disabled={isLoading}
              className="h-11 px-6 rounded-md bg-zinc-100 text-zinc-950 font-medium hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
            <span className="text-red-400 text-xs font-medium">
              {fetchError}
            </span>
          )}
        </div>

        {/* Workspace: Input & Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mb-6">
          {/* Input Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center h-6">
              <label className="text-sm font-medium text-zinc-300">
                Option 2: Manual Input JSON
              </label>
            </div>
            <div className="relative w-full h-[450px] rounded-xl bg-zinc-900/30 border border-zinc-800 focus-within:border-zinc-600 transition-colors overflow-hidden">
              <textarea
                className="absolute inset-0 w-full h-full p-5 bg-transparent outline-none resize-none font-mono text-sm text-zinc-300 placeholder:text-zinc-600 custom-scrollbar leading-relaxed"
                placeholder='{\n  "message": "Hello World",\n  "status": 200\n}'
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center h-6">
              <label className="text-sm font-medium text-zinc-300">
                Output Template
              </label>
              {error && (
                <span className="text-red-400 text-xs font-medium">
                  {error}
                </span>
              )}
            </div>
            <div className="relative group w-full h-[450px] rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`absolute top-3 right-3 z-20 flex items-center justify-center p-2 rounded-md transition-all duration-200 ${
                  isCopied
                    ? "bg-zinc-800 text-zinc-100"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 opacity-0 group-hover:opacity-100"
                }`}
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
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
                    width="16"
                    height="16"
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

              <pre className="absolute inset-0 w-full h-full p-5 m-0 bg-transparent outline-none overflow-auto font-mono text-sm text-zinc-400 custom-scrollbar leading-relaxed">
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

        {/* Generate Button for Manual Input */}
        <div className="w-full flex justify-start mb-16">
          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            Generate from Manual Input
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center mb-4 text-zinc-300 border border-zinc-700/50 group-hover:border-zinc-600 transition-colors">
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
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                <path d="M3 12A9 3 0 0 0 21 12"></path>
              </svg>
            </div>
            <h3 className="text-zinc-100 font-medium mb-2">Smart Inference</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Automatically detects primitives, nested objects, and arrays to
              build accurate templates.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center mb-4 text-zinc-300 border border-zinc-700/50 group-hover:border-zinc-600 transition-colors">
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
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h3 className="text-zinc-100 font-medium mb-2">Instant Parsing</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Client-side execution ensures lightning-fast generation without
              sending data to a server.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center mb-4 text-zinc-300 border border-zinc-700/50 group-hover:border-zinc-600 transition-colors">
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className="text-zinc-100 font-medium mb-2">Strictly Typed</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Creates clean structures ready to be used as TypeScript Interfaces
              or Types.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 w-full py-6 mt-16 border-t border-zinc-800/50 bg-zinc-950 text-center text-sm text-zinc-500 font-medium">
        <p>&copy; {new Date().getFullYear()} waky.dev. All rights reserved.</p>
      </footer>
    </div>
  );
}
