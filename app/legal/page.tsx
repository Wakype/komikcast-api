"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Legal() {
  const [activeTab, setActiveTab] = useState("terms");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = globalThis.location.hash.replace("#", "");
      if (hash) setActiveTab(hash);
    };

    globalThis.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => globalThis.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 relative overflow-x-hidden font-sans selection:bg-zinc-800">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-zinc-100 tracking-wide">
              Legal & Policy
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2 bg-zinc-900 px-4 py-1.5 rounded-md border border-zinc-800 hover:bg-zinc-800"
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
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-28">
          <div className="flex flex-col gap-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 px-2">
              On this page
            </h3>
            <nav className="space-y-1">
              {[
                { id: "terms", label: "Terms of Service" },
                { id: "privacy", label: "Privacy Policy" },
                { id: "dmca", label: "DMCA Disclaimer" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-between group ${
                    activeTab === item.id
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  }`}
                >
                  {item.label}
                  {activeTab === item.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                  )}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-8 md:p-12 relative overflow-hidden">
          <div className="relative z-10 space-y-20">
            {/* Terms Section */}
            <section id="terms" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
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
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
                  Terms of Service
                </h2>
              </div>
              <div className="space-y-6 text-zinc-400 leading-relaxed text-base">
                <p>
                  Welcome to the Komikcast Unofficial API. By accessing or using
                  our API, you agree to comply with and be bound by these Terms
                  of Service.
                </p>
                <div className="space-y-2 mt-8">
                  <h3 className="text-lg font-semibold text-zinc-100">
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
                  <h3 className="text-lg font-semibold text-zinc-100">
                    2. Liability
                  </h3>
                  <p>
                    The creator of this API (waky.dev) shall not be held liable
                    for any misuse, copyright infringement, or damages arising
                    from the use of this API. Use this service at your own risk.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-zinc-100">
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

            {/* Privacy Section */}
            <section id="privacy" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
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
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
                  Privacy Policy
                </h2>
              </div>
              <div className="space-y-6 text-zinc-400 leading-relaxed text-base">
                <p>
                  Your privacy is important to us. This Privacy Policy outlines
                  how your information is handled when you use the Komikcast
                  Unofficial API.
                </p>
                <div className="space-y-2 mt-8">
                  <h3 className="text-lg font-semibold text-zinc-100">
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
                  <h3 className="text-lg font-semibold text-zinc-100">
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

            {/* DMCA Section */}
            <section id="dmca" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
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
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
                  DMCA Disclaimer
                </h2>
              </div>
              <div className="space-y-6 text-zinc-400 leading-relaxed text-base">
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

                {/* Contact Box */}
                <div className="mt-8 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-4">
                  <div className="p-2 rounded-md bg-zinc-800 text-zinc-300 shrink-0">
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
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <strong className="text-zinc-100 block mb-1 font-semibold">
                      Contact for Inquiries
                    </strong>
                    <p className="text-sm text-zinc-400">
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

      {/* Footer */}
      <footer className="z-10 w-full py-6 mt-auto border-t border-zinc-800/50 bg-zinc-950 text-center text-sm text-zinc-500 font-medium">
        <p>&copy; {new Date().getFullYear()} waky.dev. All rights reserved.</p>
      </footer>
    </div>
  );
}
