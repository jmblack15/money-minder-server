import { UsersModel } from "../models/users.models.js";

const UserService = () => {
  const userModel = UsersModel();

  const createUser = async (newUser) => {
    return userModel.createUser(newUser);
  };

  const getUserById = async (id) => {
    return userModel.getUserById(id);
  };

  const findUserByEmail = async (email) => {
    return userModel.findUserByEmail(email);
  };

  return {
    createUser,
    getUserById,
    findUserByEmail,
  };
};

export { UserService };
