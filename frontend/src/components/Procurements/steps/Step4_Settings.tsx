import React, { useState } from 'react';
import { IProcurementSettings, ProcedureType } from '../../../types/procurement';

interface Step4Props {
  settings?: IProcurementSettings;
  onNext?: (data: IProcurementSettings) => void;
  onBack?: () => void;
  onSubmit?: (data: IProcurementSettings) => void;
  totalNMCC?: number;
}

export const Step4_Settings: React.FC<Step4Props> = ({ 
  settings,
  onNext,
  onBack,
  onSubmit,
  totalNMCC = 0,
}) => {
  const [formData, setFormData] = useState<IProcurementSettings>(settings || {
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
  });

  const handleProcedureTypeChange = (type: ProcedureType) => {
    setFormData(prev => ({ ...prev, procedureType: type }));
  };

  const handleSecurityChange = (
    type: 'application' | 'contract',
    field: 'isRequired' | 'percentage',
    value: boolean | number
  ) => {
    const securityKey = type === 'application' ? 'applicationSecurity' : 'contractSecurity';
    setFormData(prev => ({
      ...prev,
      [securityKey]: {
        ...prev[securityKey],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    } else if (onNext) {
      onNext(formData);
    }
  };

  // Расчет размеров обеспечения
  const applicationSecurityAmount = formData.applicationSecurity.isRequired
    ? (totalNMCC * formData.applicationSecurity.percentage) / 100
    : 0;

  const contractSecurityAmount = formData.contractSecurity.isRequired
    ? (totalNMCC * formData.contractSecurity.percentage) / 100
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Шаг 4. Настройки процедуры
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Выберите тип процедуры и условия для формирования извещения и проекта контракта
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Тип процедуры */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Тип закупочной процедуры *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                formData.procedureType === 'electronic_auction'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="procedureType"
                checked={formData.procedureType === 'electronic_auction'}
                onChange={() => handleProcedureTypeChange('electronic_auction')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 font-semibold text-gray-800">Электронный аукцион</span>
              <p className="text-sm text-gray-600 mt-2 ml-6">
                44-ФЗ, статья 59. Проводится на электронной площадке
              </p>
            </label>

            <label
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                formData.procedureType === 'request_for_quotation'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="procedureType"
                checked={formData.procedureType === 'request_for_quotation'}
                onChange={() => handleProcedureTypeChange('request_for_quotation')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 font-semibold text-gray-800">Запрос котировок</span>
              <p className="text-sm text-gray-600 mt-2 ml-6">
                44-ФЗ, статья 82. Для закупок до 10 млн ₽
              </p>
            </label>
          </div>
        </div>

        {/* Преимущества СМП/СОНКО */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isSmpSonko}
              onChange={(e) => setFormData(prev => ({ ...prev, isSmpSonko: e.target.checked }))}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-800">
                Преимущество для СМП и СОНКО (ст. 30 44-ФЗ)
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Закупка проводится только среди субъектов малого предпринимательства и социально ориентированных некоммерческих организаций
              </p>
            </div>
          </label>
        </div>

        {/* Обеспечение заявки */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Обеспечение заявки
          </h3>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={formData.applicationSecurity.isRequired}
              onChange={(e) => handleSecurityChange('application', 'isRequired', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2 font-medium text-gray-700">Требуется обеспечение заявки</span>
          </label>

          {formData.applicationSecurity.isRequired && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Размер обеспечения (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.applicationSecurity.percentage}
                  onChange={(e) => handleSecurityChange('application', 'percentage', parseFloat(e.target.value) || 0)}
                  className="w-32 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Обычно 0.5% - 1% от НМЦК
                </p>
              </div>
              {totalNMCC > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Сумма обеспечения:</span>
                  <span className="ml-2 font-bold text-blue-700">
                    {applicationSecurityAmount.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Обеспечение контракта */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Обеспечение исполнения контракта
          </h3>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={formData.contractSecurity.isRequired}
              onChange={(e) => handleSecurityChange('contract', 'isRequired', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2 font-medium text-gray-700">Требуется обеспечение контракта</span>
          </label>

          {formData.contractSecurity.isRequired && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Размер обеспечения (%)
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    min="5"
                    max="30"
                    step="0.5"
                    value={formData.contractSecurity.percentage}
                    onChange={(e) => handleSecurityChange('contract', 'percentage', parseFloat(e.target.value) || 0)}
                    className="w-32 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500 self-center">
                    (5% - 30% от НМЦК)
                  </span>
                </div>
              </div>
              {totalNMCC > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Сумма обеспечения:</span>
                  <span className="ml-2 font-bold text-blue-700">
                    {contractSecurityAmount.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Авансирование */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Размер аванса (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="5"
            value={formData.advancePaymentPercentage}
            onChange={(e) => setFormData(prev => ({ ...prev, advancePaymentPercentage: parseInt(e.target.value) || 0 }))}
            className="w-32 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            0% — без аванса, по факту поставки
          </p>
        </div>

        {/* Итоговая информация */}
        {totalNMCC > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Итоговая информация:</h4>
            <div className="space-y-1 text-sm text-green-700">
              <div className="flex justify-between">
                <span>НМЦК:</span>
                <span className="font-bold">
                  {totalNMCC.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {formData.applicationSecurity.isRequired && (
                <div className="flex justify-between">
                  <span>Обеспечение заявки:</span>
                  <span className="font-bold">
                    {applicationSecurityAmount.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {formData.contractSecurity.isRequired && (
                <div className="flex justify-between">
                  <span>Обеспечение контракта:</span>
                  <span className="font-bold">
                    {contractSecurityAmount.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Навигация */}
        <div className="flex justify-between pt-4 border-t">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Назад
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            {onSubmit ? 'Сгенерировать документы' : 'Далее (Генерация)'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step4_Settings;
