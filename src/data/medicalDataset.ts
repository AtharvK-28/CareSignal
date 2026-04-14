
export interface MedicalCondition {
  id: string;
  name: string;
  commonSymptoms: string[];
  urgency: 'Low' | 'Medium' | 'High';
  prevalence: number; // percentage in general population
  riskFactors: string[];
}

export const SYMPTOM_DATASET: MedicalCondition[] = [
  {
    id: 'common_cold',
    name: 'Common Cold',
    commonSymptoms: ['cough', 'runny nose', 'sore throat', 'sneezing', 'congestion', 'mild headache'],
    urgency: 'Low',
    prevalence: 15.0,
    riskFactors: ['winter season', 'weak immune system']
  },
  {
    id: 'influenza',
    name: 'Influenza (Flu)',
    commonSymptoms: ['fever', 'chills', 'muscle aches', 'fatigue', 'cough', 'sweating', 'weakness'],
    urgency: 'Medium',
    prevalence: 5.0,
    riskFactors: ['unvaccinated', 'crowded places']
  },
  {
    id: 'migraine',
    name: 'Migraine',
    commonSymptoms: ['headache', 'nausea', 'sensitivity to light', 'throbbing pain', 'aura', 'dizziness'],
    urgency: 'Medium',
    prevalence: 12.0,
    riskFactors: ['stress', 'hormonal changes', 'certain foods']
  },
  {
    id: 'food_poisoning',
    name: 'Food Poisoning',
    commonSymptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach cramps', 'fever', 'weakness'],
    urgency: 'Medium',
    prevalence: 3.0,
    riskFactors: ['contaminated food', 'poor hygiene']
  },
  {
    id: 'appendicitis',
    name: 'Appendicitis',
    commonSymptoms: ['sharp abdominal pain', 'fever', 'loss of appetite', 'nausea', 'rebound tenderness', 'vomiting'],
    urgency: 'High',
    prevalence: 0.1,
    riskFactors: ['age 10-30']
  },
  {
    id: 'angina',
    name: 'Angina / Heart Issue',
    commonSymptoms: ['chest pain', 'shortness of breath', 'pressure in chest', 'arm pain', 'jaw pain', 'sweating'],
    urgency: 'High',
    prevalence: 2.0,
    riskFactors: ['smoking', 'high blood pressure', 'diabetes', 'age > 50']
  },
  {
    id: 'dehydration',
    name: 'Dehydration',
    commonSymptoms: ['extreme thirst', 'dark urine', 'dizziness', 'dry mouth', 'confusion', 'fatigue'],
    urgency: 'Medium',
    prevalence: 4.0,
    riskFactors: ['heat exposure', 'low fluid intake', 'fever']
  },
  {
    id: 'allergic_rhinitis',
    name: 'Allergic Rhinitis',
    commonSymptoms: ['sneezing', 'itchy eyes', 'runny nose', 'congestion', 'watery eyes'],
    urgency: 'Low',
    prevalence: 20.0,
    riskFactors: ['pollen', 'dust mites', 'pet dander']
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    commonSymptoms: ['productive cough', 'chest pain', 'fever', 'shortness of breath', 'chills', 'fatigue'],
    urgency: 'High',
    prevalence: 1.5,
    riskFactors: ['smoking', 'chronic lung disease', 'age > 65']
  },
  {
    id: 'asthma_attack',
    name: 'Asthma Attack',
    commonSymptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'coughing', 'rapid breathing'],
    urgency: 'High',
    prevalence: 8.0,
    riskFactors: ['allergies', 'exercise', 'cold air', 'pollution']
  },
  {
    id: 'uti',
    name: 'Urinary Tract Infection',
    commonSymptoms: ['burning urination', 'frequent urination', 'pelvic pain', 'cloudy urine', 'strong-smelling urine'],
    urgency: 'Medium',
    prevalence: 10.0,
    riskFactors: ['female gender', 'diabetes', 'kidney stones']
  },
  {
    id: 'anxiety_attack',
    name: 'Anxiety / Panic Attack',
    commonSymptoms: ['palpitations', 'shortness of breath', 'trembling', 'fear of dying', 'sweating', 'chest tightness'],
    urgency: 'Medium',
    prevalence: 3.0,
    riskFactors: ['stress', 'history of anxiety', 'caffeine']
  },
  {
    id: 'strep_throat',
    name: 'Strep Throat',
    commonSymptoms: ['severe sore throat', 'fever', 'swollen lymph nodes', 'white patches on tonsils', 'painful swallowing'],
    urgency: 'Medium',
    prevalence: 2.0,
    riskFactors: ['contact with infected person', 'school-age children']
  },
  {
    id: 'concussion',
    name: 'Concussion',
    commonSymptoms: ['headache', 'confusion', 'dizziness', 'nausea', 'blurred vision', 'memory loss'],
    urgency: 'High',
    prevalence: 0.5,
    riskFactors: ['head trauma', 'sports injuries', 'falls']
  },
  {
    id: 'bronchitis',
    name: 'Acute Bronchitis',
    commonSymptoms: ['persistent cough', 'mucus production', 'fatigue', 'shortness of breath', 'chest discomfort'],
    urgency: 'Medium',
    prevalence: 4.5,
    riskFactors: ['smoking', 'recent viral infection', 'air irritants']
  },
  {
    id: 'kidney_stones',
    name: 'Kidney Stones',
    commonSymptoms: ['severe side pain', 'back pain', 'blood in urine', 'nausea', 'vomiting', 'painful urination'],
    urgency: 'High',
    prevalence: 1.0,
    riskFactors: ['dehydration', 'high-protein diet', 'family history']
  },
  {
    id: 'gerd',
    name: 'GERD (Acid Reflux)',
    commonSymptoms: ['heartburn', 'chest pain', 'difficulty swallowing', 'regurgitation', 'sensation of lump in throat'],
    urgency: 'Low',
    prevalence: 18.0,
    riskFactors: ['obesity', 'pregnancy', 'smoking', 'large meals']
  },
  {
    id: 'sinusitis',
    name: 'Sinusitis',
    commonSymptoms: ['facial pain', 'pressure', 'nasal congestion', 'thick mucus', 'headache', 'reduced sense of smell'],
    urgency: 'Low',
    prevalence: 12.0,
    riskFactors: ['allergies', 'nasal polyps', 'deviated septum']
  },
  {
    id: 'meningitis',
    name: 'Meningitis',
    commonSymptoms: ['stiff neck', 'high fever', 'severe headache', 'sensitivity to light', 'confusion', 'skin rash'],
    urgency: 'High',
    prevalence: 0.01,
    riskFactors: ['unvaccinated', 'close quarters', 'weak immune system']
  },
  {
    id: 'stroke',
    name: 'Stroke',
    commonSymptoms: ['facial drooping', 'arm weakness', 'speech difficulty', 'sudden confusion', 'vision loss', 'severe headache'],
    urgency: 'High',
    prevalence: 0.7,
    riskFactors: ['high blood pressure', 'smoking', 'diabetes', 'age > 55']
  },
  {
    id: 'rotator_cuff_injury',
    name: 'Rotator Cuff Injury',
    commonSymptoms: ['shoulder pain', 'arm weakness', 'difficulty lifting arm', 'shoulder clicking', 'pain at night'],
    urgency: 'Medium',
    prevalence: 4.0,
    riskFactors: ['repetitive overhead motion', 'age > 40', 'heavy lifting']
  },
  {
    id: 'sciatica',
    name: 'Sciatica',
    commonSymptoms: ['lower back pain', 'leg pain', 'numbness', 'tingling', 'weakness in leg'],
    urgency: 'Medium',
    prevalence: 5.0,
    riskFactors: ['sedentary lifestyle', 'obesity', 'ageing']
  },
  {
    id: 'carpal_tunnel',
    name: 'Carpal Tunnel Syndrome',
    commonSymptoms: ['wrist pain', 'numbness in fingers', 'tingling', 'weak grip', 'hand weakness'],
    urgency: 'Low',
    prevalence: 3.0,
    riskFactors: ['repetitive hand motions', 'pregnancy', 'diabetes']
  },
  {
    id: 'sprained_ankle',
    name: 'Sprained Ankle',
    commonSymptoms: ['ankle pain', 'swelling', 'bruising', 'limited range of motion', 'instability'],
    urgency: 'Low',
    prevalence: 10.0,
    riskFactors: ['sports', 'uneven surfaces', 'previous sprains']
  }
];

