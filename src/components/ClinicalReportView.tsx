import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Share2, 
  Download, 
  ChevronRight, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  User,
  Activity,
  Stethoscope,
  ArrowLeft,
  Printer
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { ClinicalReport } from '@/services/geminiService';
import { UserProfile } from '@/lib/firebase';

interface ClinicalReportViewProps {
  report: ClinicalReport;
  profile?: UserProfile | null;
  onBack: () => void;
}

export function ClinicalReportView({ report, profile, onBack }: ClinicalReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CareSignal Clinical Report',
          text: `Clinical Summary: ${report.summary}\n\nRecommendation: ${report.recommendationForDoctor}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard if share fails or is cancelled
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `CLINICAL REPORT - CARESIGNAL\n\nSummary: ${report.summary}\n\nRecommendation: ${report.recommendationForDoctor}\n\nView full report: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    alert('Report summary and link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 h-9">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button size="sm" onClick={handleShare} className="gap-2 h-9 bg-blue-600 hover:bg-blue-700">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-8" ref={reportRef}>
        {/* Report Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl text-white mb-2">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Triage Summary</h1>
          <p className="text-slate-500 text-sm">Generated on {new Date().toLocaleDateString()} • For Healthcare Professionals</p>
        </div>

        {/* Patient Info */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <div className="bg-slate-900 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <User className="h-4 w-4 opacity-70" />
              <span className="text-xs font-bold uppercase tracking-wider">Patient Identification</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">ID: {profile?.uid.slice(0, 8) || 'ANON'}</span>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Age/DOB</p>
                <p className="text-sm font-bold text-slate-800">{profile?.dob || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</p>
                <p className="text-sm font-bold text-slate-800">{profile?.bloodGroup || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                <p className="text-sm font-bold text-slate-800 truncate">{profile?.location || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-sm font-bold text-slate-800">Active Monitoring</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Allergies</p>
                <p className="text-sm font-bold text-red-600">{profile?.allergies || 'None reported'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Care Physician</p>
                <p className="text-sm font-bold text-slate-800">
                  {profile?.primaryCarePhysician?.name || 'Not provided'} 
                  {profile?.primaryCarePhysician?.contact && ` (${profile.primaryCarePhysician.contact})`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Clinical Overview</h2>
          </div>
          <Card className="border-l-4 border-l-blue-600 shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-700 leading-relaxed italic">
                "{report.summary}"
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Clinical Signals & Red Flags */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-slate-900">Clinical Signals & Risk Indicators</h2>
          </div>
          <div className="grid gap-4">
            {report.clinicalSignals.map((signal, i) => (
              <Card key={i} className={cn(
                "border-none shadow-sm",
                signal.level === 'Critical' ? "bg-red-50" : signal.level === 'Warning' ? "bg-amber-50" : "bg-slate-50"
              )}>
                <CardContent className="p-4 flex gap-4">
                  <div className={cn(
                    "p-2 rounded-xl h-fit",
                    signal.level === 'Critical' ? "bg-red-100 text-red-600" : signal.level === 'Warning' ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-600"
                  )}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{signal.title}</h3>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter",
                        signal.level === 'Critical' ? "bg-red-600 text-white" : signal.level === 'Warning' ? "bg-amber-500 text-white" : "bg-slate-400 text-white"
                      )}>
                        {signal.level}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{signal.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Risk Factors</h4>
            <div className="flex flex-wrap gap-2">
              {report.keyRiskIndicators.map((risk, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                  {risk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Symptom Timeline */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Activity className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Symptom Progression Timeline</h2>
          </div>
          <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {report.symptomTimeline.map((item, i) => (
              <div key={i} className="relative pl-10">
                <div className={cn(
                  "absolute left-2 top-1.5 h-4 w-4 rounded-full border-4 border-white shadow-sm z-10",
                  item.trend === 'Worsening' ? "bg-red-500" : item.trend === 'Improving' ? "bg-emerald-500" : "bg-blue-500"
                )} />
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Severity:</span>
                      <span className={cn(
                        "text-xs font-black",
                        item.severity >= 7 ? "text-red-600" : item.severity >= 4 ? "text-amber-600" : "text-emerald-600"
                      )}>{item.severity}/10</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{item.symptoms}</p>
                  <div className="flex items-center gap-1.5">
                    {item.trend === 'Worsening' ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : item.trend === 'Improving' ? (
                      <TrendingDown className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Minus className="h-3 w-3 text-blue-500" />
                    )}
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      item.trend === 'Worsening' ? "text-red-500" : item.trend === 'Improving' ? "text-emerald-500" : "text-blue-500"
                    )}>{item.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation for Doctor */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Stethoscope className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Clinical Recommendation</h2>
          </div>
          <Card className="bg-emerald-600 text-white border-none shadow-lg shadow-emerald-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 opacity-80">
                <Stethoscope className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Note for Healthcare Provider</span>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {report.recommendationForDoctor}
              </p>
              <div className="pt-4 border-t border-white/20 text-[10px] opacity-70 flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                <span>This report is AI-generated based on patient-reported symptoms and historical data.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center space-y-4 pt-8 border-t">
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest px-8">
            CONFIDENTIAL MEDICAL INFORMATION • FOR CLINICAL USE ONLY <br/>
            CareSignal AI Triage Support System
          </p>
          <div className="flex justify-center gap-4 print:hidden">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
              Terms of Service
            </Button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; }
          .min-h-screen { background: white; }
          .container { max-width: 100%; padding: 0; }
          .shadow-sm, .shadow-2xl, .shadow-lg { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .bg-slate-50 { background: white !important; }
          .bg-blue-600 { background: #2563eb !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-emerald-600 { background: #059669 !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-slate-900 { background: #0f172a !important; color: white !important; -webkit-print-color-adjust: exact; }
          button, .print-hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
