/**
 * Hard caps on how many accounts of each role the system may hold.
 * Enforced in userController.create against the total count for that role.
 */
export const MAX_USERS = 100;
export const MAX_STAFF = 15;
