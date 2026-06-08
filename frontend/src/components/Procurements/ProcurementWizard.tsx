import React, { useState, useCallback } from 'react';
import { IProcurementWizardState, IProcurementInit, ITechSpec, IProcurementSettings } from '../../types/procurement';
import { procurementAPI } from '../../api/api';
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

  const handleStep3Complete = useCallback((data: { offers: any[]; totalNMCC: number }) => {
    setTotalNMCC(data.totalNMCC);
    setState(prev => ({
      ...prev,
      nmcc: {
        commercialOffers: data.offers,
      },
      currentStep: 4,
    }));
  }, []);

  const handleStep4Complete = useCallback(async (data: IProcurementSettings) => {
    const finalState = {
      ...state,
      settings: data,
      isSubmitting: true,
    };

    setState(finalState);

    try {
      // Формируем запрос для генерации документов
      const requestData = {
        procurement: {
          init: finalState.init,
          tech_spec: {
            items: finalState.techSpec.items,
            warranty_months: finalState.techSpec.warrantyMonths,
          },
          nmcc: finalState.nmcc,
          settings: finalState.settings,
        },
        nmcc_request: {
          items: finalState.techSpec.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            uom: item.uom,
            avg_price: 0, // Будет вычислено на бэкенде
            total: 0,
          })),
          offers: finalState.nmcc.commercialOffers.map(offer => ({
            provider_name: offer.providerName,
            provider_inn: offer.providerInn,
            date: offer.date,
            prices_per_item: offer.pricesPerItem,
          })),
        },
      };

      // Вызываем API для генерации ZIP-архива
      const response = await procurementAPI.generateFullPackage(requestData);

      // Скачиваем файл
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Закупка_${finalState.init.title}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      if (onSubmit) {
        onSubmit(finalState);
      }

      alert('Документы успешно сгенерированы и скачаны!');
    } catch (error) {
      console.error('Ошибка при генерации документов:', error);
      alert('Ошибка при генерации документов. Проверьте консоль для деталей.');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
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
      {/* Индикатор загрузки */}
      {state.isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Генерация документов...
              </h3>
              <p className="text-gray-600 text-center">
                Пожалуйста, подождите. Создаются документы для закупки по 44-ФЗ.
              </p>
            </div>
          </div>
        </div>
      )}

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
