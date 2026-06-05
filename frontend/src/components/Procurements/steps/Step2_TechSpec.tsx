import React, { useState } from 'react';
import { ITechSpec, IProcurementItem, IItemCharacteristic } from '../../../types/procurement';

interface Step2Props {
  techSpec?: ITechSpec;
  onNext?: (data: ITechSpec) => void;
  onBack?: () => void;
}

const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const EMPTY_ITEM: IProcurementItem = {
  id: '',
  name: '',
  ktruCode: '',
  okpd2Code: '',
  uom: 'шт',
  quantity: 1,
  characteristics: [],
};

const EMPTY_CHARACTERISTIC: IItemCharacteristic = {
  id: '',
  name: '',
  value: '',
  isMandatory: true,
};

export const Step2_TechSpec: React.FC<Step2Props> = ({ 
  techSpec,
  onNext, 
  onBack 
}) => {
  const [items, setItems] = useState<IProcurementItem[]>(
    techSpec?.items || []
  );
  const [warrantyMonths, setWarrantyMonths] = useState<number>(
    techSpec?.warrantyMonths || 12
  );
  const [editingItem, setEditingItem] = useState<IProcurementItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);

  const handleAddItem = () => {
    setEditingItem({ ...EMPTY_ITEM, id: generateId() });
    setShowItemForm(true);
  };

  const handleEditItem = (item: IProcurementItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSaveItem = (item: IProcurementItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? item : i);
      }
      return [...prev, item];
    });
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleCancelItem = () => {
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleAddCharacteristic = () => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        characteristics: [
          ...(editingItem.characteristics || []),
          { ...EMPTY_CHARACTERISTIC, id: generateId() },
        ],
      });
    }
  };

  const handleUpdateCharacteristic = (
    charId: string,
    field: keyof IItemCharacteristic,
    value: string | boolean
  ) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        characteristics: (editingItem.characteristics || []).map(char =>
          char.id === charId ? { ...char, [field]: value } : char
        ),
      });
    }
  };

  const handleDeleteCharacteristic = (charId: string) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        characteristics: (editingItem.characteristics || []).filter(
          char => char.id !== charId
        ),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext && items.length > 0) {
      onNext({ items, warrantyMonths });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Шаг 2. Техническое задание
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Добавьте объекты закупки с характеристиками для формирования Приложения №1
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Список товаров */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Объекты закупки ({items.length})
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              + Добавить позицию
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              Нет добавленных позиций. Нажмите "Добавить позицию"
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">КТРУ:</span> {item.ktruCode || '—'}
                        </div>
                        <div>
                          <span className="font-medium">ОКПД2:</span> {item.okpd2Code || '—'}
                        </div>
                        <div>
                          <span className="font-medium">Кол-во:</span> {item.quantity} {item.uom}
                        </div>
                        <div>
                          <span className="font-medium">Характеристики:</span> {item.characteristics?.length || 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditItem(item)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Гарантия */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Требуемая гарантия (месяцев)
          </label>
          <input
            type="number"
            min="0"
            value={warrantyMonths}
            onChange={(e) => setWarrantyMonths(parseInt(e.target.value) || 0)}
            className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Форма редактирования позиции */}
        {showItemForm && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingItem.name ? 'Редактирование позиции' : 'Новая позиция'}
              </h3>

              <div className="space-y-4">
                {/* Наименование */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Наименование *
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: Картридж лазерный"
                  />
                </div>

                {/* Коды */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Код КТРУ
                    </label>
                    <input
                      type="text"
                      value={editingItem.ktruCode}
                      onChange={(e) => setEditingItem({ ...editingItem, ktruCode: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="26.20.15.110"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Код ОКПД2
                    </label>
                    <input
                      type="text"
                      value={editingItem.okpd2Code}
                      onChange={(e) => setEditingItem({ ...editingItem, okpd2Code: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="26.20.15"
                    />
                  </div>
                </div>

                {/* Единицы и количество */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Единица измерения
                    </label>
                    <select
                      value={editingItem.uom}
                      onChange={(e) => setEditingItem({ ...editingItem, uom: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="шт">шт</option>
                      <option value="упак">упак</option>
                      <option value="комплект">комплект</option>
                      <option value="набор">набор</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Количество *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Характеристики */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Характеристики
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCharacteristic}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Добавить
                    </button>
                  </div>

                  {editingItem.characteristics && editingItem.characteristics.length > 0 ? (
                    <div className="space-y-2 border rounded-lg p-3">
                      {(editingItem.characteristics || []).map((char, idx) => (
                        <div key={char.id} className="flex gap-2 items-start">
                          <input
                            type="text"
                            value={char.name}
                            onChange={(e) => handleUpdateCharacteristic(char.id, 'name', e.target.value)}
                            placeholder="Название характеристики"
                            className="flex-1 border rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="text"
                            value={char.value}
                            onChange={(e) => handleUpdateCharacteristic(char.id, 'value', e.target.value)}
                            placeholder="Значение"
                            className="flex-1 border rounded px-2 py-1 text-sm"
                          />
                          <label className="flex items-center text-xs text-gray-600">
                            <input
                              type="checkbox"
                              checked={char.isMandatory}
                              onChange={(e) => handleUpdateCharacteristic(char.id, 'isMandatory', e.target.checked)}
                              className="mr-1"
                            />
                            Обяз.
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDeleteCharacteristic(char.id)}
                            className="text-red-600 hover:text-red-800 text-sm px-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Характеристики не добавлены</p>
                  )}
                </div>
              </div>

              {/* Кнопки формы */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancelItem}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveItem(editingItem)}
                  disabled={!editingItem.name || editingItem.quantity < 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Сохранить
                </button>
              </div>
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
            disabled={items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Далее (Расчет НМЦК)
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2_TechSpec;
