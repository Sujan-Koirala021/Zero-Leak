"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCoAgent } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";

import { Card } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Shield, Search, FileText, FileCode, AlertTriangle, GitMerge } from "lucide-react";

// Interface for the final scan report
interface ScanReport {
  repository: string;
  url: string;
  scanDate: string;
  markdownReport: string;
}

// Interface for repository suggestions
interface Suggestion {
  label: string;
  url: string;
  icon: string;
}

// Interface for scan statistics
interface ScanStats {
    docs: number;
    secrets: number;
    ranges: number;
}

// Props for the category card component
interface CategoryCardProps {
  icon: string;
  title: string;
  url: string;
  handleScan: (url: string) => void;
  className?: string;
}

// Type definition for the application's context
interface ZeroLeakContextType {
  githubUrl: string;
  setGithubUrl: (url: string) => void;
  scanReport: ScanReport | null;
  setScanReport: (report: ScanReport | null) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  scanStats: ScanStats;
  setScanStats: (stats: ScanStats) => void;
}

// A custom hook to manage the application's state.
// In a larger application, this would be created with React.createContext
// and a provider would wrap the component tree.
const useZeroLeakContext = (): ZeroLeakContextType => {
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStats, setScanStats] = useState<ScanStats>({ docs: 0, secrets: 0, ranges: 0 });

  return {
    githubUrl,
    setGithubUrl,
    scanReport,
    setScanReport,
    isScanning,
    setIsScanning,
    scanStats,
    setScanStats,
  };
};

// A simple card component for displaying repository suggestions
const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, url, handleScan, className }) => (
  <Card
    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
    onClick={() => handleScan(url)}
  >
    <div className="flex items-center space-x-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-xs text-red-600 mt-1 font-mono">{url}</p>
      </div>
    </div>
  </Card>
);

