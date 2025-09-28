"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

type AppState = "waiting" | "uploading" | "analyzing" | "model-selection" | "visualizing" | "predicting" | "complete";

interface DropZoneProps {
  onFileUpload: (file: File) => void;
  appState: AppState;
  uploadedFile: File | null;
}

export function DropZone({ onFileUpload, appState, uploadedFile }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      onFileUpload(csvFile);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      onFileUpload(file);
    } else {
      alert('Please select a CSV file');
    }
  };

  const loadSampleData = () => {
    // Create a synthetic file object for the sample insurance data
    const sampleFile = new File(['sample'], 'insurance.csv', { type: 'text/csv' });
    onFileUpload(sampleFile);
  };

  return (
    <div className="space-y-4">
      {/* Main Drop Zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${appState === 'uploading' ? 'animate-pulse' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={appState === 'uploading'}
        />
        
        <div className="space-y-4">
          {appState === 'waiting' ? (
            <>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Insurance Dataset
                </h3>
                <p className="text-sm text-gray-600">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Expected columns: age, sex, bmi, children, smoker, region, charges
                </p>
              </div>
            </>
          ) : appState === 'uploading' ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FileText className="mx-auto h-12 w-12 text-blue-500" />
              </motion.div>
              <div>
                <h3 className="text-lg font-medium text-blue-600 mb-2">
                  Processing File...
                </h3>
                <p className="text-sm text-gray-600">
                  Reading and validating your dataset
                </p>
              </div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              </motion.div>
              <div>
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  File Uploaded Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  {uploadedFile?.name} • {uploadedFile ? (uploadedFile.size / 1024).toFixed(1) : 0}KB
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Sample Data Option */}
      {appState === 'waiting' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600 mb-3">
            Don&apos;t have a dataset? Try our sample:
          </p>
          <motion.button
            onClick={loadSampleData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText className="h-4 w-4" />
            Load Sample Insurance Data
          </motion.button>
        </motion.div>
      )}

      {/* File Requirements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50 rounded-lg p-4 text-sm"
      >
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          CSV Requirements:
        </h4>
        <ul className="text-gray-600 space-y-1">
          <li>• Must contain columns: age, sex, bmi, children, smoker, region, charges</li>
          <li>• Age: numeric (18-100)</li>
          <li>• Sex: male/female</li>
          <li>• BMI: numeric (15-50)</li>
          <li>• Children: numeric (0-10)</li>
          <li>• Smoker: yes/no</li>
          <li>• Region: northeast/northwest/southeast/southwest</li>
          <li>• Charges: numeric (insurance cost)</li>
        </ul>
      </motion.div>
    </div>
  );
}