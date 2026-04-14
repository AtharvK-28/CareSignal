import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile } from "../lib/firebase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableApiError = (error: any) => {
  const status = error?.status || error?.error?.status;
  const code = error?.code || error?.error?.code;
  const message = error?.message || error?.error?.message || "";
  return (
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    code === 503 ||
    code === 429 ||
    message.includes("high demand") ||
    message.includes("Quota exceeded")
  );
};

const getRetryDelayMs = (attempt: number) => {
  const base = Math.min(8000, 500 * 2 ** attempt);
  const jitter = Math.floor(Math.random() * 200);
  return base + jitter;
};

const generateContentWithRetry = async (params: any, retries = 3) => {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      lastError = error;
      if (!isRetryableApiError(error) || attempt === retries) {
        throw error;
      }
      await sleep(getRetryDelayMs(attempt));
    }
  }
  throw lastError;
};

const formatReportDate = (report: any) => {
  const createdAt = report?.createdAt;
  if (!createdAt) return new Date().toISOString().slice(0, 10);
  if (typeof createdAt === "string") return createdAt.slice(0, 10);
  if (createdAt?.seconds) return new Date(createdAt.seconds * 1000).toISOString().slice(0, 10);
  if (typeof createdAt?.toDate === "function") {
    return createdAt.toDate().toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
};

const buildFallbackClinicalReport = (reports: any[], profile?: UserProfile | null): ClinicalReport => {
  const timeline =
    reports && reports.length > 0
      ? reports.slice(0, 10).map((r: any) => {
          const urgency = r?.urgency || "Medium";
          const severity =
            typeof r?.severity === "number"
              ? r.severity
              : urgency === "High"
              ? 8
              : urgency === "Low"
              ? 3
              : 5;
          return {
            date: formatReportDate(r),
            symptoms: r?.primaryComplaint || "Reported symptoms",
            severity,
            trend: "Stable",
          };
        })
      : [
          {
            date: new Date().toISOString().slice(0, 10),
            symptoms: "No prior reports available",
            severity: 0,
            trend: "Stable",
          },
        ];

  const ageNote = profile?.dob ? `DOB: ${profile.dob}` : "DOB not provided";

  return {
    summary:
      "Clinical report generated without AI analysis due to temporary service limits. Please review patient history manually.",
    symptomTimeline: timeline,
    keyRiskIndicators: [
      "Automated AI analysis unavailable",
      ageNote,
    ],
    clinicalSignals: [
      {
        title: "AI Unavailable",
        description: "The AI service was temporarily unavailable or rate-limited.",
        level: "Stable",
      },
    ],
    recommendationForDoctor:
      "Review the symptom timeline and patient profile, and consider follow-up questions to clarify symptoms, duration, and severity.",
  };
};

export interface TriageResult {
  urgency: "Low" | "Medium" | "High";
  whatMightHave: string;
  whatsHappening: string;
  medicalTerms: Record<string, string>;
  actionPlan: {
    rightNow: string;
    next2To4Hours: string;
    after6Hours: string;
    recoveryTimeline: string;
  };
  homeCare: string[];
  nutrition: {
    deficiencies: string[];
    foodSuggestions: string[];
  };
  dehydrationCheck: {
    riskLevel: string;
    signs: string[];
    actions: string[];
  };
  doctorPrep: {
    whatToTell: string[];
    questionsToAsk: string[];
  };
  testsToGet: {
    testName: string;
    reason: string;
  }[];
  localRouting: {
    labs: string[];
    doctors: string[];
  };
  medicationGuidance: {
    consider: string[];
    avoid: string[];
    disclaimer: string;
  };
  redFlags: {
    symptoms: string[];
    action: string;
  };
  lifestyle: {
    activity: string;
    sleep: string;
    environment: string;
  };
  nextSteps: string[];
  prognosis: string;
  risksOfInaction: string;
}

export interface CheckInAnalysis {
  trend: "Improving" | "Stable" | "Worsening";
  followUpQuestions: string[];
  updatedUrgency: "Low" | "Medium" | "High";
  reasoning: string;
}

export interface FollowUpQuestion {
  question: string;
  options: string[];
}

export interface ClinicalReport {
  summary: string;
  symptomTimeline: {
    date: string;
    symptoms: string;
    severity: number;
    trend: string;
  }[];
  keyRiskIndicators: string[];
  clinicalSignals: {
    title: string;
    description: string;
    level: "Critical" | "Warning" | "Stable";
  }[];
  recommendationForDoctor: string;
}

export const geminiService = {
  async generateClinicalSummary(reports: any[], profile?: UserProfile | null): Promise<ClinicalReport> {
    try {
      const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: `Generate a concise, structured, and clinically useful report for a healthcare professional based on the following patient data.
        
        Patient Profile: ${JSON.stringify(profile || "Not provided")}
        Historical Reports (last 10): ${JSON.stringify(reports)}

        Requirements:
        1. Summary: A brief clinical overview of the current status.
        2. Symptom Timeline: A chronological list of key symptom events, including date, symptoms, severity (1-10), and trend (Improving/Stable/Worsening).
        3. Key Risk Indicators: List any specific risk factors identified (e.g., age, history, specific symptom combinations).
        4. Clinical Signals: Identify worsening trends, recurring issues, or critical red flags. Assign a level: "Critical", "Warning", or "Stable".
        5. Recommendation: A specific note for the doctor on what to focus on or investigate.

        Return the result as a JSON object matching the ClinicalReport interface.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              symptomTimeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    symptoms: { type: Type.STRING },
                    severity: { type: Type.NUMBER },
                    trend: { type: Type.STRING }
                  },
                  required: ["date", "symptoms", "severity", "trend"]
                }
              },
              keyRiskIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              clinicalSignals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    level: { type: Type.STRING, enum: ["Critical", "Warning", "Stable"] }
                  },
                  required: ["title", "description", "level"]
                }
              },
              recommendationForDoctor: { type: Type.STRING }
            },
            required: ["summary", "symptomTimeline", "keyRiskIndicators", "clinicalSignals", "recommendationForDoctor"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to generate clinical summary, using fallback", e);
      return buildFallbackClinicalReport(reports, profile);
    }
  },

  async getFollowUpQuestions(primaryComplaint: string): Promise<FollowUpQuestion[]> {
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: `The user's primary complaint is: "${primaryComplaint}". 
      Generate 5-7 targeted yes/no follow-up questions to thoroughly check for life-threatening combinations, red flags, or to narrow down the condition.
      Focus on associated symptoms, onset characteristics, and risk factors.
      Return the result as a JSON array of objects with "question" and "options" (always ["Yes", "No"]).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["question", "options"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse follow-up questions", e);
      return [];
    }
  },

  async getTriageResult(data: {
    primaryComplaint?: string;
    severity?: number;
    duration?: string;
    medicalHistory?: string;
    age?: string;
    followUps?: { question: string; answer: string }[];
    voiceSummary?: string;
    images?: { data: string; mimeType: string }[];
    language?: string;
  }): Promise<TriageResult> {
    const context = data.voiceSummary 
      ? `Voice Triage Summary: ${data.voiceSummary}` 
      : `
      - Primary Complaint: ${data.primaryComplaint}
      - Patient Age: ${data.age}
      - Medical History: ${data.medicalHistory}
      - Severity (1-10): ${data.severity}
      - Duration: ${data.duration}
      - Follow-up Answers: ${data.followUps?.map(f => `${f.question}: ${f.answer}`).join(", ")}
      `;

    const prompt = `
      Perform a comprehensive medical triage assessment based on the following data:
      ${context}

      ${data.images && data.images.length > 0 ? "IMPORTANT: I have attached images of the visible symptoms. Analyze these images carefully for signs of inflammation, infection, rashes, or other clinical indicators and incorporate your visual findings into the 'whatMightHave' and 'whatsHappening' sections." : ""}

      Provide a detailed, professional triage report in JSON format.
      IMPORTANT: All text fields in the JSON response MUST be in ${data.language || "English"}.
      - urgency: "Low", "Medium", or "High" (Keep these exact English keywords for the enum).
      - whatMightHave: A detailed explanation of potential causes.
      - whatsHappening: A scientific but accessible explanation of the physiological process.
      - medicalTerms: A dictionary where keys are complex medical terms used in the above two fields, and values are very simple, 1-sentence definitions for a layperson.
      - actionPlan: Specific, time-based guidance (rightNow, next2To4Hours, after6Hours, recoveryTimeline).
      - homeCare: List of specific self-care steps.
      - nutrition: Object with "deficiencies" (potential nutrient gaps) and "foodSuggestions" (specific foods to eat/avoid).
      - dehydrationCheck: Object with "riskLevel" (Low/Med/High), "signs" (what to look for), and "actions" (how to check/fix).
      - doctorPrep: Object with "whatToTell" (key points for the doctor) and "questionsToAsk" (specific questions for the patient).
      - testsToGet: Array of objects with "testName" and "reason".
      - localRouting: List of types of labs and specific specialists (e.g., "Gastroenterologist") to consult.
      - prognosis: A general expected recovery timeline or common outcomes based on the symptoms and severity. Frame this as AI-generated information, not a diagnosis.
      - risksOfInaction: A clear explanation of the potential risks or complications if the user does NOT follow the suggested action plan or fails to seek medical attention.

      DISCLAIMER: This is for informational purposes only.
    `;

    const contents: any[] = [{ text: prompt }];
    if (data.images && data.images.length > 0) {
      data.images.forEach(img => {
        contents.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      });
    }

    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            whatMightHave: { type: Type.STRING },
            whatsHappening: { type: Type.STRING },
            actionPlan: {
              type: Type.OBJECT,
              properties: {
                rightNow: { type: Type.STRING },
                next2To4Hours: { type: Type.STRING },
                after6Hours: { type: Type.STRING },
                recoveryTimeline: { type: Type.STRING }
              },
              required: ["rightNow", "next2To4Hours", "after6Hours", "recoveryTimeline"]
            },
            homeCare: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutrition: { 
              type: Type.OBJECT,
              properties: {
                deficiencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                foodSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["deficiencies", "foodSuggestions"]
            },
            dehydrationCheck: {
              type: Type.OBJECT,
              properties: {
                riskLevel: { type: Type.STRING },
                signs: { type: Type.ARRAY, items: { type: Type.STRING } },
                actions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["riskLevel", "signs", "actions"]
            },
            doctorPrep: {
              type: Type.OBJECT,
              properties: {
                whatToTell: { type: Type.ARRAY, items: { type: Type.STRING } },
                questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["whatToTell", "questionsToAsk"]
            },
            testsToGet: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  testName: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["testName", "reason"]
              }
            },
            localRouting: {
              type: Type.OBJECT,
              properties: {
                labs: { type: Type.ARRAY, items: { type: Type.STRING } },
                doctors: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["labs", "doctors"]
            },
            medicationGuidance: {
              type: Type.OBJECT,
              properties: {
                consider: { type: Type.ARRAY, items: { type: Type.STRING } },
                avoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                disclaimer: { type: Type.STRING }
              },
              required: ["consider", "avoid", "disclaimer"]
            },
            redFlags: {
              type: Type.OBJECT,
              properties: {
                symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                action: { type: Type.STRING }
              },
              required: ["symptoms", "action"]
            },
            lifestyle: {
              type: Type.OBJECT,
              properties: {
                activity: { type: Type.STRING },
                sleep: { type: Type.STRING },
                environment: { type: Type.STRING }
              },
              required: ["activity", "sleep", "environment"]
            },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            prognosis: { type: Type.STRING },
            risksOfInaction: { type: Type.STRING },
            medicalTerms: {
              type: Type.OBJECT,
              additionalProperties: { type: Type.STRING },
              description: "A dictionary of complex medical terms used in whatMightHave and whatsHappening, with simple definitions."
            }
          },
          required: ["urgency", "whatMightHave", "whatsHappening", "actionPlan", "homeCare", "nutrition", "dehydrationCheck", "doctorPrep", "testsToGet", "localRouting", "medicationGuidance", "redFlags", "lifestyle", "nextSteps", "medicalTerms", "prognosis", "risksOfInaction"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse triage result", e);
      throw new Error("Failed to generate triage report");
    }
  },

  createChat() {
    return ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are CareSignal AI, a professional healthcare triage assistant. 
        Your goal is to help users understand their symptoms through a conversational interface.
        Be empathetic, professional, and thorough.
        Ask one question at a time to gather information about:
        1. Primary complaint
        2. Age and medical history
        3. Severity and duration
        4. Associated symptoms (red flags)
        
        Once you have enough information, provide a summary and a preliminary triage assessment (Low/Medium/High urgency) with clear next steps.
        Always include a medical disclaimer: "I am an AI, not a doctor. In an emergency, call 911 immediately."`
      }
    });
  },

  async generateSpeech(text: string): Promise<string | null> {
    try {
      const response = await generateContentWithRetry({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `[SPEED: FAST] [TONE: NATURAL] ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  },

  async connectLive(callbacks: {
    onopen?: () => void;
    onmessage: (message: any) => void;
    onerror?: (error: any) => void;
    onclose?: () => void;
  }, isTriage: boolean = false) {
    return ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
        },
        tools: isTriage ? [
          {
            functionDeclarations: [
              {
                name: "complete_triage",
                description: "Call this when you have gathered all necessary information (primary complaint, age, history, severity, duration, red flags) and are ready to finalize the triage assessment.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING, description: "A brief summary of the user's condition and symptoms discussed." }
                  },
                  required: ["summary"]
                }
              }
            ]
          }
        ] : [],
        systemInstruction: isTriage ? 
        `You are CareSignal AI, a professional healthcare triage assistant. 
        Your goal is to conduct a thorough triage assessment via voice.
        
        Follow these steps:
        1. Empathize with the user's situation.
        2. Ask about the primary complaint if not already clear.
        3. Ask about age and relevant medical history.
        4. Ask about severity (1-10) and duration.
        5. Screen for critical red flags (chest pain, difficulty breathing, sudden weakness, etc.).
        
        Ask ONE question at a time. Be concise but thorough.
        
        Once you have all the information, you MUST call the 'complete_triage' tool immediately. 
        Do not wait for the user to ask for the report. Once you have enough info to form a summary, call it.
        Before calling it, tell the user: "I have gathered all the necessary information. I'm now generating your personalized triage report. Please wait a moment."
        
        Medical Disclaimer: Always remind the user you are an AI, not a doctor. In an emergency, call 911.`
        : 
        `You are CareSignal AI, a helpful and empathetic health companion. 
        Your goal is to have a natural, supportive conversation with the user about their general health and wellness.
        
        Guidelines:
        - Be conversational and warm.
        - You can answer general health questions, explain medical terms, or just provide emotional support.
        - DO NOT follow a strict triage checklist unless the user specifically asks for an assessment.
        - If the user seems to have a serious medical issue, gently suggest they use the "Voice Triage" feature for a formal report or see a doctor.
        - Keep responses concise and optimized for voice interaction.
        
        Medical Disclaimer: Always remind the user you are an AI, not a doctor.`,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
    });
  },

  async searchAllNearbyResources(location?: { lat: number, lng: number } | string): Promise<{ doctors: any[], labs: any[] }> {
    const locationContext = typeof location === 'string' ? `near PIN code ${location}` : location ? `near coordinates ${location.lat}, ${location.lng}` : 'nearby';
    
    const response = await generateContentWithRetry({
      model: "gemini-3-flash-preview",
      contents: `Find 5 Doctors/Specialists and 5 Diagnostic Labs ${locationContext}. Provide results in a JSON object with two arrays: "doctors" and "labs". Each object should have "name", "address", "phone", "rating", and "distance".`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            doctors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  address: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  rating: { type: Type.STRING },
                  distance: { type: Type.STRING }
                },
                required: ["name", "address"]
              }
            },
            labs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  address: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  rating: { type: Type.STRING },
                  distance: { type: Type.STRING }
                },
                required: ["name", "address"]
              }
            }
          },
          required: ["doctors", "labs"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{"doctors": [], "labs": []}');
    } catch (e) {
      console.error("Failed to parse combined nearby resources", e);
      return { doctors: [], labs: [] };
    }
  },

  async searchNearbyMedicalResources(query: string, location?: { lat: number, lng: number } | string): Promise<any[]> {
    const locationContext = typeof location === 'string' ? `near PIN code ${location}` : location ? `near coordinates ${location.lat}, ${location.lng}` : 'nearby';
    const fullQuery = `${query} ${locationContext} with phone numbers and addresses`;
    
    const response = await generateContentWithRetry({
      model: "gemini-3-flash-preview",
      contents: `Find 5 ${fullQuery}. Provide results in a JSON array of objects with "name", "address", "phone", "rating", and "distance" (if available).`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              phone: { type: Type.STRING },
              rating: { type: Type.STRING },
              distance: { type: Type.STRING }
            },
            required: ["name", "address"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse nearby resources", e);
      return [];
    }
  },

  async analyzeCheckIn(data: {
    previousReport: any;
    currentSymptoms: string;
    currentSeverity: number;
    daysSinceLastReport: number;
  }): Promise<CheckInAnalysis> {
    const response = await generateContentWithRetry({
      model: "gemini-3-flash-preview",
      contents: `Analyze a medical check-in.
      Previous Report: ${JSON.stringify(data.previousReport)}
      Current Symptoms: "${data.currentSymptoms}"
      Current Severity: ${data.currentSeverity}/10
      Days since last report: ${data.daysSinceLastReport}

      Evaluate if the user is Improving, Stable, or Worsening.
      Generate 3 specific follow-up questions for this check-in.
      Determine if the urgency level should change.
      Provide brief reasoning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trend: { type: Type.STRING, enum: ["Improving", "Stable", "Worsening"] },
            followUpQuestions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            updatedUrgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            reasoning: { type: Type.STRING }
          },
          required: ["trend", "followUpQuestions", "updatedUrgency", "reasoning"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse check-in analysis", e);
      throw e;
    }
  }
};
