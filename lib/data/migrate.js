import { models } from "../models/index.js";

async function migrate(db) {
  for (const model of models) {
    await createTable(db, model);

    for (const [name, field] of model.entries()) {
      await syncColumn(db, model.name, name, field);
    }
  }
}

// TABLES

async function createTable(db, model) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${model.name}" ()
  `);
}

// COLUMNS

async function syncColumn(db, table, name, field) {
  const exists = await columnExists(db, table, name);

  if (!exists) {
    await createColumn(db, table, name, field);

    return;
  }

  await syncType(db, table, name, field);
  await syncRequired(db, table, name, field);
  await syncUnique(db, table, name, field);
  await syncDefault(db, table, name, field);
}

async function createColumn(db, table, name, field) {
  const definition = getDefinition(field);

  await db.query(`
    ALTER TABLE "${table}"
    ADD COLUMN "${name}" ${definition}
  `);
}

async function columnExists(db, table, name) {
  const { rows } = await db.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    `,
    [table, name],
  );

  return rows.length > 0;
}

// TYPES

async function syncType(db, table, name, field) {
  // Identity columns are created correctly initially.
  // Don't attempt to rebuild identity behavior here yet.
  if (field.type === "id") return;

  const { rows } = await db.query(
    `
      SELECT data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    `,
    [table, name],
  );

  const column = rows[0];

  if (!column) return;

  const expected = getType(field);

  let current;

  if (column.data_type === "character varying")
    current = `VARCHAR(${column.character_maximum_length})`;
  else current = normalizeType(column.data_type);

  if (current === expected) return;

  await db.query(`
    ALTER TABLE "${table}"
    ALTER COLUMN "${name}"
    TYPE ${expected}
    USING "${name}"::${expected}
  `);
}

// REQUIRED

async function syncRequired(db, table, name, field) {
  const { rows } = await db.query(
    `
      SELECT is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    `,
    [table, name],
  );

  const required = rows[0]?.is_nullable === "NO";

  if (field.required && !required) {
    await db.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "${name}" SET NOT NULL
    `);
  }

  if (!field.required && required && !field.primary) {
    await db.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "${name}" DROP NOT NULL
    `);
  }
}

// UNIQUE

async function syncUnique(db, table, name, field) {
  const constraint = await getUniqueConstraint(db, table, name);

  if (field.unique && !constraint) {
    await db.query(`
      ALTER TABLE "${table}"
      ADD CONSTRAINT "${table}_${name}_key"
      UNIQUE ("${name}")
    `);
  }

  if (!field.unique && constraint) {
    await db.query(`
      ALTER TABLE "${table}"
      DROP CONSTRAINT "${constraint}"
    `);
  }
}

async function getUniqueConstraint(db, table, name) {
  const { rows } = await db.query(
    `
      SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.constraint_schema = ccu.constraint_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'UNIQUE'
        AND ccu.column_name = $2
    `,
    [table, name],
  );

  return rows[0]?.constraint_name || null;
}

// DEFAULTS

async function syncDefault(db, table, name, field) {
  const { rows } = await db.query(
    `
      SELECT column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    `,
    [table, name],
  );

  const current = rows[0]?.column_default ?? null;
  const expected = field.default ?? null;

  if (expected === null && current !== null) {
    // Identity columns have a generated default managed by PostgreSQL.
    if (field.type === "id") return;

    await db.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "${name}" DROP DEFAULT
    `);

    return;
  }

  if (expected !== null && current !== expected) {
    await db.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "${name}" SET DEFAULT ${expected}
    `);
  }
}

// MODEL -> SQL

function getDefinition(field) {
  const definition = [getType(field)];

  if (field.primary) definition.push("PRIMARY KEY");

  if (field.required) definition.push("NOT NULL");

  if (field.unique) definition.push("UNIQUE");

  if (field.default !== null) definition.push(`DEFAULT ${field.default}`);

  return definition.join(" ");
}

function getType(field) {
  switch (field.type) {
    case "id":
      return "INTEGER GENERATED ALWAYS AS IDENTITY";

    case "integer":
      return "INTEGER";

    case "number":
      return "NUMERIC";

    case "boolean":
      return "BOOLEAN";

    case "date":
      return "TIMESTAMP";

    case "email":
    case "password":
    case "string":
    default:
      return `VARCHAR(${field.max || 255})`;
  }
}

function normalizeType(type) {
  switch (type) {
    case "integer":
      return "INTEGER";

    case "numeric":
      return "NUMERIC";

    case "boolean":
      return "BOOLEAN";

    case "timestamp without time zone":
      return "TIMESTAMP";

    default:
      return type.toUpperCase();
  }
}

export { migrate };
