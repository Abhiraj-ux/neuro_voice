import sqlite3
import os

db_path = os.path.join("backend", "neuvoice.db")
if os.path.exists(db_path):
    print(f"Checking database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns already exist to avoid errors
    cursor.execute("PRAGMA table_info(patients)")
    columns = [row[1] for row in cursor.fetchall()]
    
    new_cols = [
        ("xp", "INTEGER DEFAULT 0"),
        ("streak_count", "INTEGER DEFAULT 0"),
        ("last_activity_date", "DATETIME"),
        ("achievements_json", "TEXT DEFAULT '[]'")
    ]
    
    for col_name, col_type in new_cols:
        if col_name not in columns:
            print(f"Adding column {col_name}...")
            try:
                cursor.execute(f"ALTER TABLE patients ADD COLUMN {col_name} {col_type}")
            except Exception as e:
                print(f"Could not add {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists.")
            
    conn.commit()
    conn.close()
    
    # Also create motor_sessions table if it doesn't exist
    conn = sqlite3.connect(db_path)
    conn.execute("""
    CREATE TABLE IF NOT EXISTS motor_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tremor_score FLOAT,
        reaction_ms INTEGER,
        accuracy_pct FLOAT,
        stability_idx FLOAT,
        label VARCHAR(30),
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
    """)
    conn.commit()
    conn.close()
    print("Migration complete.")
else:
    print("Database file not found, no migration needed.")
