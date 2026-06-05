-- Расширение схемы БД для закупок по 44-ФЗ

-- Таблица закупок
CREATE TABLE IF NOT EXISTS fz44_procurements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    justification TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    responsible_user_id INTEGER REFERENCES users(id),
    commission_members INTEGER[] DEFAULT '{}',
    procedure_type VARCHAR(50) DEFAULT 'electronic_auction',
    is_smp_sonko BOOLEAN DEFAULT FALSE,
    application_security_required BOOLEAN DEFAULT FALSE,
    application_security_percentage DECIMAL(5,2) DEFAULT 0,
    contract_security_required BOOLEAN DEFAULT FALSE,
    contract_security_percentage DECIMAL(5,2) DEFAULT 0,
    advance_payment_percentage INTEGER DEFAULT 0,
    nmcc_total DECIMAL(15,2),
    publication_date DATE,
    application_deadline DATE,
    delivery_address TEXT,
    delivery_terms VARCHAR(200),
    warranty_months INTEGER DEFAULT 12,
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
    uom VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    characteristics JSONB DEFAULT '[]'::jsonb,
    avg_price DECIMAL(12,2),
    total_price DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица коммерческих предложений для НМЦК
CREATE TABLE IF NOT EXISTS fz44_nmck_quotes (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES fz44_items(id) ON DELETE CASCADE,
    provider_name VARCHAR(500) NOT NULL,
    provider_inn VARCHAR(20),
    quote_date DATE NOT NULL,
    price_per_unit DECIMAL(12,2) NOT NULL,
    coefficient_variation DECIMAL(5,2),
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица контрактов
CREATE TABLE IF NOT EXISTS fz44_contracts (
    id SERIAL PRIMARY KEY,
    procurement_id INTEGER REFERENCES fz44_procurements(id) ON DELETE CASCADE,
    winner_name VARCHAR(500) NOT NULL,
    winner_inn VARCHAR(20),
    contract_date DATE NOT NULL,
    contract_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    delivery_status VARCHAR(50) DEFAULT 'pending',
    delivery_date DATE,
    received_parts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_procurements_status ON fz44_procurements(status);
CREATE INDEX IF NOT EXISTS idx_procurements_responsible ON fz44_procurements(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_items_procurement ON fz44_items(procurement_id);
CREATE INDEX IF NOT EXISTS idx_quotes_item ON fz44_nmck_quotes(item_id);
CREATE INDEX IF NOT EXISTS idx_contracts_procurement ON fz44_contracts(procurement_id);

-- Комментарии к таблицам
COMMENT ON TABLE fz44_procurements IS 'Закупки по 44-ФЗ';
COMMENT ON TABLE fz44_items IS 'Объекты закупки (позиции)';
COMMENT ON TABLE fz44_nmck_quotes IS 'Коммерческие предложения для расчета НМЦК';
COMMENT ON TABLE fz44_contracts IS 'Реестр контрактов';

COMMENT ON COLUMN fz44_procurements.status IS 'draft, doc_generated, on_zakupki, contract_signed, completed, cancelled';
COMMENT ON COLUMN fz44_procurements.procedure_type IS 'electronic_auction, request_for_quotation';
COMMENT ON COLUMN fz44_procurements.commission_members IS 'Массив ID сотрудников комиссии';
COMMENT ON COLUMN fz44_items.characteristics IS 'JSON массив характеристик: [{name, value, is_mandatory}]';
COMMENT ON COLUMN fz44_contracts.delivery_status IS 'pending, partial, completed';
COMMENT ON COLUMN fz44_contracts.received_parts_count IS 'Количество оприходованных позиций на склад';
