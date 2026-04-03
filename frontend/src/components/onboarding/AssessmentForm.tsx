"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, HelpCircle, Save } from "lucide-react";
import type { QuestionnaireDefinition } from "@/data/questionnaires";
import { calculateScores } from "@/data/questionnaires";

const QUESTION_TOOLTIPS: Record<string, string> = {
  hads_1: "This asks if you generally feel tense or wound up — like butterflies or a tight chest.",
  hads_2: "Think about activities you used to enjoy — can you still find pleasure in them?",
  hads_3: "Do you often feel like something bad is going to happen, even when there's no reason?",
  hads_4: "Can you still see humor in things and laugh at funny moments?",
  hads_5: "Do thoughts keep spinning in your mind and you can't stop them?",
  hads_6: "Do you generally feel happy and in good spirits?",
  hads_7: "When you sit down, can you relax comfortably?",
  hads_8: "Do you feel like everything takes longer or you're moving in slow motion?",
  hads_9: "Do you sometimes get a sudden feeling of nervousness or butterflies?",
  hads_10: "Have you stopped caring about how you look or what you wear?",
  hads_11: "Do you feel restless, like you need to keep moving or fidgeting?",
  hads_12: "Can you look forward to things with enjoyment?",
  hads_13: "Do you get sudden waves of panic for no clear reason?",
  hads_14: "Can you settle down and enjoy a book, TV show, or podcast?",
  phq_1: "Have you lost interest or pleasure in things you normally enjoy?",
  phq_2: "Have you been feeling sad, down, or hopeless?",
  phq_3: "Have you had trouble sleeping — either too much or too little?",
  phq_4: "Do you feel tired or have very little energy, even after resting?",
  phq_5: "Has your appetite changed — eating too much or too little?",
  phq_6: "Do you feel bad about yourself, or feel like you've let people down?",
  phq_7: "Have you had trouble focusing — like reading or watching TV?",
  phq_8: "Have others noticed you moving/speaking slowly, or being extra restless?",
  phq_9: "Important question about thoughts of self-harm. Please answer honestly — your response is confidential.",
  gad_1: "Do you feel nervous, anxious, or on edge frequently?",
  gad_2: "Is it hard to stop yourself from worrying?",
  gad_3: "Do you worry about many different things at once?",
  gad_4: "Do you find it hard to relax, even when you have free time?",
  gad_5: "Are you so restless that it's hard to sit still?",
  gad_6: "Do little things make you more irritable or annoyed than usual?",
  gad_7: "Do you often feel afraid, like something terrible might happen?",
  pss_1: "Think about times when something unexpected happened — how upset did it make you?",
  pss_2: "Do you feel like the important things in your life are outside your control?",
  pss_3: "How often have you felt nervous and stressed?",
  pss_4: "How confident do you feel about handling your personal problems?",
  pss_5: "Do you feel that things are generally going well for you?",
  pss_6: "Do you feel overwhelmed by all the things you need to do?",
  pss_7: "Are you able to manage the little annoyances in daily life?",
  pss_8: "Do you feel like you're on top of things and managing well?",
  pss_9: "Have you felt angry about things you can't control?",
  pss_10: "Do you feel like problems are piling up too high to handle?",
};

interface AssessmentFormProps {
  questionnaire: QuestionnaireDefinition;
  onComplete: (responses: Record<string, number>, totalScore: number, subscaleScores?: Record<string, number>) => void;
  isSubmitting?: boolean;
}

const QUESTIONS_PER_PAGE = 5;
const AUTOSAVE_KEY = "assessment_autosave";

const AssessmentForm = ({ questionnaire, onComplete, isSubmitting }: AssessmentFormProps) => {
  const loadSaved = (): Record<string, number> => {
    try {
      const saved = localStorage.getItem(`${AUTOSAVE_KEY}_${questionnaire.id}`);
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      // Only restore if the saved keys belong to this questionnaire
      const validIds = new Set(questionnaire.questions.map(q => q.id));
      const filtered: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (validIds.has(k)) filtered[k] = v as number;
      }
      return filtered;
    } catch { return {}; }
  };

  const [responses, setResponses] = useState<Record<string, number>>(loadSaved);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Reset state when questionnaire changes (e.g. HADS -> PHQ-9)
  useEffect(() => {
    setCurrentPage(0);
    setResponses(loadSaved());
    setLastSaved(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questionnaire.id]);

  const totalQuestions = questionnaire.questions.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const startIdx = currentPage * QUESTIONS_PER_PAGE;
  const pageQuestions = questionnaire.questions.slice(startIdx, startIdx + QUESTIONS_PER_PAGE);

  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const allPageAnswered = pageQuestions.every((q) => responses[q.id] !== undefined);
  const allAnswered = answeredCount === totalQuestions;

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(responses).length > 0) {
        localStorage.setItem(`${AUTOSAVE_KEY}_${questionnaire.id}`, JSON.stringify(responses));
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [responses, questionnaire.id]);

  // Save on every response change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem(`${AUTOSAVE_KEY}_${questionnaire.id}`, JSON.stringify(responses));
    }
  }, [responses, questionnaire.id]);

  const handleSelect = (questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const { total, subscales } = calculateScores(questionnaire, responses);
    localStorage.removeItem(`${AUTOSAVE_KEY}_${questionnaire.id}`);
    onComplete(responses, total, subscales);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl">{questionnaire.title}</CardTitle>
        <CardDescription>{questionnaire.description}</CardDescription>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{answeredCount} of {totalQuestions} answered</span>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Save className="w-3 h-3" /> Auto-saved
                </span>
              )}
              <span>Page {currentPage + 1} of {totalPages}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground italic">{questionnaire.instructions}</p>
        </div>

        <TooltipProvider delayDuration={300}>
          <div className="space-y-6">
            {pageQuestions.map((question, idx) => {
              const tooltip = QUESTION_TOOLTIPS[question.id];
              return (
                <div key={question.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-start gap-2 mb-3">
                    <p className="font-medium text-foreground flex-1">
                      <span className="text-primary font-bold mr-2">{startIdx + idx + 1}.</span>
                      {question.text}
                    </p>
                    {tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="mt-0.5 text-muted-foreground hover:text-primary transition-colors p-1">
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[250px] text-xs">
                          {tooltip}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <RadioGroup
                    value={responses[question.id]?.toString()}
                    onValueChange={(val) => handleSelect(question.id, parseInt(val))}
                    className="space-y-2"
                  >
                    {question.options.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem value={option.value.toString()} id={`${question.id}_${option.value}`} />
                        <Label htmlFor={`${question.id}_${option.value}`} className="text-sm font-normal cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              );
            })}
          </div>
        </TooltipProvider>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => { setCurrentPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={currentPage === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {currentPage < totalPages - 1 ? (
            <Button onClick={() => { setCurrentPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={!allPageAnswered}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!allAnswered || isSubmitting} className="min-w-[140px]">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Complete"}
            </Button>
          )}
        </div>

        {!allPageAnswered && (
          <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>Please answer all questions on this page to continue.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssessmentForm;
