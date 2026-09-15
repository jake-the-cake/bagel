# bagel

## Resource controllers

Create a controller with the database getter, table name, and writable fields, then mount its router:

```js
import { getDb } from "../data/db.js";
import { createResourceController } from "../control/index.js";

const users = createResourceController({
  db: getDb,
  table: "users",
  fields: ["name", "email"],
});

apiRouter.use("/users", users.router);
```

The controller provides `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, and `DELETE /:id`. Passing `getDb` keeps the database lookup lazy, so the route can be registered before PostgreSQL connects.
