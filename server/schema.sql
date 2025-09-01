-- Bảng Users 
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, 
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    can_create_events BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Events 
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id VARCHAR(255) NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    types TEXT[] DEFAULT '{}',
    requires_auth BOOLEAN DEFAULT FALSE NOT NULL,
    ip_allow_list TEXT[] DEFAULT '{}',
    allowed_email_domains TEXT[] DEFAULT '{}',
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    nonce_ttl INTEGER DEFAULT 300,
    custom_fields JSONB DEFAULT '[]',
    qr_code TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Attendances (lịch sử điểm danh)
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id),
    user_id VARCHAR(255) REFERENCES users(id),
    email VARCHAR(255),                    -- Email người điểm danh
    display_name VARCHAR(255),              -- Tên hiển thị
    ip VARCHAR(45) NOT NULL,               -- IP client
    public_ip VARCHAR(45),                 -- IP public
    user_agent TEXT,                       -- User agent của browser
    ua_hash TEXT NOT NULL,
    at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nonce VARCHAR(255),
    custom_data JSONB DEFAULT '{}',        -- Dữ liệu tùy chỉnh (MSSV, etc.)
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_valid BOOLEAN DEFAULT TRUE,        -- Trạng thái hợp lệ dựa trên IP
    approved_by VARCHAR(255) REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,                            -- Ghi chú khi phê duyệt/từ chối
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendances_event_id ON attendances(event_id);
CREATE INDEX IF NOT EXISTS idx_attendances_user_id ON attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);