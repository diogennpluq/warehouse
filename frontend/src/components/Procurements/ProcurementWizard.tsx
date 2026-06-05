import React, { useState, useCallback } from 'react';
import { IProcurementWizardState, IProcurementInit, ITechSpec, IProcurementSettings } from '../../types/procurement';
import Step1_Init from './steps/Step1_Init';
import Step2_TechSpec from './steps/Step2_TechSpec';
import Step3_NMCC from './steps/Step3_NMCC';
import Step4_Settings from './steps/Step4_Settings';

interface ProcurementWizardProps {
  onClose?: () => void;
  onSubmit?: (data: IProcurementWizardState) => void;
}

const DEFAULT_STATE: IProcurementWizardState = {
  currentStep: 1,
  isSubmitting: false,
  init: {
    title: '',
    justification: '',
    responsibleUserId: '',
    commissionMembers: [],
    deliveryAddress: '',
    deliveryTerms: '',
  },
  techSpec: {
    items: [],
    warrantyMonths: 12,
  },
  nmcc: {
    commercialOffers: [],
  },
  settings: {
    procedureType: 'electronic_auction',
    isSmpSonko: true,
    applicationSecurity: {
      isRequired: true,
      percentage: 0.5,
    },
    contractSecurity: {
      isRequired: true,
      percentage: 5,
    },
    advancePaymentPercentage: 0,
  },
};

export const ProcurementWizard: React.FC<ProcurementWizardProps> = ({ 
  onClose,
  onSubmit 
}) => {
  const [state, setState] = useState<IProcurementWizardState>(DEFAULT_STATE);
  const [totalNMCC, setTotalNMCC] = useState<number>(0);

  const handleStep1Complete = useCallback((data: IProcurementInit) => {
    setState(prev => ({
      ...prev,
      init: data,
      currentStep: 2,
    }));
  }, []);

  const handleStep2Complete = useCallback((data: ITechSpec) => {
    setState(prev => ({
      ...prev,
      techSpec: data,
      currentStep: 3,
    }));
  }, []);

  const handleStep3Complete = useCallback((data: { totalNMCC: number }) => {
    setTotalNMCC(data.totalNMCC);
    setState(prev => ({
      ...prev,
      currentStep: 4,
    }));
  }, []);

  const handleStep4Complete = useCallback((data: IProcurementSettings) => {
    const finalState = {
      ...state,
      settings: data,
      isSubmitting: true,
    };

    if (onSubmit) {
      onSubmit(finalState);
    }

    // Здесь будет вызов API для генерации документов
    console.log('Final procurement data:', finalState);
  }, [state, onSubmit]);

  const handleBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  }, []);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Step1_Init
            initData={state.init}
            onNext={handleStep1Complete}
          />
        );

      case 2:
        return (
          <Step2_TechSpec
            techSpec={state.techSpec}
            onNext={handleStep2Complete}
            onBack={handleBack}
          />
        );

      case 3:
        return (
          <Step3_NMCC
            items={state.techSpec.items}
            onNext={handleStep3Complete}
            onBack={handleBack}
          />
        );

      case 4:
        return (
          <Step4_Settings
            settings={state.settings}
            totalNMCC={totalNMCC}
            onSubmit={handleStep4Complete}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Прогресс-бар */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Создание закупки по 44-ФЗ
          </h1>
          
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      state.currentStep >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    state.currentStep >= step
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Инициация'}
                    {step === 2 && 'ТЗ'}
                    {step === 3 && 'НМЦК'}
                    {step === 4 && 'Настройки'}
                  </span>
                </div>
                
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      state.currentStep > step
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Контент шага */}
      <div className="max-w-6xl mx-auto px-4">
        {renderStep()}
      </div>

      {/* Кнопка закрытия */}
      {onClose && (
        <div className="fixed top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title="Закрыть"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProcurementWizard;
