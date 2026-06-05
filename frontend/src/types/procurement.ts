// Типы данных для модуля закупок по 44-ФЗ

// ============================================
// Шаг 1: Инициация
// ============================================
export interface IProcurementInit {
  title: string;                // Название закупки
  justification: string;        // Обоснование
  responsibleUserId: string;    // ID ответственного сотрудника
  commissionMembers: string[];  // Массив ID сотрудников комиссии
  deliveryAddress: string;      // Место поставки
  deliveryTerms: string;        // Сроки поставки
}

// ============================================
// Шаг 2: Техническое задание
// ============================================
export interface ITechSpec {
  items: IProcurementItem[];
  warrantyMonths: number;
}

export interface IProcurementItem {
  id: string;                   // Уникальный ID (генерируется на фронте)
  name: string;                 // Наименование
  ktruCode?: string;            // Код КТРУ (опционально)
  okpd2Code?: string;           // Код ОКПД2 (опционально)
  uom: string;                  // Единица измерения
  quantity: number;             // Количество
  characteristics?: IItemCharacteristic[];  // Характеристики (могут быть пустыми)
}

export interface IItemCharacteristic {
  id: string;
  name: string;                 // Название характеристики
  value: string;                // Значение
  isMandatory: boolean;         // Обязательная ли
}

// ============================================
// Шаг 3: НМЦК
// ============================================
export interface INMCCData {
  commercialOffers: ICommercialOffer[];
}

export interface ICommercialOffer {
  id: string;
  providerName: string;
  providerInn: string;
  date: string;
  pricesPerItem: Record<string, number>;
}

// ============================================
// Шаг 4: Настройки процедуры
// ============================================
export type ProcedureType = 'electronic_auction' | 'request_for_quotation';

export interface IProcurementSettings {
  procedureType: ProcedureType;
  isSmpSonko: boolean;          // Преимущества для СМП/СОНКО
  applicationSecurity: {
    isRequired: boolean;
    percentage: number;
  };
  contractSecurity: {
    isRequired: boolean;
    percentage: number;
  };
  advancePaymentPercentage: number;
}

// ============================================
// Глобальное состояние Wizard
// ============================================
export interface IProcurementWizardState {
  currentStep: number;
  isSubmitting: boolean;
  init: IProcurementInit;
  techSpec: ITechSpec;
  nmcc: INMCCData;
  settings: IProcurementSettings;
}

// ============================================
// Результат расчета НМЦК
// ============================================
export interface NMCCResult {
  averagePrice: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  isValid: boolean;
  totalNMCC: number;
}

// ============================================
// Запрос на генерацию документов
// ============================================
export interface GenerateDocumentsRequest {
  procurement: IProcurementWizardState;
  nmccResults: NMCCResult[];
}
