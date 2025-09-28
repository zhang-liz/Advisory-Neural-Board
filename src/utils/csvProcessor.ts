export interface InsuranceRecord {
  age: number;
  sex: 'male' | 'female';
  bmi: number;
  children: number;
  smoker: 'yes' | 'no';
  region: 'northeast' | 'northwest' | 'southeast' | 'southwest';
  charges: number;
}

export interface DatasetStats {
  totalRecords: number;
  averageAge: number;
  averageBMI: number;
  averageCharges: number;
  smokerPercentage: number;
  genderDistribution: { male: number; female: number };
  regionDistribution: Record<string, number>;
  // New fields for model analysis
  dataComplexity: 'low' | 'medium' | 'high';
  featureCorrelations: Record<string, number>;
  dataQuality: number; // 0-1 score
  outlierPercentage: number;
  varianceRatio: number; // target variance vs feature variance
}

export interface ModelRecommendation {
  id: string;
  name: string;
  description: string;
  estimatedAccuracy: number;
  complexity: 'Low' | 'Medium' | 'High';
  icon: string;
  color: string;
  recommendationReason: string;
  suitabilityScore: number; // 0-1 score
  pros: string[];
  cons: string[];
}

export interface DatasetAnalysis {
  stats: DatasetStats;
  modelRecommendations: ModelRecommendation[];
  insights: string[];
}

export class CSVProcessor {
  static parseCSV(csvContent: string): InsuranceRecord[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    if (headers.length < 6) {
      throw new Error('Invalid CSV format. Expected at least 6 columns (age,sex,bmi,children,smoker,region,charges).');
    }
    
    const records: InsuranceRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < 6) continue;
      
