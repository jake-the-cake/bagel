<div align="center">

# 🥯 Bagel

### A lightweight Express framework for structured Node.js applications.

**Routes should describe what your application does — not all the machinery required to do it.**

`Express` · `PostgreSQL` · `Node.js` · `JavaScript`

</div>

---

## Overview

Bagel builds on Express while reducing the repetitive infrastructure normally written inside application routes.

Instead of manually handling validation, authorization, SQL, database errors, and response formatting, Bagel provides a simple route API around the request lifecycle.

```text
Request
   ↓
Control
   ├── Auth
   ├── Schema
   └── Database
   ↓
Response
```

A typical Bagel route looks like this:

```js
apiRouter.all("/users", async (_, res) => {
  res.Allow("GET");

  const users = await res.Read("users").all();

  res.Json(200, { users });
});
```

The route says what should happen.

Bagel handles the machinery around it.

---

## 🚀 Routes

Bagel uses the familiar Express router while adding framework controls directly to the response lifecycle.

```js
apiRouter.all("/users/:id", async (req, res) => {
  res.Allow("GET");

  res.User();

  const user = await res.Read("users").byId(req.params.id);

  res.Json(200, { user });
});
```

### Route API

| Method          | Purpose                     |
| :-------------- | :-------------------------- |
| `res.Allow()`   | Define allowed HTTP methods |
| `res.User()`    | Require authentication      |
| `res.Create()`  | Create records              |
| `res.Read()`    | Read records                |
| `res.Update()`  | Update records              |
| `res.Delete()`  | Delete records              |
| `res.Login()`   | Authenticate a user         |
| `res.Logout()`  | End authentication          |
| `res.Refresh()` | Refresh authentication      |
| `res.Json()`    | Send a JSON response        |
| `res.Html()`    | Render an HTML response     |

---

## 🚦 Request Methods

Use `Allow()` to define which HTTP method a route accepts.

```js
res.Allow("GET");
```

```js
res.Allow("POST");
```

Requests using an invalid method are handled through Bagel's normal request health lifecycle.

---

## 🧩 Models

Models describe application data.

```js
import { newModel } from "../core/index.js";

const users = newModel("users");

users.id();

users.field("email", {
  required: true,
  unique: true,
  type: "email",
});

users.field("password", {
  required: true,
  type: "password",
});

users.timestamps();

export { users };
```

Models provide Bagel with the information needed for schema validation and persistence.

---

# CRUD

## ➕ Create

Create a record from request data:

```js
const user = await res.Create("users").save();
```

### Example

```js
apiRouter.all("/users/create", async (_, res) => {
  res.Allow("POST");

  const user = await res.Create("users").save();

  res.Json(201, { user });
});
```

Bagel validates the request against the model before passing its values to the database.

---

## 🔎 Read

### All records

```js
const users = await res.Read("users").all();
```

### By ID

```js
const user = await res.Read("users").byId(req.params.id);
```

### Filter

```js
const users = await res.Read("users").where({ active: true }).all();
```

### One matching record

```js
const user = await res.Read("users").where({ email: req.body.email }).one();
```

### Limit results

```js
const users = await res.Read("users").where({ active: true }).many(10);
```

### Sort

```js
const users = await res.Read("users").sort("created_at", "DESC").all();
```

---

## ✏️ Update

### By ID

```js
const user = await res.Update("users").byId(req.params.id);
```

### By filter

```js
const users = await res.Update("users").where({ active: false });
```

---

## 🗑️ Delete

### By ID

```js
const user = await res.Delete("users").byId(req.params.id);
```

### By filter

```js
const users = await res.Delete("users").where({ active: false });
```

---

# 🔐 Authentication

## Login

```js
apiRouter.all("/login", async (_, res) => {
  res.Allow("POST");

  const user = await res.Login();

  res.Json(200, { user });
});
```

Successful authentication generates a token and attaches it to the response.

---

## Logout

```js
apiRouter.all("/logout", async (_, res) => {
  res.User();

  await res.Logout();

  res.Json(200);
});
```

---

## Refresh

```js
apiRouter.all("/refresh", async (_, res) => {
  res.User();

  const user = await res.Refresh();

  res.Json(200, { user });
});
```

---

# 📤 Responses

## JSON

```js
res.Json(200, {
  user,
});
```

Bagel combines the supplied response with the current state of the request before sending the final API response.

---

## HTML

Bagel can also use the Express rendering pipeline.

```js
res.Html("users/profile", {
  user,
});
```

---

# ❤️ Request Health

Bagel tracks the health of a request throughout its lifecycle.

### Flagged

An error has been recorded, but processing may continue.

This allows additional validation or database errors to be discovered before the final response.

### Dead

A fatal error has occurred.

Further protected operations — including database queries — are prevented from executing.

The request can still continue to the response layer so Bagel can return the appropriate error.

---

# ⚠️ Error Handling

Database operations pass through Bagel's Control layer.

Application routes generally do not need repetitive database `try/catch` blocks.

### Without Bagel

```js
apiRouter.post("/users", async (req, res) => {
  try {
    // validate request
    // validate fields
    // authorize user
    // construct SQL
    // execute query
    // catch database errors
    // construct response
  } catch (error) {
    // handle failure
  }
});
```

### With Bagel

```js
apiRouter.all("/users", async (_, res) => {
  res.Allow("POST");

  const user = await res.Create("users").save();

  res.Json(201, { user });
});
```

The route remains focused on application behavior.

---

# 🥯 Route Philosophy

A Bagel route should answer four questions:

| Question                     | API                                             |
| :--------------------------- | :---------------------------------------------- |
| **What request is allowed?** | `Allow()`                                       |
| **Who can make it?**         | `User()` / authorization                        |
| **What should happen?**      | `Create()` / `Read()` / `Update()` / `Delete()` |
| **What should be returned?** | `Json()` / `Html()`                             |

For example:

```js
apiRouter.all("/users/:id", async (req, res) => {
  res.Allow("GET");

  res.User();

  const user = await res.Read("users").byId(req.params.id);

  res.Json(200, { user });
});
```

Which can be read as:

```text
Allow GET
    ↓
Require User
    ↓
Read User
    ↓
Return JSON
```

---

# ⚙️ Architecture

Bagel separates the major responsibilities of a request.

```text
┌──────────────────────┐
│    Express Route     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Control        │
├──────────────────────┤
│ Auth                 │
│ Schema               │
│ Database             │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Response       │
└──────────────────────┘
```

**Routes** declare application behavior.

**Control** manages execution.

**Auth** determines access.

**Schema** validates application data.

**Database** communicates with PostgreSQL.

**Health** tracks problems throughout the lifecycle.

**Response** determines what ultimately leaves the application.

---

# 🎯 Design Goals

Bagel is built around a few core principles:

- **Small routes** — routes describe behavior instead of infrastructure.
- **Centralized control** — framework operations follow a predictable lifecycle.
- **Consistent errors** — failures are collected and handled by the framework.
- **Express compatibility** — Bagel builds on Express instead of replacing its routing model.
- **Simple models** — application-level definitions drive validation and persistence.
- **Minimal abstraction** — remove repetitive work without hiding what the application is doing.

---

# 📦 Built With

![Node.js](https://img.shields.io/badge/Node.js-Framework-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=black)

---

# 🚧 Project Status

> [!WARNING]
> **Bagel is under active development.**
>
> The public API and internal architecture may change as the framework moves toward its first stable release.

Bagel is not currently intended for production use.

---

<div align="center">

### 🥯 Bagel

**Express routes without all the schmear.**

</div>
