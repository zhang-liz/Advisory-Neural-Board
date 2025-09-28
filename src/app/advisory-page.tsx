"use client";

import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { NeuralBoard } from "@/components/NeuralBoard";
import { motion } from "motion/react";
import { CSVProcessor, InsuranceRecord, DatasetAnalysis } from "@/utils/csvProcessor";

type AppState = "waiting" | "uploading" | "analyzing" | "model-selection" | "visualizing" | "predicting" | "complete";

export default function AdvisoryNeuralBoardPage() {
  const [appState, setAppState] = useState<AppState>("waiting");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<InsuranceRecord[] | null>(null);
  const [datasetAnalysis, setDatasetAnalysis] = useState<DatasetAnalysis | null>(null);

  // Sample insurance data for testing
  const sampleInsuranceData = `age,sex,bmi,children,smoker,region,charges
19,female,27.9,0,yes,southwest,16884.924
18,male,33.77,1,no,southeast,1725.5523
28,male,33,3,no,southeast,4449.462
33,male,22.705,0,no,northwest,21984.47061
32,male,28.88,0,no,northeast,3866.8552
31,female,25.74,0,no,southeast,3756.6216
46,female,33.44,1,no,southeast,8240.5896
37,female,27.74,3,no,northwest,7281.5056
37,male,29.83,2,no,northeast,6406.4107
60,female,25.84,0,no,northwest,28923.13692
25,male,26.22,0,no,northeast,2721.3208
62,male,26.29,0,yes,southeast,27808.7251
23,female,34.4,0,no,southwest,1826.843
56,female,39.82,0,no,southeast,11090.7178
27,male,42.13,0,yes,southeast,39611.7577
19,male,24.6,1,no,southwest,1837.237
52,female,30.78,1,no,northeast,10797.3362
23,male,23.845,0,no,northeast,2395.17155
56,male,40.3,0,no,southwest,10602.385
30,male,35.3,0,yes,southwest,36837.467
34,female,31.92,1,yes,northeast,37701.8768
54,male,24.7,2,no,northwest,9561.8418
34,female,32.4,1,no,southwest,4149.736
43,male,25.98,0,no,southeast,5804.2434
30,female,31.06,0,no,northeast,3640.2994
22,male,28.05,0,no,northeast,2735.2795
44,male,27.4,2,no,northwest,7726.854
40,male,31.17,1,no,northeast,6313.7593
39,female,36.63,1,no,southeast,6356.2747
34,male,34.77,0,yes,southwest,36219.4223
18,female,26.315,0,no,northeast,2198.18985
24,female,25.8,0,no,southeast,2458.548
64,female,33.8,4,no,northwest,16455.322
27,female,33.33,1,no,southeast,3956.0857
50,male,30.97,3,no,northwest,10600.5487
30,female,28.69,2,no,northeast,4867.1631
18,female,31.68,0,no,northeast,2205.9808
18,female,37.05,0,no,northeast,2132.5245
21,female,25.8,0,no,southeast,2007.945
61,female,29.07,0,yes,northwest,29141.3603
62,female,32.52,0,no,southeast,12950.0768
28,male,36.4,1,yes,southwest,51194.55914
27,male,30.59,1,no,northeast,3956.7741`;

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setAppState("uploading");
    
    try {
      let text: string;
      
      if (file.name === 'insurance.csv' && file.size === 6) {
        // This is our sample data trigger
        text = sampleInsuranceData;
      } else {
        // Read actual file content
        text = await file.text();
      }
      
      // Process CSV after upload animation
      setTimeout(() => {
        try {
          const records = CSVProcessor.parseCSV(text);
          console.log(`Processed ${records.length} insurance records`);
          
          setProcessedData(records);
          setAppState("analyzing");
        } catch (error) {
          console.error('Error processing CSV:', error);
          alert('Error processing CSV file. Please check the format and required columns.');
          setAppState("waiting");
        }
      }, 2000);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file.');
      setAppState("waiting");
    }
  };

  const handleAnalysisComplete = (analysis: DatasetAnalysis) => {
    setDatasetAnalysis(analysis);
    console.log('Dynamic analysis complete:', {
      totalRecords: analysis.stats.totalRecords,
      complexity: analysis.stats.dataComplexity,
      topModel: analysis.modelRecommendations[0],
      insights: analysis.insights.length
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 opacity-10">
        <div className="grid grid-cols-20 gap-px h-full w-full">
          {Array.from({ length: 400 }).map((_, i) => (
            <motion.div 
              key={i} 
              className="bg-white/20 rounded-sm" 
              animate={{ 
                opacity: [0.1, 0.3, 0.1] 
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🧠 ADVISORY NEURAL BOARD
          </h1>
          <p className="text-xl text-blue-200">
            Your AI ML Consultant with Dynamic Model Recommendations
          </p>
          <p className="text-sm text-purple-200 mt-2">
            Upload your dataset and get real-time, data-driven model suggestions
          </p>
        </motion.div>

        {/* Show upload zone only when waiting or uploading */}
        {(appState === "waiting" || appState === "uploading") && (
          <div className="flex flex-col xl:grid xl:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
            {/* Left Side - Upload Zone */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4 xl:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <DropZone 
                  onFileUpload={handleFileUpload}
                  appState={appState}
                  uploadedFile={uploadedFile}
                />
              </div>
              
              {appState !== "waiting" && uploadedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <h3 className="text-white text-xl font-bold mb-4">
                    📁 Dataset Info
                  </h3>
                  <div className="space-y-2 text-green-300 font-mono">
                    <div>📄 File: {uploadedFile.name}</div>
                    <div>📏 Size: {(uploadedFile.size / 1024).toFixed(1)}KB</div>
                    <div>🕐 Status: {appState.toUpperCase()}</div>
                    {processedData && (
                      <div>📊 Records: {processedData.length}</div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right Side - Neural Board (smaller when upload zone is visible) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="xl:col-span-2"
            >
              <NeuralBoard 
                appState={appState} 
                processedData={processedData}
                datasetAnalysis={datasetAnalysis}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </motion.div>
          </div>
        )}

        {/* Full screen Neural Board when data is loaded */}
        {appState !== "waiting" && appState !== "uploading" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-full mx-auto"
          >
            {/* Header with dataset info and dynamic insights */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-white text-lg font-bold">
                    📁 {uploadedFile?.name || 'Dataset'}
                  </h3>
                  <div className="text-green-300 text-sm font-mono">
                    {uploadedFile ? (uploadedFile.size / 1024).toFixed(1) : 0}KB • 
                    {processedData?.length || 0} records
                    {datasetAnalysis && (
                      <> • {datasetAnalysis.stats.dataComplexity} complexity</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {datasetAnalysis && (
                    <div className="text-right">
                      <div className="text-blue-300 text-sm">
                        Top Model: {datasetAnalysis.modelRecommendations[0]?.name}
                      </div>
                      <div className="text-green-400 text-xs">
                        Est. Accuracy: {(datasetAnalysis.modelRecommendations[0]?.estimatedAccuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  <motion.button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-bold text-sm rounded-lg transition-colors"
                    onClick={() => {
                      setAppState("waiting");
                      setProcessedData(null);
                      setDatasetAnalysis(null);
                      setUploadedFile(null);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Load New Dataset
                  </motion.button>
                </div>
              </div>

              {/* Dynamic Insights Bar */}
              {datasetAnalysis && datasetAnalysis.insights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-white/20"
                >
                  <div className="text-purple-300 text-sm font-semibold mb-2">
                    💡 AI Insights:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    {datasetAnalysis.insights.slice(0, 3).map((insight, idx) => (
                      <div key={idx} className="bg-white/10 rounded px-3 py-2 text-white">
                        {insight}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Full screen Neural Board */}
            <NeuralBoard 
              appState={appState} 
              processedData={processedData}
              datasetAnalysis={datasetAnalysis}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-white/60 text-sm"
        >
          <p>
            Powered by dynamic dataset analysis • Real-time model recommendations • 
            {processedData ? ` ${processedData.length} records analyzed` : ' Ready for your data'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}