const TABLES = {
  public: ["tools"],
  private: [],
};

function getTables(schema = "public", key = null) {
  const tables = [];
  switch (schema) {
    case "all":
      tables.push(...TABLES["public"], ...TABLES["private"]);
    case "private":
      tables.push(...TABLES["private"]);
    case "public":
      tables.push(...TABLES["public"]);
    default:
      return tables;
  }
}

export { getTables };
