/* One user, named in one place.
 *
 * There is no sign in yet, so every request is Tomiwa. The schema
 * already carries user_id on every row, so adding real accounts means
 * changing this function and nothing else. */
export const CURRENT_USER = "u_tomiwa";
export const currentUser = () => CURRENT_USER;
