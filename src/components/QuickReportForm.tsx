import React, { useState } from "react";
import { CreateDailyReportRequest } from "../shared/types/reports";

interface QuickReportFormProps {
  projectId: string;
  onSubmit: (data: CreateDailyReportRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function QuickReportForm({
  projectId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: QuickReportFormProps) {
  const [formData, setFormData] = useState<CreateDailyReportRequest>({
    projectId,
    reportDate: new Date().toISOString().split("T")[0],
    generalNotes: "",
    weatherCondition: "Sunny",
    temperature: 72,
    humidity: 50,
    workSummary: "",
    workAccomplished: "",
    workPlannedNextDay: "",
    issuesEncountered: "",
    totalWorkHours: 8,
    personnelOnSite: 1,
    safetyScore: 10,
    qualityScore: 10,
    dailyProgressContribution: 0,
    additionalNotes: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleInputChange = (
    field: keyof CreateDailyReportRequest,
    value: any
  ) => {
    setFormData((prev: CreateDailyReportRequest) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📅 Basic Information
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Report Date
        </label>
        <input
          type="date"
          value={formData.reportDate}
          onChange={(e) => handleInputChange("reportDate", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Hours
        </label>
        <input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={formData.totalWorkHours}
          onChange={(e) =>
            handleInputChange("totalWorkHours", Number(e.target.value))
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personnel on Site
        </label>
        <input
          type="number"
          min="1"
          value={formData.personnelOnSite}
          onChange={(e) =>
            handleInputChange("personnelOnSite", Number(e.target.value))
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🌤️ Weather & Conditions
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weather Condition
        </label>
        <select
          value={formData.weatherCondition || "Sunny"}
          onChange={(e) =>
            handleInputChange("weatherCondition", e.target.value)
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Sunny">☀️ Sunny</option>
          <option value="PartlyCloudy">⛅ Partly Cloudy</option>
          <option value="Cloudy">☁️ Cloudy</option>
          <option value="Rainy">🌧️ Rainy</option>
          <option value="Stormy">⛈️ Stormy</option>
          <option value="Foggy">🌫️ Foggy</option>
          <option value="Snow">❄️ Snow</option>
          <option value="Windy">💨 Windy</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature (°F)
          </label>
          <input
            type="number"
            value={formData.temperature || ""}
            onChange={(e) =>
              handleInputChange("temperature", Number(e.target.value))
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Humidity (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.humidity || ""}
            onChange={(e) =>
              handleInputChange("humidity", Number(e.target.value))
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📝 Work Summary
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Summary
        </label>
        <textarea
          rows={4}
          value={formData.workSummary}
          onChange={(e) => handleInputChange("workSummary", e.target.value)}
          placeholder="Brief overview of today's work..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Accomplished
        </label>
        <textarea
          rows={3}
          value={formData.workAccomplished || ""}
          onChange={(e) =>
            handleInputChange("workAccomplished", e.target.value)
          }
          placeholder="What was completed today..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Planned for Tomorrow
        </label>
        <textarea
          rows={3}
          value={formData.workPlannedNextDay || ""}
          onChange={(e) =>
            handleInputChange("workPlannedNextDay", e.target.value)
          }
          placeholder="What's planned for tomorrow..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Scores & Final Notes
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Safety Score (1-10)
          </label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={formData.safetyScore}
              onChange={(e) =>
                handleInputChange("safetyScore", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span className="font-semibold text-blue-600">
                {formData.safetyScore}
              </span>
              <span>10</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality Score (1-10)
          </label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={formData.qualityScore}
              onChange={(e) =>
                handleInputChange("qualityScore", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span className="font-semibold text-blue-600">
                {formData.qualityScore}
              </span>
              <span>10</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Daily Progress Contribution (%)
        </label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={formData.dailyProgressContribution}
            onChange={(e) =>
              handleInputChange(
                "dailyProgressContribution",
                Number(e.target.value)
              )
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span className="font-semibold text-purple-600">
              {formData.dailyProgressContribution}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Issues Encountered
        </label>
        <textarea
          rows={3}
          value={formData.issuesEncountered || ""}
          onChange={(e) =>
            handleInputChange("issuesEncountered", e.target.value)
          }
          placeholder="Any issues or challenges faced today..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          rows={3}
          value={formData.additionalNotes || ""}
          onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
          placeholder="Any additional notes or observations..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-lg mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          📝 Quick Daily Report
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Create a report in 4 easy steps
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {renderProgressBar()}
        {renderStepContent()}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "✅ Submit Report"
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
