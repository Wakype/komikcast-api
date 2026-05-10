"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Legal() {
  const [activeTab, setActiveTab] = useState("terms");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveTab(hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 relative overflow-x-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white tracking-wide">
              Legal & Policy
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 hover:bg-white/10"
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-20 max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-28 flex flex-col gap-1.5 bg-[#0f0f0f]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md shadow-2xl">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
              Contents
            </h3>
            <a
              href="#terms"
              onClick={() => setActiveTab("terms")}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group ${activeTab === "terms" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
            >
              Terms of Service
              <svg
                className={`w-4 h-4 transition-transform ${activeTab === "terms" ? "opacity-100 translate-x-0 text-blue-400" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
            <a
              href="#privacy"
              onClick={() => setActiveTab("privacy")}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group ${activeTab === "privacy" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
            >
              Privacy Policy
              <svg
                className={`w-4 h-4 transition-transform ${activeTab === "privacy" ? "opacity-100 translate-x-0 text-green-400" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
            <a
              href="#dmca"
              onClick={() => setActiveTab("dmca")}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group ${activeTab === "dmca" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
            >
              DMCA Disclaimer
              <svg
                className={`w-4 h-4 transition-transform ${activeTab === "dmca" ? "opacity-100 translate-x-0 text-purple-400" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-[#0f0f0f]/80 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Subtle glow inside the content box */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-24">
            <section id="terms" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Terms of Service
                </h2>
              </div>
              <div className="space-y-6 text-zinc-400 leading-relaxed text-lg">
                <p>
                  Welcome to the Komikcast Unofficial API. By accessing or using
                  our API, you agree to comply with and be bound by these Terms
                  of Service.
                </p>
                <div className="space-y-2 mt-8">
                  <h3 className="text-xl font-bold text-white">
                    1. Usage Constraints
                  </h3>
                  <p>
                    This API is strictly provided for educational purposes and
                    personal projects. You are solely responsible for how you
                    use the data returned by this API. We do not host any of the
                    manga, images, or content provided.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">2. Liability</h3>
                  <p>
                    The creator of this API (waky.dev) shall not be held liable
                    for any misuse, copyright infringement, or damages arising
                    from the use of this API. Use this service at your own risk.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    3. Service Availability
                  </h3>
                  <p>
                    We reserve the right to modify, suspend, or discontinue the
                    API at any time without prior notice. We do not guarantee
                    continuous, uninterrupted access to the API.
                  </p>
                </div>
              </div>
            </section>

            <section id="privacy" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Privacy Policy
                </h2>
              </div>
              <div className="space-y-6 text-zinc-400 leading-relaxed text-lg">
                <p>
                  Your privacy is important to us. This Privacy Policy outlines
                  how your information is handled when you use the Komikcast
                  Unofficial API.
                </p>
                <div className="space-y-2 mt-8">
                  <h3 className="text-xl font-bold text-white">
                    Data Collection
                  </h3>
                  <p>
                    We do not collect, store, or sell any personal data from the
                    end-users accessing this API. The API merely acts as a
                    proxy/scraper that forwards requests to the source provider
                    and returns the structured data.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    Analytics and Logs
                  </h3>
                  <p>
                    Standard server logs (such as IP addresses and request
                    timestamps) may be temporarily collected by our hosting
                    provider (Vercel) for performance monitoring and security
                    purposes, but these are not used to track individuals.
                  </p>
                </div>
              </div>
            </section>

            <section id="dmca" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20"></path>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  DMCA Disclaimer
                </h2>
              </div>
              <div className="space-y-6 text-zinc-400 leading-relaxed text-lg">
                <p>
                  The Komikcast Unofficial API does not host, store, or
                  distribute any copyrighted material. This API operates
                  strictly as a search engine and web scraper, fetching publicly
                  available metadata and links from third-party websites in
                  real-time.
                </p>
                <p>
                  All content, images, and characters belong to their respective
                  creators and copyright holders.
                </p>
                <p>
                  If you are a copyright owner and believe your content is being
                  indexed inappropriately, please contact the original source
                  website where the content is hosted. Since we do not host any
                  of the files, we cannot remove them from the internet.
                </p>
                <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                  <div className="p-2 rounded-full bg-white/10 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <strong className="text-white block mb-1">
                      Contact for Inquiries
                    </strong>
                    <p className="text-base text-zinc-400">
                      If you have any further legal inquiries regarding this API
                      project, you can contact the developer via the GitHub
                      repository linked on the home page.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="z-10 w-full py-5 mt-10 border-t border-white/5 bg-black/40 backdrop-blur-md text-center text-sm text-zinc-500 font-medium">
        <p>&copy; {new Date().getFullYear()} waky.dev. All rights reserved.</p>
      </footer>
    </div>
  );
}
