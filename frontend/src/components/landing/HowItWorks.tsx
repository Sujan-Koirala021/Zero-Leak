import Link from 'next/link';
import React from 'react';


function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-red-50">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full mb-4">How It Works</span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Secure Your Repos in 3 Simple Steps</h2>
                    <p className="text-xl text-muted-foreground">
                        Start protecting your codebase from leaked secrets today.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            number: "01",
                            title: "Connect Repository",
                            description: "Link your GitHub repo to begin vulnerability scanning."
                        },
                        {
                            number: "02",
                            title: "Detect Leaks",
                            description: "Scan and identify leaked API keys, tokens, and credentials."
                        },
                        {
                            number: "03",
                            title: "Get Fix Guidance",
                            description: "Receive actionable suggestions to remediate security issues."
                        }
                    ].map((step, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-white border shadow-md"
                        >
                            <div className="text-5xl font-bold text-red-200 mb-4">{step.number}</div>
                            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href='/discover'>
                        <button className='px-8 py-4 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/30 rounded-lg text-lg'>
                            Start Scanning
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default HowItWorks;