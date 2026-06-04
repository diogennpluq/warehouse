import React, { useState, useEffect } from 'react';
import { equipmentAPI, repairsAPI, purchaseAPI } from '../api/api';

interface Equipment {
  id: number;
  name: string;
  status: string;
  wear_percentage: number;
}

interface Repair {
  id: number;
  title: string;
  status: string;
}

interface PurchaseStats {
  pending_count: number;
  estimated_cost: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeEquipment: 0,
    pendingRepairs: 0,
    pendingTasks: 0,
    estimatedCost: 0,
    highWearEquipment: 0,
  });
  const [recentRepairs, setRecentRepairs] = useState<Repair[]>([]);
  const [highWearEquipment, setHighWearEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [equipments, repairs, purchaseStats] = await Promise.all([
        equipmentAPI.getAll(),
        repairsAPI.getAll(),
        purchaseAPI.getStats(),
      ]);

      const equipmentsData = equipments.data || [];
      const repairsData = repairs.data || [];

      setStats({
        totalEquipment: equipmentsData.length,
        activeEquipment: equipmentsData.filter((e: Equipment) => e.status === 'active').length,
        pendingRepairs: repairsData.filter((r: Repair) => r.status === 'pending').length,
        pendingTasks: purchaseStats.data.pending_count,
        estimatedCost: purchaseStats.data.estimated_cost,
        highWearEquipment: equipmentsData.filter((e: Equipment) => e.wear_percentage >= 70).length,
      });

      setRecentRepairs(repairsData.slice(0, 5));
      setHighWearEquipment(equipmentsData.filter((e: Equipment) => e.wear_percentage >= 70));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка дашборда...</div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Дашборд</h1>

      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Всего техники</h3>
          <div className="stat-value">{stats.totalEquipment}</div>
        </div>
        <div className="stat-card success">
          <h3>Активная техника</h3>
          <div className="stat-value">{stats.activeEquipment}</div>
        </div>
        <div className="stat-card warning">
          <h3>Ожидают ремонта</h3>
          <div className="stat-value">{stats.pendingRepairs}</div>
        </div>
        <div className="stat-card danger">
          <h3>Задачи на закупку</h3>
          <div className="stat-value">{stats.pendingTasks}</div>
        </div>
        <div className="stat-card">
          <h3>Плановый бюджет замен</h3>
          <div className="stat-value">{stats.estimatedCost.toLocaleString()} ₽</div>
        </div>
        <div className="stat-card danger">
          <h3>Техника с износом &gt;70%</h3>
          <div className="stat-value">{stats.highWearEquipment}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Последние ремонты</h2>
          {recentRepairs.length === 0 ? (
            <p>Нет данных</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentRepairs.map((repair) => (
                  <tr key={repair.id}>
                    <td>{repair.title}</td>
                    <td>
                      <span className={`status-badge status-${repair.status}`}>
                        {repair.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Техника с высоким износом</h2>
          {highWearEquipment.length === 0 ? (
            <p>Нет данных</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Износ</th>
                </tr>
              </thead>
              <tbody>
                {highWearEquipment.map((equip) => (
                  <tr key={equip.id}>
                    <td>{equip.name}</td>
                    <td>
                      <span className={`status-badge ${equip.wear_percentage >= 80 ? 'status-inactive' : 'status-pending'}`}>
                        {equip.wear_percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