      try {
        const record: InsuranceRecord = {
          age: parseFloat(values[0]),
          sex: values[1].toLowerCase() as 'male' | 'female',
          bmi: parseFloat(values[2]),
          children: parseInt(values[3]),
          smoker: values[4].toLowerCase() as 'yes' | 'no',
          region: values[5].toLowerCase() as 'northeast' | 'northwest' | 'southeast' | 'southwest',
          charges: parseFloat(values[6] || values[values.length - 1])
        };
        
        // Validate record
        if (isNaN(record.age) || isNaN(record.bmi) || isNaN(record.charges)) {
          console.warn(`Skipping invalid record at line ${i + 1}:`, values);
          continue;
        }
        
        records.push(record);
      } catch {
        console.warn(`Skipping invalid record at line ${i + 1}:`, values);
      }
    }
    
    return records;
  }
  
  static calculateStats(records: InsuranceRecord[]): DatasetStats {
    const totalRecords = records.length;
    const averageAge = records.reduce((sum, r) => sum + r.age, 0) / totalRecords;
    const averageBMI = records.reduce((sum, r) => sum + r.bmi, 0) / totalRecords;
    const averageCharges = records.reduce((sum, r) => sum + r.charges, 0) / totalRecords;
    
    const smokers = records.filter(r => r.smoker === 'yes').length;
    const smokerPercentage = (smokers / totalRecords) * 100;
    
    const genderDistribution = {
      male: records.filter(r => r.sex === 'male').length,
      female: records.filter(r => r.sex === 'female').length
    };
    
    const regionDistribution: Record<string, number> = {};
    records.forEach(r => {
      regionDistribution[r.region] = (regionDistribution[r.region] || 0) + 1;
    });

    // Calculate advanced metrics for model selection
    const dataComplexity = this.calculateDataComplexity(records);
    const featureCorrelations = this.calculateFeatureCorrelations(records);
    const dataQuality = this.calculateDataQuality(records);
    const outlierPercentage = this.calculateOutlierPercentage(records);
    const varianceRatio = this.calculateVarianceRatio(records);
    
    return {
      totalRecords,
      averageAge,
      averageBMI,
      averageCharges,
      smokerPercentage,
      genderDistribution,
      regionDistribution,
      dataComplexity,
      featureCorrelations,
      dataQuality,
      outlierPercentage,
      varianceRatio
    };
  }

  static calculateDataComplexity(records: InsuranceRecord[]): 'low' | 'medium' | 'high' {
    const uniqueValues = {
      age: new Set(records.map(r => Math.floor(r.age / 5))).size, // Age groups
      bmi: new Set(records.map(r => Math.floor(r.bmi / 2))).size, // BMI groups
      sex: new Set(records.map(r => r.sex)).size,
      smoker: new Set(records.map(r => r.smoker)).size,
      region: new Set(records.map(r => r.region)).size,
      children: new Set(records.map(r => r.children)).size
    };
    
    const complexityScore = Object.values(uniqueValues).reduce((sum, count) => sum + count, 0);
    
    if (complexityScore < 20) return 'low';
    if (complexityScore < 40) return 'medium';
    return 'high';
  }

  static calculateFeatureCorrelations(records: InsuranceRecord[]): Record<string, number> {
    const correlations: Record<string, number> = {};
    
    // Age vs Charges correlation
    correlations.age = this.pearsonCorrelation(
      records.map(r => r.age),
      records.map(r => r.charges)
    );
    
    // BMI vs Charges correlation
    correlations.bmi = this.pearsonCorrelation(
      records.map(r => r.bmi),
      records.map(r => r.charges)
    );
    
    // Children vs Charges correlation
    correlations.children = this.pearsonCorrelation(
      records.map(r => r.children),
      records.map(r => r.charges)
    );
    
    // Smoker impact (effect size)
    const smokerCharges = records.filter(r => r.smoker === 'yes').map(r => r.charges);
    const nonSmokerCharges = records.filter(r => r.smoker === 'no').map(r => r.charges);
    const smokerAvg = smokerCharges.reduce((sum, c) => sum + c, 0) / smokerCharges.length;
    const nonSmokerAvg = nonSmokerCharges.reduce((sum, c) => sum + c, 0) / nonSmokerCharges.length;
    correlations.smoker = Math.abs(smokerAvg - nonSmokerAvg) / Math.max(smokerAvg, nonSmokerAvg);
    
    return correlations;
  }

  static pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  static calculateDataQuality(records: InsuranceRecord[]): number {
    
    // Check for missing values (already handled in parsing, so high score)
    const validRecords = records.filter(r => 
      !isNaN(r.age) && !isNaN(r.bmi) && !isNaN(r.charges) && 
      r.sex && r.smoker && r.region
    ).length;
    
    const completenessScore = validRecords / records.length;
    
    // Check for reasonable value ranges
    const reasonableAges = records.filter(r => r.age >= 18 && r.age <= 100).length;
    const reasonableBMI = records.filter(r => r.bmi >= 15 && r.bmi <= 50).length;
    const reasonableCharges = records.filter(r => r.charges > 0 && r.charges < 100000).length;
    
    const reasonablenessScore = (reasonableAges + reasonableBMI + reasonableCharges) / (3 * records.length);
    
    return Math.min(completenessScore * 0.5 + reasonablenessScore * 0.5, 1.0);
  }

  static calculateOutlierPercentage(records: InsuranceRecord[]): number {
    const charges = records.map(r => r.charges);
    const mean = charges.reduce((sum, c) => sum + c, 0) / charges.length;
    const stdDev = Math.sqrt(charges.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / charges.length);
    
    const outliers = charges.filter(c => Math.abs(c - mean) > 2 * stdDev).length;
    return outliers / charges.length;
  }

  static calculateVarianceRatio(records: InsuranceRecord[]): number {
    const charges = records.map(r => r.charges);
    const chargesMean = charges.reduce((sum, c) => sum + c, 0) / charges.length;
    const chargesVariance = charges.reduce((sum, c) => sum + Math.pow(c - chargesMean, 2), 0) / charges.length;
    
    // Calculate combined feature variance (normalized)
    const ages = records.map(r => r.age);
    const ageMean = ages.reduce((sum, a) => sum + a, 0) / ages.length;
    const ageVariance = ages.reduce((sum, a) => sum + Math.pow(a - ageMean, 2), 0) / ages.length;
    
    const bmis = records.map(r => r.bmi);
    const bmiMean = bmis.reduce((sum, b) => sum + b, 0) / bmis.length;
    const bmiVariance = bmis.reduce((sum, b) => sum + Math.pow(b - bmiMean, 2), 0) / bmis.length;
    
    const normalizedAgeVar = ageVariance / (ageMean * ageMean);
    const normalizedBmiVar = bmiVariance / (bmiMean * bmiMean);
    const normalizedChargesVar = chargesVariance / (chargesMean * chargesMean);
    
    const featureVarianceAvg = (normalizedAgeVar + normalizedBmiVar) / 2;
    
    return featureVarianceAvg === 0 ? 1 : normalizedChargesVar / featureVarianceAvg;
  }

  static generateModelRecommendations(stats: DatasetStats): ModelRecommendation[] {
    const recommendations: ModelRecommendation[] = [];
    
    // Linear Regression Analysis
    const linearComplexity = stats.dataComplexity === 'low' ? 0.9 : stats.dataComplexity === 'medium' ? 0.7 : 0.5;
    const linearDataSize = stats.totalRecords >= 100 ? 0.8 : 0.6;
    const linearCorrelation = Math.max(...Object.values(stats.featureCorrelations)) > 0.3 ? 0.8 : 0.5;
    const linearScore = (linearComplexity + linearDataSize + linearCorrelation) / 3;
    
    recommendations.push({
      id: 'linear-regression',
      name: 'Linear Regression',
      description: 'Simple and interpretable. Great baseline model for insurance prediction.',
      estimatedAccuracy: Math.min(0.65 + linearScore * 0.2, 0.85),
      complexity: 'Low',
      icon: '📈',
      color: '#3b82f6, #1d4ed8',
      recommendationReason: this.generateLinearReason(stats),
      suitabilityScore: linearScore,
      pros: ['Fast training', 'Highly interpretable', 'Good baseline'],
      cons: ['Assumes linear relationships', 'Limited complexity handling']
    });

    // Random Forest Analysis  
    const rfComplexity = stats.dataComplexity === 'high' ? 0.9 : stats.dataComplexity === 'medium' ? 0.85 : 0.7;
    const rfDataSize = stats.totalRecords >= 500 ? 0.9 : stats.totalRecords >= 100 ? 0.8 : 0.6;
    const rfOutliers = stats.outlierPercentage > 0.1 ? 0.9 : 0.7; // Handles outliers well
    const rfScore = (rfComplexity + rfDataSize + rfOutliers) / 3;
    
    recommendations.push({
      id: 'random-forest',
      name: 'Random Forest',
      description: 'Robust ensemble method. Handles mixed data types excellently.',
      estimatedAccuracy: Math.min(0.75 + rfScore * 0.2, 0.95),
      complexity: 'Medium',
      icon: '🌳',
      color: '#10b981, #047857',
      recommendationReason: this.generateRandomForestReason(stats),
      suitabilityScore: rfScore,
      pros: ['Handles non-linear patterns', 'Robust to outliers', 'Feature importance'],
      cons: ['Less interpretable', 'Can overfit small datasets']
    });

    // XGBoost Analysis
    const xgbComplexity = stats.dataComplexity === 'high' ? 0.95 : stats.dataComplexity === 'medium' ? 0.9 : 0.7;
    const xgbDataSize = stats.totalRecords >= 1000 ? 0.95 : stats.totalRecords >= 500 ? 0.85 : 0.6;
    const xgbFeatures = stats.varianceRatio > 1 ? 0.9 : 0.8; // Good for high-variance targets
    const xgbScore = (xgbComplexity + xgbDataSize + xgbFeatures) / 3;
    
    recommendations.push({
      id: 'xgboost',
      name: 'XGBoost',
      description: 'State-of-the-art gradient boosting. Highest accuracy for tabular data.',
      estimatedAccuracy: Math.min(0.8 + xgbScore * 0.2, 0.98),
      complexity: 'High',
      icon: '⚡',
      color: '#8b5cf6, #6d28d9',
      recommendationReason: this.generateXGBoostReason(stats),
      suitabilityScore: xgbScore,
      pros: ['Highest accuracy potential', 'Handles complex patterns', 'Built-in feature selection'],
      cons: ['Requires hyperparameter tuning', 'Can overfit', 'Less interpretable']
    });

    // Neural Network Analysis
    const nnComplexity = stats.dataComplexity === 'high' ? 0.85 : stats.dataComplexity === 'medium' ? 0.75 : 0.5;
    const nnDataSize = stats.totalRecords >= 2000 ? 0.9 : stats.totalRecords >= 1000 ? 0.7 : 0.4;
    const nnNonLinear = Math.max(...Object.values(stats.featureCorrelations)) < 0.6 ? 0.8 : 0.6;
    const nnScore = (nnComplexity + nnDataSize + nnNonLinear) / 3;
    
    recommendations.push({
      id: 'neural-network',
      name: 'Neural Network',
      description: 'Deep learning approach. Can capture complex non-linear patterns.',
      estimatedAccuracy: Math.min(0.7 + nnScore * 0.25, 0.95),
      complexity: 'High',
      icon: '🧠',
      color: '#f97316, #c2410c',
      recommendationReason: this.generateNeuralNetworkReason(stats),
      suitabilityScore: nnScore,
      pros: ['Captures non-linear patterns', 'Flexible architecture', 'Can handle complex interactions'],
      cons: ['Requires large datasets', 'Black box', 'Prone to overfitting']
    });

    // Sort by suitability score
    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  static generateLinearReason(stats: DatasetStats): string {
    const reasons = [];
    if (stats.dataComplexity === 'low') reasons.push('low data complexity');
    if (stats.totalRecords >= 100) reasons.push('sufficient data size');
    if (Math.max(...Object.values(stats.featureCorrelations)) > 0.3) reasons.push('good linear correlations');
    
    return `Recommended due to ${reasons.join(', ')}. Good baseline choice.`;
  }

  static generateRandomForestReason(stats: DatasetStats): string {
    const reasons = [];
    if (stats.dataComplexity === 'medium' || stats.dataComplexity === 'high') reasons.push('handles complexity well');
    if (stats.totalRecords >= 500) reasons.push('sufficient data for ensemble');
    if (stats.outlierPercentage > 0.1) reasons.push('robust to outliers');
    
    return `Recommended due to ${reasons.join(', ')}. Excellent all-around choice.`;
  }

  static generateXGBoostReason(stats: DatasetStats): string {
    const reasons = [];
    if (stats.totalRecords >= 1000) reasons.push('large dataset benefits boosting');
    if (stats.varianceRatio > 1) reasons.push('high target variance');
    if (stats.dataComplexity === 'high') reasons.push('complex patterns present');
    
    return `Recommended due to ${reasons.join(', ')}. Highest potential accuracy.`;
  }

  static generateNeuralNetworkReason(stats: DatasetStats): string {
    const reasons = [];
    if (stats.totalRecords >= 2000) reasons.push('sufficient data for deep learning');
    if (Math.max(...Object.values(stats.featureCorrelations)) < 0.6) reasons.push('non-linear patterns detected');
    if (stats.dataComplexity === 'high') reasons.push('complex feature interactions');
    
    return `${reasons.length > 0 ? `Recommended due to ${reasons.join(', ')}.` : 'May work but consider other options first.'} Best for complex non-linear patterns.`;
  }

  static analyzeDataset(records: InsuranceRecord[]): DatasetAnalysis {
    const stats = this.calculateStats(records);
    const modelRecommendations = this.generateModelRecommendations(stats);
    const insights = this.generateDatasetInsights(stats);
    
    return {
      stats,
      modelRecommendations,
      insights
    };
  }

  static generateDatasetInsights(stats: DatasetStats): string[] {
    const insights = [];
    
    // Data size insights
    if (stats.totalRecords < 100) {
      insights.push(`⚠️ Small dataset (${stats.totalRecords} records). Consider simpler models.`);
    } else if (stats.totalRecords > 1000) {
      insights.push(`✅ Large dataset (${stats.totalRecords} records). Complex models will benefit.`);
    }
    
    // Feature correlation insights
    const maxCorr = Math.max(...Object.values(stats.featureCorrelations));
    if (maxCorr > 0.5) {
      insights.push(`📈 Strong feature correlations detected (max: ${(maxCorr * 100).toFixed(1)}%). Linear models may work well.`);
    } else {
      insights.push(`🔄 Weak linear correlations (max: ${(maxCorr * 100).toFixed(1)}%). Consider non-linear models.`);
    }
    
    // Data quality insights
    if (stats.dataQuality > 0.9) {
      insights.push(`✅ High data quality score (${(stats.dataQuality * 100).toFixed(1)}%). All models should perform well.`);
    } else if (stats.dataQuality < 0.7) {
      insights.push(`⚠️ Data quality concerns (${(stats.dataQuality * 100).toFixed(1)}%). Consider data cleaning.`);
    }
    
    // Outlier insights
    if (stats.outlierPercentage > 0.15) {
      insights.push(`🔍 High outlier percentage (${(stats.outlierPercentage * 100).toFixed(1)}%). Tree-based models recommended.`);
    }
    
    // Feature-specific insights
    if (stats.smokerPercentage > 0 && stats.featureCorrelations.smoker > 0.5) {
      insights.push(`🚬 Smoking status is a strong predictor (${stats.smokerPercentage.toFixed(1)}% smokers).`);
    }
    
    return insights;
  }

  static findSimilarRecords(
    records: InsuranceRecord[], 
    targetInput: Partial<InsuranceRecord>, 
    limit: number = 5
  ): InsuranceRecord[] {
    const scored = records.map(record => {
      let score = 0;
      
      // Age similarity (within 5 years)
      if (targetInput.age) {
        score += Math.max(0, 5 - Math.abs(record.age - targetInput.age));
      }
      
      // BMI similarity (within 3 points)
      if (targetInput.bmi) {
        score += Math.max(0, 3 - Math.abs(record.bmi - targetInput.bmi));
      }
      
      // Exact matches
      if (targetInput.sex && record.sex === targetInput.sex) score += 10;
      if (targetInput.smoker && record.smoker === targetInput.smoker) score += 15;
      if (targetInput.region && record.region === targetInput.region) score += 5;
      if (targetInput.children !== undefined && record.children === targetInput.children) score += 3;
      
      return { record, score };
    });
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.record);
  }
}