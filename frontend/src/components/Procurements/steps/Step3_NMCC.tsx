import React, { useState, useMemo } from 'react';
import { ICommercialOffer, IProcurementItem } from '../../../types/procurement';

interface ItemCalculation {
  id: string;
  name: string;
  quantity: number;
  uom: string;
  avg: number;
  cv: number;
  isValid: boolean;
  itemTotal: number;
}

interface Step3Props {
  items?: IProcurementItem[];
  onNext?: (data: { offers: ICommercialOffer[]; totalNMCC: number }) => void;
  onBack?: () => void;
}

const MOCK_ITEMS: IProcurementItem[] = [
  { id: 'item-1', name: 'Картридж лазерный тип 1', quantity: 10, uom: 'шт' },
  { id: 'item-2', name: 'Бумага А4 (500 листов)', quantity: 50, uom: 'упак' },
];

export const Step3_NMCC: React.FC<Step3Props> = ({ 
  items = MOCK_ITEMS, 
  onNext, 
  onBack 
}) => {
  const [offers, setOffers] = useState<ICommercialOffer[]>([
    { id: 'offer-1', providerName: '', providerInn: '', date: '', pricesPerItem: {} },
    { id: 'offer-2', providerName: '', providerInn: '', date: '', pricesPerItem: {} },
    { id: 'offer-3', providerName: '', providerInn: '', date: '', pricesPerItem: {} },
  ]);

  // Обработчик изменения данных КП
  const handleOfferChange = (
    offerId: string,
    field: keyof ICommercialOffer,
    value: string
  ) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId ? { ...offer, [field]: value } : offer
      )
    );
  };

  // Обработчик изменения цены товара в КП
  const handlePriceChange = (offerId: string, itemId: string, price: string) => {
    const numPrice = parseFloat(price) || 0;
    setOffers((prev) =>
      prev.map((offer) => {
        if (offer.id === offerId) {
          return {
            ...offer,
            pricesPerItem: { ...offer.pricesPerItem, [itemId]: numPrice },
          };
        }
        return offer;
      })
    );
  };

  // Вычисления НМЦК "на лету"
  const calculations = useMemo(() => {
    let totalNMCC = 0;

    const itemStats: ItemCalculation[] = items.map((item) => {
      const prices = offers
        .map((o) => o.pricesPerItem[item.id] || 0)
        .filter((p) => p > 0);

      if (prices.length === 0) {
        return { ...item, avg: 0, cv: 0, isValid: true, itemTotal: 0 };
      }

      // Средняя цена
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

      // Стандартное отклонение
      const variance =
        prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) /
        (prices.length - 1 || 1);
      const stdDev = Math.sqrt(variance);

      // Коэффициент вариации (%)
      const cv = avg > 0 ? (stdDev / avg) * 100 : 0;

      // Итог по позиции
      const itemTotal = avg * item.quantity;
      totalNMCC += itemTotal;

      return { ...item, avg, cv, isValid: cv <= 33, itemTotal };
    });

    return { itemStats, totalNMCC };
  }, [offers, items]);

  // Проверка валидности всех позиций
  const allValid = calculations.itemStats.every(
    (s) => s.isValid || s.avg === 0
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Шаг 3. Обоснование НМЦК
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Введите данные минимум из трех коммерческих предложений для расчета.
        </p>
      </div>

      {/* Карточки коммерческих предложений */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {offers.map((offer, index) => (
          <div key={offer.id} className="border rounded-lg p-5 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 text-blue-700">
              КП №{index + 1}
            </h3>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Поставщик
                </label>
                <input
                  type="text"
                  value={offer.providerName}
                  onChange={(e) =>
                    handleOfferChange(offer.id, 'providerName', e.target.value)
                  }
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="ООО Ромашка"
                />
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs text-gray-600 mb-1">
                    ИНН
                  </label>
                  <input
                    type="text"
                    value={offer.providerInn}
                    onChange={(e) =>
                      handleOfferChange(offer.id, 'providerInn', e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="7701234567"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs text-gray-600 mb-1">
                    Дата КП
                  </label>
                  <input
                    type="date"
                    value={offer.date}
                    onChange={(e) =>
                      handleOfferChange(offer.id, 'date', e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Ввод цен для каждого товара */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Цены за единицу (₽)
              </h4>
              {items.map((item) => (
                <div key={item.id} className="mb-3">
                  <label
                    className="block text-xs text-gray-600 truncate mb-1"
                    title={item.name}
                  >
                    {item.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={offer.pricesPerItem[item.id] || ''}
                    onChange={(e) =>
                      handlePriceChange(offer.id, item.id, e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Блок аналитики и расчета */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-lg mb-4 text-blue-900">
          Результаты расчета по 44-ФЗ
        </h3>

        <div className="space-y-4">
          {calculations.itemStats.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center justify-between bg-white p-3 rounded border"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{stat.name}</p>
                <p className="text-xs text-gray-500">
                  Средняя цена: {stat.avg.toFixed(2)} ₽ x {stat.quantity}{' '}
                  {stat.uom} ={' '}
                  <span className="font-semibold">{stat.itemTotal.toFixed(2)} ₽</span>
                </p>
              </div>

              <div className="text-right flex items-center gap-3">
                <div
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    stat.isValid
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  V = {stat.cv.toFixed(2)}%
                </div>

                {!stat.isValid && stat.avg > 0 && (
                  <p className="text-xs text-red-600 w-32 leading-tight">
                    Цены неоднородны (&gt;33%). Запросите новые КП!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-blue-200 flex justify-between items-center">
          <span className="text-lg text-blue-900">Итоговая НМЦК:</span>
          <span className="text-3xl font-bold text-blue-700">
            {calculations.totalNMCC.toLocaleString('ru-RU', {
              minimumFractionDigits: 2,
            })}{' '}
            ₽
          </span>
        </div>
      </div>

      {/* Навигация */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
        >
          Назад
        </button>

        <button
          onClick={() =>
            onNext && onNext({ offers, totalNMCC: calculations.totalNMCC })
          }
          disabled={!allValid}
          className="px-6 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Далее (Настройки процедуры)
        </button>
      </div>
    </div>
  );
};

export default Step3_NMCC;