export const HISTORICAL_TRENDS_DATA = [
  { month: 'Jan', respiratory: 45, digestive: 12, neurological: 8, cardiac: 5 },
  { month: 'Feb', respiratory: 42, digestive: 15, neurological: 10, cardiac: 4 },
  { month: 'Mar', respiratory: 35, digestive: 18, neurological: 12, cardiac: 6 },
  { month: 'Apr', respiratory: 25, digestive: 22, neurological: 15, cardiac: 7 },
  { month: 'May', respiratory: 15, digestive: 25, neurological: 14, cardiac: 5 },
  { month: 'Jun', respiratory: 10, digestive: 28, neurological: 11, cardiac: 4 },
  { month: 'Jul', respiratory: 8, digestive: 30, neurological: 9, cardiac: 5 },
  { month: 'Aug', respiratory: 12, digestive: 26, neurological: 10, cardiac: 6 },
  { month: 'Sep', respiratory: 20, digestive: 20, neurological: 13, cardiac: 8 },
  { month: 'Oct', respiratory: 30, digestive: 16, neurological: 15, cardiac: 7 },
  { month: 'Nov', respiratory: 40, digestive: 14, neurological: 12, cardiac: 5 },
  { month: 'Dec', respiratory: 48, digestive: 11, neurological: 9, cardiac: 4 },
];
