// components/ProgressStepper.tsx
import { Loader2, Check } from "lucide-react";

interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
  activeStep?: number;
}

export function ProgressStepper({
  steps,
  currentStep,
  activeStep,
}: ProgressStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative mb-8">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
        <div
          className="absolute top-4 left-0 h-1 bg-blue-600 -z-10 transition-all duration-500"
          style={{
            width: `${(currentStep / steps.length) * 100}%`,
            maxWidth: "100%",
          }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === activeStep;
          const stepNum = index + 1;

          return (
            <div key={step} className="flex flex-col items-center relative">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-300
                ${
                  isCompleted
                    ? "bg-blue-600 text-white shadow-lg"
                    : isActive
                    ? "bg-blue-100 border-2 border-blue-600"
                    : "bg-white border-2 border-gray-300"
                }
                ${isActive ? "scale-110" : ""}
              `}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  stepNum
                )}
              </div>

              <div
                className={`
                absolute top-10 mt-2 text-xs font-medium text-center
                ${isCompleted ? "text-blue-600 font-bold" : "text-gray-500"}
                ${isActive ? "text-blue-600 font-bold" : ""}
                transition-all duration-300
              `}
              >
                {step}
              </div>

              {/* Current step indicator */}
              {isActive && (
                <div className="absolute -bottom-6 animate-pulse text-xs font-bold text-blue-600">
                  In progress...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
