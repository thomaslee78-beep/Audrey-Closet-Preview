-- Audrey Cloud — Phase 7A4C Admin1 initial D1 migration

CREATE TABLE IF NOT EXISTS app_config (
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (namespace, key)
);

CREATE TABLE IF NOT EXISTS ai_usage_daily (
  day TEXT NOT NULL,
  app_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'unknown',
  build TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  requests INTEGER NOT NULL DEFAULT 0,
  successes INTEGER NOT NULL DEFAULT 0,
  failures INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  request_ms INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (day, app_id, feature, channel, build, model)
);

CREATE TABLE IF NOT EXISTS ai_install_daily (
  day TEXT NOT NULL,
  app_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'unknown',
  build TEXT NOT NULL DEFAULT '',
  install_hash TEXT NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (day, app_id, feature, channel, build, install_hash)
);
