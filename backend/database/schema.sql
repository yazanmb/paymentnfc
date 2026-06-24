-- NFC Payment System Database Schema

-- Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    stripe_account_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    branch_name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    stripe_secret_key TEXT,
    stripe_publishable_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    device_uid VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    activation_date TIMESTAMP,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    nfc_uid VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table (for cashier to create orders for tables)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    table_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFC Stickers Table
CREATE TABLE IF NOT EXISTS nfc_stickers (
    id SERIAL PRIMARY KEY,
    sticker_uid VARCHAR(255) UNIQUE NOT NULL,
    activation_code VARCHAR(255) NOT NULL,
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    table_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available',
    activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_uid ON devices(device_uid);
CREATE INDEX IF NOT EXISTS idx_transactions_device_id ON transactions(device_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_nfc_stickers_uid ON nfc_stickers(sticker_uid);
CREATE INDEX IF NOT EXISTS idx_nfc_stickers_status ON nfc_stickers(status);
CREATE INDEX IF NOT EXISTS idx_orders_branch_table ON orders(branch_id, table_name);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
