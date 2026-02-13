import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { SportStep } from "@/components/onboarding/SportStep";
import { LocationStep } from "@/components/onboarding/LocationStep";
import { GoalStep, type OnboardingGoal } from "@/components/onboarding/GoalStep";
import { CompletionStep } from "@/components/onboarding/CompletionStep";
import { useAppWalkthrough } from "@/hooks/useAppWalkthrough";

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
  const { setTrigger } = useAppWalkthrough();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [otherCity, setOtherCity] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<OnboardingGoal[]>([]);
  const [saving, setSaving] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Determine preferred_district value
      const preferredDistrict = selectedDistrict === 'other' 
        ? `other:${otherCity.trim()}`
        : selectedDistrict;

      // Use upsert to handle case where profile might not exist (e.g., trigger failure)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: `user_${user.id.substring(0, 8)}`,
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          primary_sport: selectedSport,
          preferred_district: preferredDistrict,
          onboarding_completed: true,
          is_founding_member: true, // Beta users are founding members
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        });

      if (error) throw error;

      // Wait for database propagation before navigating
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set walkthrough trigger so it starts on home page
      setTrigger();
      navigate('/', { replace: true });
      toast.success("Welcome to Athletica!");
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar - hide on welcome and completion */}
      {currentStep > 1 && currentStep < TOTAL_STEPS && (
        <div className="p-4 pt-6">
          <OnboardingProgress currentStep={currentStep - 1} totalSteps={TOTAL_STEPS - 2} />
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <WelcomeStep key="welcome" onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <SportStep
              key="sport"
              selectedSport={selectedSport}
              onSelect={setSelectedSport}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <LocationStep
              key="location"
              selectedDistrict={selectedDistrict}
              otherCity={otherCity}
              onSelectDistrict={setSelectedDistrict}
              onOtherCityChange={setOtherCity}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <GoalStep
              key="goal"
              selectedGoals={selectedGoals}
              onToggle={(goal) => {
                setSelectedGoals(prev => 
                  prev.includes(goal) 
                    ? prev.filter(g => g !== goal)
                    : [...prev, goal]
                );
              }}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <CompletionStep
              key="completion"
              goals={selectedGoals}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
