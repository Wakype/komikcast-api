"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const endpoints = [
  {
    id: "home",
    title: "Home",
    method: "GET",
    path: "/api/home",
    description: "Fetch banner, popular, and newest komik for the home page.",
    params: [],
  },
  {
    id: "detail",
    title: "Komik Detail",
    method: "GET",
    path: "/api/komik/[slug]",
    description: "Fetch komik details, chapter list, and recommendations.",
    params: [{ name: "slug", placeholder: "e.g., archamge-restaurant" }],
  },
  {
    id: "read",
    title: "Read Chapter",
    method: "GET",
    path: "/api/komik/[slug]/[chapterId]",
    description: "Fetch chapter images and pagination details.",
    params: [
      { name: "slug", placeholder: "e.g., archamge-restaurant" },
      { name: "chapterId", placeholder: "e.g., 132" },
    ],
  },
  {
    id: "filter",
    title: "Filter Komik",
    method: "GET",
    path: "/api/filter?page=[page]&take=[take]&sort=[sort]&sortOrder=[sortOrder]&status=[status]&format=[format]&genreIds=[genreIds]&search=[search]",
    description:
      "Filter and search komik. Status: ongoing, completed, hiatus, cancelled. Format: manga, manhwa, manhua, webtoon. Optional filters can be left empty.",
    params: [
      { name: "page", placeholder: "e.g., 1" },
      { name: "take", placeholder: "e.g., 12" },
      {
        name: "sort",
        placeholder: "latest | popularity | rating",
        options: ["", "latest", "popularity", "rating"],
      },
      {
        name: "sortOrder",
        placeholder: "desc | asc",
        options: ["", "desc", "asc"],
      },
      {
        name: "status",
        placeholder: "Select Status",
        options: ["ongoing", "completed", "hiatus", "cancelled"],
        multi: true,
      },
      {
        name: "format",
        placeholder: "Select Format",
        options: ["manga", "manhwa", "manhua", "mangatoon"],
        multi: true,
      },
      {
        name: "genreIds",
        placeholder: "Select Genres",
        options: [],
        multi: true,
      },
      { name: "search", placeholder: "Search title/nativeTitle" },
    ],
  },
  {
    id: "genres",
    title: "Genres List",
    method: "GET",
    path: "/api/genres",
    description: "Fetch all available genres for filtering.",
    params: [],
  },
];

