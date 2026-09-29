import { core } from "../../core/index.js";

const userProfile = core.newModel("user_profile");

userProfile.field("user_id", { type: "integer", required: true, unique: true });
userProfile.timestamps();

export { userProfile };
