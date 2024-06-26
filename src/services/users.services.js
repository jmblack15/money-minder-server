import { UsersModel } from "../models/users.models.js";

const UserService = () => {
  const userModel = UsersModel()

  const createUser = async (newUser) => {
    return userModel.createUser(newUser)
  }

  const findUserByEmail = async (email) => {
    return userModel.findUserByEmail(email)
  }

  return {
    createUser,
    findUserByEmail,
  }
}

export { UserService }