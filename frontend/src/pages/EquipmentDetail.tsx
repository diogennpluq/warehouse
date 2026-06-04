import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { equipmentAPI, repairsAPI, Equipment, Repair } from '../api/api';

const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairData, setRepairData] = useState<Partial<Repair>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    cost: 0,
    equipment_id: 0,
  });

  useEffect(() => {
    if (id) {
      loadEquipment();
      loadRepairs();
    }
  }, [id]);

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getById(parseInt(id!));
      setEquipment(response.data);
    } catch (error) {
      console.error('Error loading equipment:', error);
    }
  };

  const loadRepairs = async () => {
    try {
      const response = await repairsAPI.getByEquipment(parseInt(id!));
      setRepairs(response.data || []);
      
      const costResponse = await repairsAPI.getEquipmentCost(parseInt(id!));
      setTotalCost(costResponse.data?.total_cost || 0);
    } catch (error) {
      console.error('Error loading repairs:', error);
      setRepairs([]);
      setTotalCost(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await repairsAPI.create({
        ...repairData,
        equipment_id: parseInt(id!),
      });
      setShowRepairModal(false);
      loadRepairs();
    } catch (error) {
      console.error('Error creating repair:', error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!equipment) {
    return <div className="loading">Оборудование не найдено</div>;
  }

  return (
      <div className="container">
        <Link to="/equipment" className="btn" style={{ marginBottom: '20px', display: 'inline-block' }}>
          ← Назад к списку
        </Link>

      <div className="card">
        <h1 className="page-title" style={{ marginBottom: '20px' }}>{equipment.name}</h1>
        
        <div className="equipment-details">
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Тип:</strong> {equipment.type}
            </div>
            <div className="detail-item">
              <strong>Модель:</strong> {equipment.model || '-'}
            </div>
            <div className="detail-item">
              <strong>Серийный номер:</strong> {equipment.serial_number || '-'}
            </div>
            <div className="detail-item">
              <strong>Производитель:</strong> {equipment.manufacturer || '-'}
            </div>
            <div className="detail-item">
              <strong>Статус:</strong>{' '}
              <span className={`status-badge status-${equipment.status}`}>
                {equipment.status}
              </span>
            </div>
            <div className="detail-item">
              <strong>Локация:</strong> {equipment.location || '-'}
            </div>
            <div className="detail-item">
              <strong>Износ:</strong>{' '}
              <span className={`status-badge ${equipment.wear_percentage >= 80 ? 'status-inactive' : equipment.wear_percentage >= 50 ? 'status-pending' : 'status-active'}`}>
                {equipment.wear_percentage}%
              </span>
            </div>
            <div className="detail-item">
              <strong>Дата покупки:</strong>{' '}
              {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : '-'}
            </div>
            <div className="detail-item">
              <strong>Последнее ТО:</strong>{' '}
              {equipment.last_maintenance_date ? new Date(equipment.last_maintenance_date).toLocaleDateString() : '-'}
            </div>
            <div className="detail-item">
              <strong>Следующее ТО:</strong>{' '}
              {equipment.next_maintenance_date ? new Date(equipment.next_maintenance_date).toLocaleDateString() : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>История ремонтов</h2>
          <button className="btn btn-primary" onClick={() => setShowRepairModal(true)}>
            Добавить ремонт
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
          <strong>Общие затраты на ремонт:</strong> {totalCost.toLocaleString()} ₽
        </div>

        {repairs.length === 0 ? (
          <p>История ремонтов пуста</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th>Статус</th>
                <th>Приоритет</th>
                <th>Затраты</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => (
                <tr key={repair.id}>
                  <td>{repair.title}</td>
                  <td>{repair.description ? `${repair.description.substring(0, 50)}...` : '-'}</td>
                  <td>
                    <span className={`status-badge status-${repair.status}`}>
                      {repair.status}
                    </span>
                  </td>
                  <td>{repair.priority}</td>
                  <td>{repair.cost.toLocaleString()} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRepairModal && (
        <div className="modal" onClick={() => setShowRepairModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Добавить ремонт</h2>
              <button className="modal-close" onClick={() => setShowRepairModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddRepair}>
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={repairData.title || ''}
                  onChange={(e) => setRepairData({ ...repairData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={repairData.description || ''}
                  onChange={(e) => setRepairData({ ...repairData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Статус</label>
                <select
                  value={repairData.status || 'pending'}
                  onChange={(e) => setRepairData({ ...repairData, status: e.target.value })}
                >
                  <option value="pending">Ожидает</option>
                  <option value="in_progress">В процессе</option>
                  <option value="completed">Завершен</option>
                </select>
              </div>
              <div className="form-group">
                <label>Приоритет</label>
                <select
                  value={repairData.priority || 'medium'}
                  onChange={(e) => setRepairData({ ...repairData, priority: e.target.value })}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
              <div className="form-group">
                <label>Затраты (₽)</label>
                <input
                  type="number"
                  min="0"
                  value={repairData.cost ?? 0}
                  onChange={(e) => setRepairData({ ...repairData, cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Добавить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetail;