// Helper syntax highlighting JSON
const syntaxHighlight = (json: any) => {
  if (!json) return "";
  const jsonStr =
    typeof json === "string" ? json : JSON.stringify(json, null, 2);
  return jsonStr.replaceAll(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-400"; // number
      if (match.startsWith('"')) {
        if (match.endsWith(":")) {
          cls = "text-indigo-300"; // key / attribute
        } else {
          cls = "text-emerald-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-rose-400"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-zinc-500 italic"; // null
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
};

export default function ApiDocs() {
  const [activeEndpointId, setActiveEndpointId] = useState(endpoints[0].id);
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    slug: "archamge-restaurant",
    chapterId: "132",
    page: "1",
    take: "12",
    sort: "latest",
    sortOrder: "desc",
    status: "",
    format: "",
    genreIds: "",
    search: "",
  });
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genresOptions, setGenresOptions] = useState<string[]>([]);

  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // State untuk Base URL
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");

  // Set Base URL dinamis berdasarkan environment browser
  useEffect(() => {
    if (globalThis.window !== undefined) {
      setBaseUrl(globalThis.location.origin);
    }
  }, []);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("/api/genres");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setGenresOptions(json.data.map((g: any) => g.data.name));
        }
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };
    fetchGenres();
  }, []);

  const activeEndpoint = endpoints.find((e) => e.id === activeEndpointId)!;

  const handleParamChange = (name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectToggle = (name: string, option: string) => {
    setParamValues((prev) => {
      const currentVal = prev[name] || "";
      const selectedArr = currentVal ? currentVal.split(",") : [];
      if (selectedArr.includes(option)) {
        const newArr = selectedArr.filter((val) => val !== option);
        return { ...prev, [name]: newArr.join(",") };
      } else {
        return { ...prev, [name]: [...selectedArr, option].join(",") };
      }
    });
  };

  // Helper untuk membuat path relatif beserta parameter
  const getRelativeUrl = () => {
    let pathPart = activeEndpoint.path.split("?")[0];
    let queryPart = activeEndpoint.path.split("?")[1] || "";

    for (const param of activeEndpoint.params) {
      const val = paramValues[param.name];
      if (val) {
        pathPart = pathPart.replace(`[${param.name}]`, encodeURIComponent(val));

        if ((param as any).multi) {
          // Format comma-separated values into multiple query parameters
          // Example: [status] -> ongoing&status=completed
          const encodedVal = val
            .split(",")
            .map((v) => encodeURIComponent(v).replaceAll("%20", "+"))
            .join(`&${param.name}=`);
          queryPart = queryPart.replace(`[${param.name}]`, encodedVal);
        } else {
          // Use + instead of %20 for spaces in query string parameters
          let encodedVal = encodeURIComponent(val).replaceAll("%20", "+");
          queryPart = queryPart.replace(`[${param.name}]`, encodedVal);
        }
      }
    }

    if (queryPart) {
      queryPart = queryPart
        .split("&")
        .filter((part) => !part.includes("["))
        .join("&");
    }

    return queryPart ? `${pathPart}?${queryPart}` : pathPart;
  };

  // Helper untuk membuat URL penuh beserta parameter yang sudah diisi
  const getFullUrl = () => {
    return `${baseUrl}${getRelativeUrl()}`;
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    // Copy URL penuh dari helper function
    navigator.clipboard.writeText(getFullUrl());
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTestApi = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    // Validasi parameter kosong (kecuali yang opsional)
    for (const param of activeEndpoint.params) {
      if (
        !paramValues[param.name] &&
        ![
          "status",
          "format",
          "genreIds",
          "search",
          "sort",
          "sortOrder",
        ].includes(param.name)
      ) {
        setError(`Parameter [${param.name}] is required`);
        setIsLoading(false);
        return;
      }
    }

    try {
      // Menggunakan getFullUrl() untuk fetch
      const res = await fetch(getFullUrl());
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-indigo-500/30">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        /* Style untuk resize handler agar terlihat lebih jelas */
        .resize-y::-webkit-resizer {
          background-color: transparent;
        }
      `,
        }}
      />

      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[140px]" />
      </div>

      {/* Sidebar */}
      <div className="z-10 w-full md:w-80 border-r border-white/5 bg-black/60 backdrop-blur-xl flex flex-col shrink-0 shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
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
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
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
                className="text-white"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              API Reference
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-3">
              Endpoints
            </h3>
            {endpoints.map((ep) => {
              const isActive = activeEndpointId === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setActiveEndpointId(ep.id);
                    setResponse(null);
                    setError(null);
                  }}
                  className={`relative flex flex-col items-start p-3 rounded-lg text-left transition-all duration-200 group ${
                    isActive ? "bg-white/5" : "hover:bg-white/2"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  )}
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${ep.method === "GET" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}
                    >
                      {ep.method}
                    </span>
                    <span
                      className={`text-sm font-medium ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"}`}
                    >
                      {ep.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono truncate w-full px-1">
                    {ep.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="z-10 flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden bg-transparent">
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeEndpoint.method}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  {activeEndpoint.title}
                </h1>
              </div>
              <p className="text-zinc-400 text-base md:text-lg max-w-2xl mb-6">
                {activeEndpoint.description}
              </p>

              {/* Base URL Info Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm">
                <span className="text-indigo-400/80 font-medium">
                  Base URL:
                </span>
                <code className="text-indigo-300 font-mono">{baseUrl}</code>
              </div>
            </div>

            {/* URL Display with Copy Button */}
            <div className="group relative flex items-center justify-between bg-[#111111] border border-white/5 rounded-xl p-1 overflow-hidden shadow-sm">
              <div className="flex items-center flex-1 overflow-hidden">
                <div className="flex items-center justify-center px-4 py-3 bg-white/5 rounded-lg border border-white/5 mr-2">
                  <span className="text-emerald-400 font-mono text-xs font-bold">
                    {activeEndpoint.method}
                  </span>
                </div>
                <div className="flex-1 overflow-x-auto custom-scrollbar pr-4">
                  {/* Ubah di sini: gunakan getRelativeUrl() */}
                  <span className="font-mono text-sm text-zinc-300 whitespace-nowrap">
                    {getRelativeUrl()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyUrl}
                title="Copy URL"
                className="shrink-0 mx-2 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {copiedUrl ? (
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
                    className="text-emerald-400"
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
            </div>

            {/* Parameters */}
            {activeEndpoint.params.length > 0 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  Parameters
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-zinc-300">
                    {activeEndpoint.params.length}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 rounded-2xl bg-[#111111] border border-white/5 shadow-sm">
                  {activeEndpoint.params.map((param) => (
                    <div key={param.name} className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-400 flex items-center gap-1">
                        {param.name}
                        {![
                          "status",
                          "format",
                          "genreIds",
                          "search",
                          "sort",
                          "sortOrder",
                        ].includes(param.name) && (
                          <span className="text-rose-400/80" title="Required">
                            *
                          </span>
                        )}
                      </label>
                      <div className="relative group">
                        {(param as any).multi ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {(
                              (param.name === "genreIds"
                                ? genresOptions
                                : param.options) || []
                            ).map((opt: string) => {
                              const isSelected = (paramValues[param.name] || "")
                                .split(",")
                                .includes(opt);
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    handleMultiSelectToggle(param.name, opt)
                                  }
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                    isSelected
                                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                      : "bg-black/50 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                            {param.name === "genreIds" &&
                              genresOptions.length === 0 && (
                                <span className="text-xs text-zinc-500 py-1">
                                  Loading genres...
                                </span>
                              )}
                          </div>
                        ) : param.options ? (
                          <select
                            value={paramValues[param.name] || ""}
                            onChange={(e) =>
                              handleParamChange(param.name, e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all font-mono text-sm shadow-inner appearance-none"
                          >
                            {param.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt === ""
                                  ? "Any"
                                  : opt.charAt(0).toUpperCase() + opt.slice(1)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={param.placeholder}
                            value={paramValues[param.name] || ""}
                            onChange={(e) =>
                              handleParamChange(param.name, e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all font-mono text-sm shadow-inner"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col md:flex-row items-center gap-4">
              <button
                onClick={handleTestApi}
                disabled={isLoading}
                className="relative overflow-hidden group px-8 py-3.5 rounded-xl bg-white text-black font-semibold disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 w-full md:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-zinc-500"
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
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
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
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    <span>Send Request</span>
                  </>
                )}
              </button>
              {error && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-3 rounded-xl border border-rose-400/20">
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Response Section */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-lg font-medium text-white">Response</h3>

              {/* Box Response Resizable */}
              <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col resize-y overflow-hidden min-h-[250px] h-[600px]">
                {/* Editor Header */}
                <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-[#111111] border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                    </div>
                    <span className="ml-2 text-xs font-mono text-zinc-500">
                      response.json
                    </span>
                  </div>

                  {response && (
                    <button
                      onClick={handleCopyResponse}
                      className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                    >
                      {copiedResponse ? (
                        <>
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
                            className="text-emerald-400"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
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
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Editor Body */}
                <div className="relative flex-1 w-full bg-[#0a0a0a]">
                  {response ? (
                    <pre
                      className="absolute inset-0 w-full h-full p-6 m-0 bg-transparent outline-none overflow-auto font-mono text-[13px] leading-relaxed custom-scrollbar"
                      dangerouslySetInnerHTML={{
                        __html: syntaxHighlight(response),
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-50"
                      >
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                      <span className="text-sm">
                        Click &quot;Send Request&quot; to fetch data...
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-500 text-right mt-2">
                * You can drag the bottom right corner of the box to resize.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
