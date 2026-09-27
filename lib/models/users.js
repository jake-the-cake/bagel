import { newModel } from "../core/model.js";

const users = newModel("users");

users.id();
users.field("email", { required: true, unique: true, type: "email" });
users.field("password", { required: true, type: "password" });
users.timestamps();

export { users };
