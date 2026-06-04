import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI, Equipment } from '../api/api';

const EquipmentList: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '',
    type: '',
    model: '',
    serial_number: '',
    manufacturer: '',
    status: 'active',
    location: '',
    wear_percentage: 0,
  });

  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const response = await equipmentAPI.getAll();
      setEquipments(response.data || []);
    } catch (error) {
      console.error('Error loading equipment:', error);
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (equipment?: Equipment) => {
    if (equipment) {
      setEditingEquipment(equipment);
      setFormData(equipment);
    } else {
      setEditingEquipment(null);
      setFormData({
        name: '',
        type: '',
        model: '',
        serial_number: '',
        manufacturer: '',
        status: 'active',
        location: '',
        wear_percentage: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEquipment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        await equipmentAPI.update(editingEquipment.id, formData);
      } else {
        await equipmentAPI.create(formData);
      }
      handleCloseModal();
      loadEquipments();
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту единицу техники?')) {
      try {
        await equipmentAPI.delete(id);
        loadEquipments();
      } catch (error) {
        console.error('Error deleting equipment:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Складская техника</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          Добавить технику
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Модель</th>
              <th>Серийный номер</th>
              <th>Производитель</th>
              <th>Статус</th>
              <th>Износ</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {equipments.map((equipment) => (
              <tr key={equipment.id}>
                <td>
                  <Link to={`/equipment/${equipment.id}`}>{equipment.name}</Link>
                </td>
                <td>{equipment.type}</td>
                <td>{equipment.model || '-'}</td>
                <td>{equipment.serial_number || '-'}</td>
                <td>{equipment.manufacturer || '-'}</td>
                <td>
                  <span className={`status-badge status-${equipment.status}`}>
                    {equipment.status}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${equipment.wear_percentage >= 80 ? 'status-inactive' : equipment.wear_percentage >= 50 ? 'status-pending' : 'status-active'}`}>
                    {equipment.wear_percentage}%
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-primary" onClick={() => handleOpenModal(equipment)}>
                      Редактировать
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(equipment.id)}>
                      Удалить
                    </button>
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
              <h2>{editingEquipment ? 'Редактировать технику' : 'Добавить технику'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Тип</label>
                <input
                  type="text"
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Модель</label>
                <input
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Серийный номер</label>
                <input
                  type="text"
                  value={formData.serial_number || ''}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Производитель</label>
                <input
                  type="text"
                  value={formData.manufacturer || ''}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Статус</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Активна</option>
                  <option value="maintenance">В ремонте</option>
                  <option value="inactive">Неактивна</option>
                </select>
              </div>
              <div className="form-group">
                <label>Локация</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Износ (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.wear_percentage ?? 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, wear_percentage: isNaN(val) ? 0 : val });
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {editingEquipment ? 'Сохранить' : 'Добавить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
