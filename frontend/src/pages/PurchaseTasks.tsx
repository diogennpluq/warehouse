import React, { useState, useEffect } from 'react';
import { purchaseAPI, PurchaseTask } from '../api/api';

const PurchaseTasks: React.FC = () => {
  const [tasks, setTasks] = useState<PurchaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending_count: 0, estimated_cost: 0 });
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<PurchaseTask>>({
    title: '',
    description: '',
    quantity: 1,
    priority: 'medium',
    status: 'pending',
    estimated_cost: 0,
    due_date: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksResponse, statsResponse] = await Promise.all([
        purchaseAPI.getTasks(),
        purchaseAPI.getStats(),
      ]);
      setTasks(tasksResponse.data || []);
      setStats(statsResponse.data || { pending_count: 0, estimated_cost: 0 });
    } catch (error) {
      console.error('Error loading data:', error);
      setTasks([]);
      setStats({ pending_count: 0, estimated_cost: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAutoTasks = async () => {
    try {
      await purchaseAPI.generateAutoTasks();
      loadData();
    } catch (error) {
      console.error('Error generating auto tasks:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      description: '',
      quantity: 1,
      priority: 'medium',
      status: 'pending',
      estimated_cost: 0,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await purchaseAPI.createTask(formData);
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await purchaseAPI.updateTask(id, { status });
      loadData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filterStatus);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Задачи на закупку</h1>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card warning">
          <h3>Ожидают выполнения</h3>
          <div className="stat-value">{stats.pending_count}</div>
        </div>
        <div className="stat-card">
          <h3>Плановый бюджет</h3>
          <div className="stat-value">{stats.estimated_cost.toLocaleString()} ₽</div>
        </div>
        <div className="stat-card primary">
          <h3>Всего задач</h3>
          <div className="stat-value">{tasks.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>Фильтр: </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Все</option>
              <option value="pending">Ожидает</option>
              <option value="in_progress">В процессе</option>
              <option value="completed">Выполнено</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-success" onClick={handleGenerateAutoTasks}>
              Сгенерировать автоматически
            </button>
            <button className="btn btn-primary" onClick={handleOpenModal}>
              Добавить задачу
            </button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Описание</th>
              <th>Количество</th>
              <th>Приоритет</th>
              <th>Статус</th>
              <th>Оц. стоимость</th>
              <th>Срок</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description ? `${task.description.substring(0, 50)}...` : '-'}</td>
                <td>{task.quantity}</td>
                <td>
                  <span className={`status-badge ${task.priority === 'high' ? 'status-inactive' : task.priority === 'medium' ? 'status-pending' : 'status-active'}`}>
                    {task.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${task.status}`}>
                    {task.status}
                  </span>
                </td>
                <td>{task.estimated_cost.toLocaleString()} ₽</td>
                <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                <td>
                  <div className="action-buttons">
                    {task.status === 'pending' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      >
                        В работу
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                      >
                        Выполнить
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Добавить задачу на закупку</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Количество</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity ?? 1}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Приоритет</label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
              <div className="form-group">
                <label>Оценочная стоимость (₽)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.estimated_cost ?? 0}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Создать задачу
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseTasks;
