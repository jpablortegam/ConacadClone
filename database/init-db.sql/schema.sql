-- Crear las tablas para NextAuth.js
CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
 
  PRIMARY KEY (identifier, token)
);
 
CREATE TABLE accounts
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
 
  PRIMARY KEY (id)
);
 
CREATE TABLE sessions
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
 
  PRIMARY KEY (id)
);
 
CREATE TABLE users
(
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
 
  PRIMARY KEY (id)
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'Admin', 'Editor', 'User'
    description TEXT
);

ALTER TABLE users
ADD COLUMN "roleId" INTEGER; -- Puede ser NULL si un usuario no tiene un rol por defecto o se asigna después.
                             -- Si quieres que todos los usuarios tengan un rol desde el principio, podrías poner NOT NULL.

ALTER TABLE users
ADD CONSTRAINT fk_users_role_id
FOREIGN KEY ("roleId") REFERENCES roles(id) ON DELETE SET NULL; -- Si se elimina un rol, los usuarios con ese rol tendrán roleId NULL.
                                                              -- Si prefieres que se prohíba la eliminación de roles que están en uso, usa ON DELETE RESTRICT o NO ACTION.

-- Agregar claves foráneas para integridad referencial
ALTER TABLE accounts 
ADD CONSTRAINT fk_accounts_user_id 
FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_user_id 
FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- Crear índices para mejorar el rendimiento
CREATE UNIQUE INDEX idx_accounts_provider_provider_account_id 
ON accounts (provider, "providerAccountId");

CREATE UNIQUE INDEX idx_sessions_session_token 
ON sessions ("sessionToken");

CREATE UNIQUE INDEX idx_users_email 
ON users (email);

CREATE INDEX idx_verification_token_identifier 
ON verification_token (identifier);

CREATE INDEX idx_verification_token_token 
ON verification_token (token);