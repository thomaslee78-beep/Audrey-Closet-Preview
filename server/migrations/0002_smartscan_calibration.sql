-- Audrey Cloud — Phase 7A6A Smart Scan calibration lab
-- Photos are NOT persisted. Only result metadata, token usage, latency, and human truth are stored.

CREATE TABLE IF NOT EXISTS ai_calibration_runs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  detail TEXT NOT NULL DEFAULT 'auto',
  image_chars INTEGER NOT NULL DEFAULT 0,
  truth_category TEXT NOT NULL DEFAULT '',
  truth_type TEXT NOT NULL DEFAULT '',
  truth_color TEXT NOT NULL DEFAULT '',
  truth_pattern TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS ai_calibration_results (
  run_id TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  pattern TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  confidence_category REAL NOT NULL DEFAULT 0,
  confidence_type REAL NOT NULL DEFAULT 0,
  confidence_color REAL NOT NULL DEFAULT 0,
  confidence_pattern REAL NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  request_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (run_id, model),
  FOREIGN KEY (run_id) REFERENCES ai_calibration_runs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_calibration_runs_created_at
  ON ai_calibration_runs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_calibration_results_model
  ON ai_calibration_results(model, created_at DESC);
