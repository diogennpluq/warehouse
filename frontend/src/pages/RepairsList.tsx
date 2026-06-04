import React, { useState, useEffect } from 'react';
import { repairsAPI, Repair, equipmentAPI, Equipment } from '../api/api';

const RepairsList: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [repairsResponse, equipmentsResponse] = await Promise.all([
        repairsAPI.getAll(),
        equipmentAPI.getAll(),
      ]);
      setRepairs(repairsResponse.data || []);
      setEquipments(equipmentsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setRepairs([]);
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentName = (id: number) => {
    const equip = equipments.find((e) => e.id === id);
    return equip ? equip.name : 'Неизвестно';
  };

  const filteredRepairs = filterStatus === 'all' 
    ? repairs 
    : repairs.filter((r) => r.status === filterStatus);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Учёт ремонтов</h1>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label>Фильтр по статусу: </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Все</option>
              <option value="pending">Ожидает</option>
              <option value="in_progress">В процессе</option>
              <option value="completed">Завершен</option>
            </select>
          </div>
          <span>Всего: {filteredRepairs.length}</span>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Техника</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Статус</th>
              <th>Приоритет</th>
              <th>Затраты</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepairs.map((repair) => (
              <tr key={repair.id}>
                <td>{getEquipmentName(repair.equipment_id)}</td>
                <td>{repair.title}</td>
                <td>{repair.description ? `${repair.description.substring(0, 50)}...` : '-'}</td>
                <td>
                  <span className={`status-badge status-${repair.status}`}>
                    {repair.status}
                  </span>
                </td>
                <td>{repair.priority}</td>
                <td>{repair.cost.toLocaleString()} ₽</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-primary"
                      onClick={() => alert('Функция редактирования в разработке')}
                    >
                      Редактировать
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RepairsList;