// Main component for the Zero-Leak Agent UI
const ZeroLeakAgent: React.FC = () => {
  const { githubUrl, setGithubUrl, scanReport, setScanReport, isScanning, setIsScanning, scanStats, setScanStats } = useZeroLeakContext();
  const [, setIsInputFocused] = useState<boolean>(false);

  // Initialize the CoAgent hook for communication with the security agent
  const { run: runSecurityAgent, state, setState } = useCoAgent({
    name: "zeroleak-agent",
    initialState: {
      repo_url: githubUrl,
      llm_analysis_results:{},
      potential_secrets:[],
    merged_context_ranges: [],
    },
  });

  // This effect hook listens for changes in the agent's state.
  // When the analysis results are available, it processes them and generates the report.
  useEffect(() => {
    const llmResults = state.llm_analysis_results;

    // Check if the agent has finished scanning and results are ready to be processed.
    if (llmResults && Object.keys(llmResults).length > 0 && isScanning) {
      const repoUrl = state.repo_url || githubUrl;
      const repoName = repoUrl.split('/').pop() || 'repository';

      // 1. Combine all individual file analysis results into one string
      let combinedAnalysis = "### Detailed File-by-File Analysis\n\n";
      for (const [filePath, analysis] of Object.entries(llmResults)) {
        combinedAnalysis += `----\n\n`;
        combinedAnalysis += `**File:** \`${filePath}\`\n\n`;
        combinedAnalysis += `**Analysis Findings:**\n \n${analysis}\n \n`;
      }

      // 2. Calculate statistics from the agent's state
      const docsChecked = Object.keys(llmResults).length;
      const potentialSecrets = state.potential_secrets?.length || 0;
      const mergedRanges = state.merged_context_ranges?.length || 0;
      setScanStats({ docs: docsChecked, secrets: potentialSecrets, ranges: mergedRanges });

      // 3. Construct the complete markdown report
      const markdownReport = `# Zero-Leak Security Report

## Repository Information
- **Repository**: ${repoName}
- **URL**: <${repoUrl}>
- **Scan Date**: ${new Date().toLocaleDateString()}
- **Risk Level**: **${potentialSecrets > 0 ? 'HIGH' : 'MEDIUM'}**

## 🔍 Scan Summary
- **Documents Checked**: ${docsChecked}
- **Potential Secrets Found**: ${potentialSecrets}
- **Merged Context Ranges**: ${mergedRanges}

${combinedAnalysis}

---
*Report generated by Zero-Leak Agent at ${new Date().toLocaleTimeString()}*
`;

      // 4. Set the final report object into the component's state
      setScanReport({
        repository: repoName,
        url: repoUrl,
        scanDate: new Date().toISOString().split('T')[0],
        markdownReport: markdownReport,
      });

      // 5. Turn off the scanning indicator
      setIsScanning(false);
    }
  }, [state, isScanning, githubUrl, setScanReport, setIsScanning, setScanStats]);

  // Function to initiate a repository scan
  const handleScan = async (url: string): Promise<void> => {
    if (!url.trim() || isScanning) return; // Prevent empty or concurrent scans

    console.log("Initiating repository scan:", url);
    setGithubUrl(url);
    setIsScanning(true);
    setScanReport(null); // Clear any previous report

    // Ensure the agent's state has the correct repository URL
    const newState = {
        ...state,
        repo_url: url,
        llm_analysis_results: {}, // Reset previous results
        merged_context_ranges: [],
        potential_secrets: [],
    };
    setState(newState);

    // Run the CopilotKit agent. The useEffect hook will handle the response.
    await runSecurityAgent(() => new TextMessage({
        role: MessageRole.User,
        content: `Scan this repository: ${url}`,
    }));
  };

  // Sample repositories for user to easily test the scanner
  const suggestions: Suggestion[] = [
    { label: "Scan React.js Repository", url: "https://github.com/facebook/react", icon: "⚛️" },
    { label: "Analyze Express.js Security", url: "https://github.com/expressjs/express", icon: "🚀" },
    { label: "Check Vue.js Vulnerabilities", url: "https://github.com/vuejs/vue", icon: "💚" },
    { label: "Security Scan Angular", url: "https://github.com/angular/angular", icon: "🅰️" },
  ];

  // Function to download the generated markdown report
  const downloadReport = (): void => {
    if (!scanReport) return;
    const blob = new Blob([scanReport.markdownReport], { type: 'text/markdown' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `zeroleak-report-${scanReport.repository}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="container mx-auto p-6 space-y-16 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-5xl space-y-8 flex justify-between items-end border-b-2 pb-4 border-red-600">
          <Link href="/" className="text-4xl md:text-5xl font-bold text-red-600">
            Zero-Leak
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-red-600" />
            <span>AI Security Agent</span>
          </div>
        </div>

        {/* Conditional rendering: Show scan input or report */}
        {!scanReport ? (
          <div className="w-full max-w-5xl space-y-8">
            {/* Input Section */}
            <div className="relative">
              <Card className="shadow-lg bg-white border-red-200">
                <Textarea
                  placeholder="Enter a public GitHub repository URL to begin your security scan..."
                  className="min-h-[200px] resize-none border-0 focus:ring-0 text-2xl p-6 bg-transparent"
                  maxLength={500}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleScan(githubUrl);
                    }
                  }}
                />
              </Card>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => (
                <CategoryCard
                  key={suggestion.label}
                  icon={suggestion.icon}
                  title={suggestion.label}
                  url={suggestion.url}
                  handleScan={handleScan}
                  className="bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300"
                />
              ))}
            </div>

            {/* Scanning Animation */}
            {isScanning && (
              <Card className="p-8 text-center bg-red-50 border-red-200">
                <div className="space-y-6">
                  <div className="animate-pulse">
                    <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Scanning Repository Security
                    </h3>
                    <p className="text-gray-600">
                      AI agent is analyzing code for vulnerabilities and secrets... This may take a few moments.
                    </p>
                  </div>
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto"></div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Report Display Section */
          <div className="w-full max-w-6xl space-y-6">
            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                onClick={() => {
                  setScanReport(null);
                  setGithubUrl("");
                }}
                className="border-2 border-red-600 text-red-600 bg-white hover:bg-red-50"
              >
                <Search className="w-4 h-4 mr-2" />
                Scan Another Repository
              </Button>
              <Button onClick={downloadReport} className="bg-red-600 hover:bg-red-700 text-white">
                <FileText className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
            
            {/* Statistics Overview */}
            <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex flex-col sm:flex-row justify-around items-center text-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                        <FileCode className="w-8 h-8 text-red-600"/>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{scanStats.docs}</p>
                            <p className="text-sm text-gray-700">Documents Checked</p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-8 h-8 text-red-600"/>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{scanStats.secrets}</p>
                            <p className="text-sm text-gray-700">Potential Secrets</p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-3">
                        <GitMerge className="w-8 h-8 text-red-600"/>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{scanStats.ranges}</p>
                            <p className="text-sm text-gray-700">Context Ranges</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Markdown Report Display */}
            <Card className="bg-white border-red-200">
              <div className="border-b border-red-200 p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Security Report</h3>
                    <p className="text-sm text-gray-600">
                      Generated on {scanReport.scanDate} for <span className="font-semibold">{scanReport.repository}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-red-50 p-6 rounded-lg overflow-auto border border-red-200">
                  {scanReport.markdownReport}
                </pre>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ZeroLeakAgent;
