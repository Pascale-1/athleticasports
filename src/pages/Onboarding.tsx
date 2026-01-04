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

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [otherCity, setOtherCity] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<OnboardingGoal | null>(null);
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

      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          primary_sport: selectedSport,
          preferred_district: preferredDistrict,
          onboarding_completed: true,
          is_founding_member: true, // Beta users are founding members
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Navigate based on goal
      const goalRoutes: Record<OnboardingGoal, string> = {
        play: '/events',
        organize: '/events',
        team: '/teams',
        explore: '/',
      };

      navigate(goalRoutes[selectedGoal || 'explore'], { replace: true });
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
              selectedGoal={selectedGoal}
              onSelect={setSelectedGoal}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <CompletionStep
              key="completion"
              goal={selectedGoal}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
