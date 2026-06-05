-- Расширение схемы БД для закупок по 44-ФЗ

-- Таблица закупок
CREATE TABLE IF NOT EXISTS fz44_procurements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    responsible_user_id INTEGER REFERENCES users(id),
    publication_date DATE,
    application_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица объектов закупки (позиции)
CREATE TABLE IF NOT EXISTS fz44_items (
    id SERIAL PRIMARY KEY,
    procurement_id INTEGER REFERENCES fz44_procurements(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    ktru_code VARCHAR(50),
    okpd2_code VARCHAR(50),
    uom VARCHAR(50),
    quantity INTEGER NOT NULL,
    characteristics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица коммерческих предложений для НМЦК
CREATE TABLE IF NOT EXISTS fz44_nmck_quotes (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES fz44_items(id) ON DELETE CASCADE,
    provider_name VARCHAR(500) NOT NULL,
    provider_inn VARCHAR(20),
    quote_date DATE,
    price_per_unit DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица контрактов
CREATE TABLE IF NOT EXISTS fz44_contracts (
    id SERIAL PRIMARY KEY,
    procurement_id INTEGER REFERENCES fz44_procurements(id) ON DELETE CASCADE,
    winner_name VARCHAR(500) NOT NULL,
    winner_inn VARCHAR(20),
    contract_date DATE,
    contract_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    delivery_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX idx_procurements_status ON fz44_procurements(status);
CREATE INDEX idx_procurements_responsible ON fz44_procurements(responsible_user_id);
CREATE INDEX idx_items_procurement ON fz44_items(procurement_id);
CREATE INDEX idx_quotes_item ON fz44_nmck_quotes(item_id);
CREATE INDEX idx_contracts_procurement ON fz44_contracts(procurement_id);

-- Комментарии к таблицам
COMMENT ON TABLE fz44_procurements IS 'Закупки по 44-ФЗ';
COMMENT ON TABLE fz44_items IS 'Объекты закупки (позиции)';
COMMENT ON TABLE fz44_nmck_quotes IS 'Коммерческие предложения для расчета НМЦК';
COMMENT ON TABLE fz44_contracts IS 'Реестр контрактов';
