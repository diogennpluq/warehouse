import React, { useState } from 'react';
import { IProcurementInit } from '../../../types/procurement';

interface Step1Props {
  initData?: IProcurementInit;
  onNext?: (data: IProcurementInit) => void;
  onBack?: () => void;
}

// Мок-данные для пользователей (в реальности придут с бэкенда)
const MOCK_USERS = [
  { id: '1', name: 'Иванов И.И.', role: 'admin' },
  { id: '2', name: 'Петров П.П.', role: 'manager' },
  { id: '3', name: 'Сидоров С.С.', role: 'specialist' },
];

export const Step1_Init: React.FC<Step1Props> = ({ 
  initData,
  onNext, 
  onBack 
}) => {
  const [formData, setFormData] = useState<IProcurementInit>(initData || {
    title: '',
    justification: '',
    responsibleUserId: '',
    commissionMembers: [],
    deliveryAddress: '',
    deliveryTerms: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof IProcurementInit, string>>>({});

  const handleInputChange = (field: keyof IProcurementInit, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCommissionMemberToggle = (userId: string) => {
    setFormData(prev => {
      const members = prev.commissionMembers.includes(userId)
        ? prev.commissionMembers.filter(id => id !== userId)
        : [...prev.commissionMembers, userId];
      return { ...prev, commissionMembers: members };
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof IProcurementInit, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название закупки обязательно';
    }
    if (!formData.justification.trim()) {
      newErrors.justification = 'Обоснование обязательно';
    }
    if (!formData.responsibleUserId) {
      newErrors.responsibleUserId = 'Выберите ответственного';
    }
    if (formData.commissionMembers.length < 2) {
      newErrors.commissionMembers = 'В комиссии должно быть минимум 2 человека';
    }
    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Адрес доставки обязателен';
    }
    if (!formData.deliveryTerms.trim()) {
      newErrors.deliveryTerms = 'Сроки поставки обязательны';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && onNext) {
      onNext(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Шаг 1. Инициация закупки
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Заполните основную информацию о закупке для формирования Заявки и Распоряжения
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Название закупки */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название закупки *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Например: "Поставка расходных материалов для ПУ"'
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Обоснование */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Обоснование закупки *
          </label>
          <textarea
            value={formData.justification}
            onChange={(e) => handleInputChange('justification', e.target.value)}
            rows={4}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.justification ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Опишите причину необходимости закупки..."
          />
          {errors.justification && (
            <p className="mt-1 text-sm text-red-600">{errors.justification}</p>
          )}
        </div>

        {/* Ответственный сотрудник */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ответственный сотрудник *
          </label>
          <select
            value={formData.responsibleUserId}
            onChange={(e) => handleInputChange('responsibleUserId', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
              errors.responsibleUserId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Выберите сотрудника</option>
            {MOCK_USERS.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          {errors.responsibleUserId && (
            <p className="mt-1 text-sm text-red-600">{errors.responsibleUserId}</p>
          )}
        </div>

        {/* Комиссия */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Состав комиссии * (минимум 2 человека)
          </label>
          <div className="border rounded-lg p-4 space-y-2">
            {MOCK_USERS.map(user => (
              <label key={user.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.commissionMembers.includes(user.id)}
                  onChange={() => handleCommissionMemberToggle(user.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{user.name}</span>
              </label>
            ))}
          </div>
          {errors.commissionMembers && (
            <p className="mt-1 text-sm text-red-600">{errors.commissionMembers}</p>
          )}
        </div>

        {/* Адрес доставки */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Адрес поставки *
          </label>
          <input
            type="text"
            value={formData.deliveryAddress}
            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
              errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="г. Москва, ул. Примерная, д. 1"
          />
          {errors.deliveryAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress}</p>
          )}
        </div>

        {/* Сроки поставки */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Сроки поставки *
          </label>
          <input
            type="text"
            value={formData.deliveryTerms}
            onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
              errors.deliveryTerms ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Например: В течение 15 рабочих дней"
          />
          {errors.deliveryTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.deliveryTerms}</p>
          )}
        </div>

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
            className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 font-medium transition-colors"
          >
            Далее (Техническое задание)
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1_Init;
