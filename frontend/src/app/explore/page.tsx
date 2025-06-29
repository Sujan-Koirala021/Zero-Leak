"use client";

import { CopilotKit } from '@copilotkit/react-core';
import React, { useState } from 'react';
import ZeroLeakAgent from './expanded-view';

// Read env variable at build time
const DEPLOYMENT = process.env.NEXT_PUBLIC_DEPLOYMENT === 'True';

function ExplorePage() {
    const [showPopup, setShowPopup] = useState(DEPLOYMENT);
    return (
        <div className="relative">
            {showPopup && (
                <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center">
                    <div className="relative bg-white border-2 border-red-600 rounded-lg p-8 shadow-lg text-center max-w-md w-full">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-3xl font-bold cursor-pointer"
                            aria-label="Close popup"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold text-red-700 mb-4">Backend Unavailable</h2>
                        <p className="text-gray-800 mb-6">
                            Due to difficulty in deploying the FastAPI backend and the requirement for a high timeout
                            period for agent processing, the backend is not available at the moment.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a
                                href="https://github.com/your-repo-url"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                            >
                                View on GitHub
                            </a>
                            <a
                                href="https://your-demo-video-url.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                            >
                                Watch Demo
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <CopilotKit runtimeUrl="/api/copilotkit" agent="zeroleak-agent">
                <ZeroLeakAgent />
            </CopilotKit>
        </div>
    );
}

export default ExplorePage;
