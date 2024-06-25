import { UsersModel } from "../models/users.models.js";

const UserService = () => {
  const userModel = UsersModel()

  const createUser = async (newUser) => {

    const { email } = newUser;
    const userFound = await userModel.findUserByEmail(email)
    if (userFound) {
      return false
    }

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