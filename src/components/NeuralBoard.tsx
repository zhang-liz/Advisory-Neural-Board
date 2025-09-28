"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Brain, Zap, Target, Cpu, Database, BarChart3, CheckCircle, AlertCircle } from "lucide-react";
import { InsuranceRecord, CSVProcessor, ModelRecommendation, DatasetAnalysis } from "@/utils/csvProcessor";

type AppState = "waiting" | "uploading" | "analyzing" | "model-selection" | "visualizing" | "predicting" | "complete";

interface NeuralBoardProps {
  appState: AppState;
  processedData: InsuranceRecord[] | null;
  datasetAnalysis: DatasetAnalysis | null;
  onAnalysisComplete: (analysis: DatasetAnalysis) => void;
}

interface NeuralNode {
  id: string;
  x: number;
  y: number;
  type: "input" | "processing" | "output" | "thinking";
  active: boolean;
  label: string;
  icon: React.ReactNode;
  connections: string[];
}

interface ThoughtBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  duration: number;
}

interface PredictionInput {
  age: number;
  sex: 'male' | 'female';
  bmi: number;
  children: number;
  smoker: 'yes' | 'no';
  region: 'northeast' | 'northwest' | 'southeast' | 'southwest';
}

export function NeuralBoard({ appState, processedData, datasetAnalysis, onAnalysisComplete }: NeuralBoardProps) {
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [thoughtBubbles, setThoughtBubbles] = useState<ThoughtBubble[]>([]);
  const [currentThought, setCurrentThought] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelRecommendation | null>(null);
  const [showModelSelection, setShowModelSelection] = useState(false);
  // const [showModelVisualization, setShowModelVisualization] = useState(false);
  const [showDatasetInsights, setShowDatasetInsights] = useState(false);
  const [predictionInput, setPredictionInput] = useState<PredictionInput>({
    age: 25,
    sex: 'male',
    bmi: 20,
    children: 0,
    smoker: 'no',
    region: 'northeast'
  });
  const [predictedCost, setPredictedCost] = useState<number | null>(null);

  // Define neural network structure
  const nodes: NeuralNode[] = [
    // Input Layer
    { 
      id: "data-input", 
      x: 10, 
      y: 50, 
      type: "input", 
      active: false, 
      label: "Data Input", 
      icon: <Database className="w-6 h-6" />,
      connections: ["schema-analyze", "stats-analyze"]
    },
    { 
      id: "schema-analyze", 
      x: 30, 
      y: 30, 
      type: "processing", 
      active: false, 
      label: "Schema Analysis", 
      icon: <Cpu className="w-6 h-6" />,
      connections: ["pattern-detect", "model-select"]
    },
    { 
      id: "stats-analyze", 
      x: 30, 
      y: 70, 
      type: "processing", 
      active: false, 
      label: "Statistical Analysis", 
      icon: <BarChart3 className="w-6 h-6" />,
      connections: ["pattern-detect", "feature-eng"]
    },
    
    // Processing Layer
    { 
      id: "pattern-detect", 
      x: 50, 
      y: 25, 
      type: "processing", 
      active: false, 
      label: "Pattern Detection", 
      icon: <Brain className="w-6 h-6" />,
      connections: ["model-select", "prediction"]
    },
    { 
      id: "feature-eng", 
      x: 50, 
      y: 50, 
      type: "processing", 
      active: false, 
      label: "Feature Engineering", 
      icon: <Zap className="w-6 h-6" />,
      connections: ["model-select"]
    },
    { 
      id: "model-select", 
      x: 50, 
      y: 75, 
      type: "processing", 
      active: false, 
      label: "Model Selection", 
      icon: <Target className="w-6 h-6" />,
      connections: ["prediction", "code-gen"]
    },
    
    // Output Layer
    { 
      id: "prediction", 
      x: 80, 
      y: 30, 
      type: "output", 
      active: false, 
      label: "Prediction", 
      icon: <Target className="w-6 h-6" />,
      connections: []
    },
    { 
      id: "code-gen", 
      x: 80, 
      y: 70, 
      type: "output", 
      active: false, 
      label: "Code Generation", 
      icon: <Cpu className="w-6 h-6" />,
      connections: []
    }
  ];

  // Prediction function using real data when available
  const predictInsuranceCost = (input: PredictionInput, model: ModelRecommendation): number => {
    if (processedData && processedData.length > 0) {
      // Use real data for more accurate predictions
      const similarRecords = CSVProcessor.findSimilarRecords(processedData, input, 10);
      
      if (similarRecords.length > 0) {
        const avgCharge = similarRecords.reduce((sum, record) => sum + record.charges, 0) / similarRecords.length;
        
        // Apply model-specific adjustments based on estimated accuracy
        const modelMultiplier = 0.9 + (model.estimatedAccuracy - 0.5) * 0.2; // Converts accuracy to multiplier
        
        return Math.round(avgCharge * modelMultiplier);
      }
    }
    
    // Fallback to simple calculation if no data available
    let baseCost = 3000;
    
    // Age factor
    baseCost += (input.age - 18) * 50;
    
    // BMI factor
    if (input.bmi > 30) baseCost += 2000;
    else if (input.bmi > 25) baseCost += 1000;
    
    // Smoker factor (major impact)
    if (input.smoker === 'yes') baseCost *= 2.5;
    
    // Children factor
    baseCost += input.children * 500;
    
    // Sex factor (slight difference)
    if (input.sex === 'female') baseCost *= 0.95;
    
    // Regional adjustments
    const regionMultipliers = {
      'northeast': 1.1,
      'northwest': 1.0,
      'southeast': 0.9,
      'southwest': 0.95
    };
    baseCost *= regionMultipliers[input.region];
    
    // Apply model-specific adjustments based on estimated accuracy
    const modelMultiplier = 0.9 + (model.estimatedAccuracy - 0.5) * 0.2;
    baseCost *= modelMultiplier;
    
    return Math.round(baseCost);
  };

  const thoughts = {
    waiting: [],
    uploading: [
      "Preparing neural pathways...",
      "Initializing data receptors...",
      "Ready for analysis!"
    ],
    analyzing: [
      "Scanning dataset structure...",
      "Calculating feature correlations...",
      "Detecting data complexity patterns...",
      "Analyzing data quality metrics...",
      "Computing variance ratios...",
      "Evaluating model suitability...",
      "Generating dynamic recommendations!"
    ],
    "model-selection": [
      "Here are the best models for YOUR data!",
      "Recommendations based on real analysis...",
      "Choose based on your priorities!"
    ],
    visualizing: [
      "Visualizing model structure...",
      "Showing feature importance...",
      "Model is ready for predictions!"
    ],
    predicting: [
      "Running prediction with selected model...",
      "Calculating insurance cost...",
      "Result ready!"
    ],
    complete: [
      "Dynamic analysis complete!",
      "Model recommendations ready!",
      "Ready for new predictions!"
    ]
  };

  // Animation sequence based on app state
  useEffect(() => {
    if (appState === "waiting") {
      setActiveNodes(new Set());
      setThoughtBubbles([]);
      setCurrentThought("");
      return;
    }

    if (appState === "uploading") {
      // Activate input nodes first
      setTimeout(() => setActiveNodes(new Set(["data-input"])), 300);
      addThoughtBubble("Receiving your dataset...", 20, 20);
      setTimeout(() => setCurrentThought("📊 Dataset incoming!"), 500);
    }

    if (appState === "analyzing") {
      // Sequential node activation
      const sequence = [
        { nodes: ["data-input"], delay: 0 },
        { nodes: ["schema-analyze", "stats-analyze"], delay: 800 },
        { nodes: ["pattern-detect", "feature-eng"], delay: 1600 },
        { nodes: ["model-select"], delay: 2400 }
      ];

      sequence.forEach(({ nodes: nodeIds, delay }) => {
        setTimeout(() => {
          setActiveNodes(prev => new Set([...prev, ...nodeIds]));
        }, delay);
      });

      // Add thinking bubbles
      thoughts.analyzing.forEach((thought, index) => {
        setTimeout(() => {
          addThoughtBubble(thought, 60 + Math.random() * 30, 10 + Math.random() * 70);
          setCurrentThought(thought);
        }, index * 1000 + Math.random() * 500);
      });

      // Perform actual dataset analysis and show results
      if (processedData && !datasetAnalysis) {
        setTimeout(() => {
          const analysis = CSVProcessor.analyzeDataset(processedData);
          onAnalysisComplete(analysis);
          setCurrentThought("Dataset analysis complete! Dynamic recommendations ready.");
          setShowDatasetInsights(true);
        }, 6000);
      }

      // Show model selection after analysis
      setTimeout(() => {
        setShowModelSelection(true);
        setCurrentThought("Ready to recommend models based on your data!");
      }, 7500);
    }
  }, [appState, processedData, datasetAnalysis]);

  const addThoughtBubble = (text: string, x: number, y: number) => {
    const bubble: ThoughtBubble = {
      id: Math.random().toString(),
      text,
      x,
      y,
      duration: 3000
    };
    
    setThoughtBubbles(prev => [...prev, bubble]);
    
    setTimeout(() => {
      setThoughtBubbles(prev => prev.filter(b => b.id !== bubble.id));
    }, bubble.duration);
  };

  const handleModelSelection = (model: ModelRecommendation) => {
    setSelectedModel(model);
    setShowModelSelection(false);
    setActiveNodes(new Set(["data-input", "schema-analyze", "stats-analyze", "pattern-detect", "feature-eng", "model-select", "prediction", "code-gen"]));
    setCurrentThought(`${model.name} selected! Estimated accuracy: ${(model.estimatedAccuracy * 100).toFixed(1)}%`);
    
    // Show visualization after a short delay
    // setTimeout(() => {
    //   setShowModelVisualization(true);
    //   setCurrentThought(`Visualizing ${model.name} structure...`);
    // }, 1000);
    
    // Calculate initial prediction
    const cost = predictInsuranceCost(predictionInput, model);
    setPredictedCost(cost);
  };

  const handlePredictionInputChange = (field: keyof PredictionInput, value: string | number) => {
    const newInput = { ...predictionInput, [field]: value };
    setPredictionInput(newInput);
    
    if (selectedModel) {
      const cost = predictInsuranceCost(newInput, selectedModel);
      setPredictedCost(cost);
    }
  };

  const getNodeStyle = (node: NeuralNode) => {
    const isActive = activeNodes.has(node.id);
    const baseStyle = "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-xl p-4 border-4 transition-all duration-300";
    
    switch (node.type) {
      case "input":
        return `${baseStyle} ${isActive ? 'bg-blue-500 border-blue-300 shadow-lg shadow-blue-500/50' : 'bg-blue-900/50 border-blue-700'}`;
      case "processing":
        return `${baseStyle} ${isActive ? 'bg-purple-500 border-purple-300 shadow-lg shadow-purple-500/50' : 'bg-purple-900/50 border-purple-700'}`;
      case "output":
        return `${baseStyle} ${isActive ? 'bg-green-500 border-green-300 shadow-lg shadow-green-500/50' : 'bg-green-900/50 border-green-700'}`;
      default:
        return `${baseStyle} bg-gray-900/50 border-gray-700`;
    }
  };

  // Removed getModelIcon as we're using string icons from the data

  return (
    <div className="h-[800px] relative overflow-hidden bg-gray-900 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: appState === "analyzing" ? 360 : 0
            }}
            transition={{
              duration: 3,
              repeat: appState === "analyzing" ? Infinity : 0,
              ease: "linear"
            }}
          >
            🧠
          </motion.div>
          <h3 className="text-white text-xl font-bold">
            Dynamic Neural Board {(appState !== "waiting" && appState !== "uploading") ? "- Dataset Analysis Active" : ""}
          </h3>
          <motion.div 
            className="ml-auto flex items-center gap-2"
            animate={{
              opacity: appState !== "waiting" ? [0.5, 1, 0.5] : 0.5
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className={`w-3 h-3 rounded-full ${{
              waiting: "bg-gray-500",
              uploading: "bg-yellow-400",
              analyzing: "bg-purple-400",
              "model-selection": "bg-blue-400",
              complete: "bg-green-400"
            }[appState] || "bg-green-400"}`} />
            <span className="text-sm text-white/80">
              {appState.toUpperCase().replace('-', ' ')}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Neural Network Visualization */}
      <div className="relative h-full p-4">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node => 
            node.connections.map(connectionId => {
              const targetNode = nodes.find(n => n.id === connectionId);
              if (!targetNode) return null;
              
              const isActive = activeNodes.has(node.id) && activeNodes.has(connectionId);
              
              return (
                <motion.line
                  key={`${node.id}-${connectionId}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${targetNode.x}%`}
                  y2={`${targetNode.y}%`}
                  stroke={isActive ? "#8b5cf6" : "#374151"}
                  strokeWidth="3"
                  strokeDasharray={isActive ? "0" : "5,5"}
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: isActive ? 1 : 0.3,
                    opacity: isActive ? 1 : 0.3
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              );
            })
          )}
        </svg>

        {/* Neural Nodes */}
        {nodes.map(node => (
          <motion.div
            key={node.id}
            className={getNodeStyle(node)}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: activeNodes.has(node.id) ? [1, 1.2, 1] : 1,
              opacity: 1,
              boxShadow: activeNodes.has(node.id) ? 
                "0 0 20px rgba(139, 92, 246, 0.8)" : 
                "none"
            }}
            transition={{
              scale: { duration: 0.6, repeat: activeNodes.has(node.id) ? Infinity : 0, repeatDelay: 2 },
              opacity: { duration: 0.4 }
            }}
            whileHover={{ scale: 1.1 }}
          >
            <div className="text-white">
              {node.icon}
            </div>
            <div className="text-xs text-white/80 mt-1 text-center whitespace-nowrap">
              {node.label}
            </div>
          </motion.div>
        ))}

        {/* Thought Bubbles */}
        <AnimatePresence>
          {thoughtBubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -20 }}
              className="absolute bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-none"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
              }}
            >
              <div className="text-white text-sm whitespace-nowrap">
                💭 {bubble.text}
              </div>
              <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white/10" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Current Thought Display */}
        <AnimatePresence>
          {currentThought && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-2xl"
                >
                  🤔
                </motion.div>
                <div>
                  <div className="text-sm text-blue-300">AI is thinking...</div>
                  <div className="text-white">{currentThought}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dataset Insights Panel */}
        <AnimatePresence>
          {showDatasetInsights && datasetAnalysis && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="absolute left-4 top-16 bottom-16 w-80 bg-black/90 backdrop-blur-sm rounded-lg p-4 z-10 overflow-y-auto"
            >
              <div className="text-center mb-4">
                <h3 className="text-white text-lg font-bold mb-2">📊 Dataset Insights</h3>
                <div className="text-sm text-gray-300">
                  {datasetAnalysis.stats.totalRecords} records • {datasetAnalysis.stats.dataComplexity} complexity
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-blue-300 text-sm font-semibold mb-2">Quality Metrics</div>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>Data Quality: {(datasetAnalysis.stats.dataQuality * 100).toFixed(1)}%</div>
                    <div>Outliers: {(datasetAnalysis.stats.outlierPercentage * 100).toFixed(1)}%</div>
                    <div>Variance Ratio: {datasetAnalysis.stats.varianceRatio.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-green-300 text-sm font-semibold mb-2">Feature Correlations</div>
                  <div className="text-xs text-gray-300 space-y-1">
                    {Object.entries(datasetAnalysis.stats.featureCorrelations).map(([feature, corr]) => (
                      <div key={feature} className="flex justify-between">
                        <span>{feature}:</span>
                        <span className={corr > 0.5 ? 'text-green-400' : corr > 0.3 ? 'text-yellow-400' : 'text-gray-400'}>
                          {(corr * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-purple-300 text-sm font-semibold mb-2">Key Insights</div>
                  <div className="text-xs text-gray-300 space-y-1">
                    {datasetAnalysis.insights.slice(0, 4).map((insight, idx) => (
                      <div key={idx} className="text-xs">{insight}</div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Model Selection Interface */}
        <AnimatePresence>
          {showModelSelection && datasetAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-4 bg-black/95 backdrop-blur-sm rounded-lg p-6 z-20 overflow-y-auto"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🤖 Dynamic Model Recommendations</h3>
                <p className="text-blue-300">Based on analysis of your {datasetAnalysis.stats.totalRecords}-record dataset</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {datasetAnalysis.modelRecommendations.map((model, index) => (
                  <motion.div
                    key={model.id}
                    className="bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500"
                    onClick={() => handleModelSelection(model)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-white text-2xl">{model.icon}</div>
                      <div>
                        <h4 className="text-white font-bold">{model.name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-400 font-semibold">
                            {(model.estimatedAccuracy * 100).toFixed(1)}% accuracy
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${{
                            'Low': 'bg-green-600',
                            'Medium': 'bg-yellow-600',
                            'High': 'bg-red-600'
                          }[model.complexity]}`}>
                            {model.complexity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{model.description}</p>
                    
                    <div className="bg-gray-700/50 rounded p-2 mb-3">
                      <div className="text-xs text-blue-300 font-semibold mb-1">Why recommended:</div>
                      <div className="text-xs text-gray-300">{model.recommendationReason}</div>
                    </div>

                    <div className="flex gap-4 text-xs">
                      <div>
                        <div className="text-green-300 font-semibold mb-1">Pros:</div>
                        <ul className="text-gray-300 space-y-1">
                          {model.pros.slice(0, 2).map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-red-300 font-semibold mb-1">Cons:</div>
                        <ul className="text-gray-300 space-y-1">
                          {model.cons.slice(0, 2).map((con, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prediction Interface */}
        <AnimatePresence>
          {selectedModel && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-4 top-16 bottom-16 w-72 bg-black/95 backdrop-blur-sm rounded-lg p-4 z-10 overflow-y-auto"
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-2xl">{selectedModel.icon}</div>
                  <h3 className="text-white font-bold">{selectedModel.name}</h3>
                </div>
                <div className="text-sm text-blue-300 mb-2">
                  Estimated Accuracy: {(selectedModel.estimatedAccuracy * 100).toFixed(1)}%
                </div>
                <div className="text-2xl font-bold text-green-400">
                  ${predictedCost?.toLocaleString() || '---'}
                </div>
                <p className="text-blue-300 text-sm">Predicted Insurance Cost</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-white text-xs font-bold mb-1">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={predictionInput.age}
                    onChange={(e) => handlePredictionInputChange('age', parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-xs font-bold mb-1">Sex</label>
                  <select
                    value={predictionInput.sex}
                    onChange={(e) => handlePredictionInputChange('sex', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white text-xs font-bold mb-1">BMI</label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    step="0.1"
                    value={predictionInput.bmi}
                    onChange={(e) => handlePredictionInputChange('bmi', parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-xs font-bold mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={predictionInput.children}
                    onChange={(e) => handlePredictionInputChange('children', parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-xs font-bold mb-1">Smoker</label>
                  <select
                    value={predictionInput.smoker}
                    onChange={(e) => handlePredictionInputChange('smoker', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white text-xs font-bold mb-1">Region</label>
                  <select
                    value={predictionInput.region}
                    onChange={(e) => handlePredictionInputChange('region', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="northeast">Northeast</option>
                    <option value="northwest">Northwest</option>
                    <option value="southeast">Southeast</option>
                    <option value="southwest">Southwest</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <motion.button
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-bold text-sm rounded transition-colors"
                    onClick={() => setShowModelSelection(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Try Different Model
                  </motion.button>
                  
                  {datasetAnalysis && (
                    <motion.button
                      className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 text-white font-bold text-sm rounded transition-colors"
                      onClick={() => setShowDatasetInsights(!showDatasetInsights)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showDatasetInsights ? '📋 Hide Insights' : '📊 View Insights'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Particle Effects */}
        {appState === "analyzing" && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
                initial={{
                  x: Math.random() * 400,
                  y: Math.random() * 300,
                  opacity: 0
                }}
                animate={{
                  x: Math.random() * 400,
                  y: Math.random() * 300,
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}