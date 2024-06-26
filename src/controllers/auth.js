import { UserService } from '../services/users.services.js'
import { userSchemaValidation } from '../validations/user.js'
import bcryp from 'bcrypt'
import jwt from 'jsonwebtoken'

const AuthController = () => {

  const userService = UserService()

  // const login = async (req, res) => {
  //   const { email, password } = req.body;
  //   const user = await userService.findUserByEmail(email)
  //   const isValidtoken = await bcryp.compare(password, user.password)

  //   if (!user || !isValidtoken) {
  //     return res.status(401).json({ message: 'invalid credentials' })
  //   }

  //   const payload = { id: user.id }
  // const token = jwt.sign(payload, process.env.JWT_SECRET)
  //   res.status(200).json({ token })
  // }


  return {
    // login,
    // singup
  }
}

export { AuthController }
