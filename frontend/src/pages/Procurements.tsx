import React, { useState } from 'react';
import { ProcurementWizard } from '../components/Procurements';
import { IProcurementWizardState } from '../types/procurement';
import { procurementAPI } from '../api/api';

const Procurements: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (data: IProcurementWizardState) => {
    setIsGenerating(true);
    setMessage(null);

    try {
      // Подготавливаем данные для API
      const nmccItems = data.techSpec.items.map(item => {
        // Рассчитываем среднюю цену из коммерческих предложений
        const prices = data.nmcc.commercialOffers.map(offer => offer.pricesPerItem[item.id] || 0).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        
        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          uom: item.uom,
          avg_price: avgPrice,
          total: avgPrice * item.quantity,
        };
      });

      const requestBody = {
        procurement: {
          init: data.init,
          tech_spec: data.techSpec,
          nmcc: data.nmcc,
          settings: data.settings,
        },
        nmcc_request: {
          items: nmccItems,
          offers: data.nmcc.commercialOffers.map(offer => ({
            provider_name: offer.providerName,
            provider_inn: offer.providerInn,
            date: offer.date,
            prices_per_item: offer.pricesPerItem,
          })),
        },
      };

      // Вызов API для генерации ZIP-архива
      const response = await procurementAPI.generateFullPackage(requestBody);

      // Создаём ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `Закупка_${data.init.title.replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.zip`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: 'Документы успешно сгенерированы и скачаны!',
      });

      // Через 3 секунды скрываем wizard и показываем список
      setTimeout(() => {
        setShowWizard(false);
        setMessage(null);
      }, 3000);

    } catch (error: any) {
      console.error('Ошибка генерации документов:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Ошибка при генерации документов',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (showWizard) {
    return (
      <div>
        {message && (
          <div
            className={`alert alert-${message.type}`}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            }}
          >
            {message.text}
          </div>
        )}
        <ProcurementWizard
          onClose={() => setShowWizard(false)}
          onSubmit={handleSubmit}
        />
        {isGenerating && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div className="loading">Генерация документов...</div>
              <p style={{ marginTop: '10px', color: '#666' }}>
                Пожалуйста, дождитесь создания ZIP-архива
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="page-title">Закупки по 44-ФЗ</h1>

        <div style={{ marginBottom: '30px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Модуль для автоматизации создания и сопровождения закупок по Федеральному закону № 44-ФЗ.
            Мастер создания закупки поможет вам подготовить все необходимые документы для размещения в ЕИС.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => setShowWizard(true)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            📋 Создать закупку
          </button>
        </div>

        <div style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>📁 Генерируемые документы</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {[
              { num: 1, name: 'Заявка.docx', desc: 'Заявка на проведение закупки' },
              { num: 2, name: 'Распоряжение.docx', desc: 'Распоряжение о проведении процедуры' },
              { num: 3, name: 'Приложение №1 (ТЗ).docx', desc: 'Техническое задание' },
              { num: 4, name: 'Приложение №2 (НМЦК).xlsx', desc: 'Обоснование начальной цены' },
              { num: 5, name: 'Информация к извещению.docx', desc: 'Данные для публикации в ЕИС' },
              { num: 6, name: 'Требования к заявке.docx', desc: 'Требования к участникам закупки' },
              { num: 7, name: 'Проект контракта.docx', desc: 'Проект государственного контракта' },
            ].map(doc => (
              <div
                key={doc.num}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginRight: '10px',
                    }}
                  >
                    {doc.num}
                  </span>
                  <strong>{doc.name}</strong>
                </div>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Важно</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
            <li>Требуется минимум 3 коммерческих предложения для расчета НМЦК</li>
            <li>Коэффициент вариации должен быть ≤ 33% (иначе цены неоднородны)</li>
            <li>Все документы генерируются в ZIP-архиве одним файлом</li>
            <li>После генерации распечатайте документы для подписания</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Procurements;
