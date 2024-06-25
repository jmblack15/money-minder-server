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

  const singup = async (req, res) => {
    const { error, value } = userSchemaValidation.validate(req.body)

    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { name, email, password } = value

    try {
      const existingUser = await userService.findUserByEmail(email)
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' })
      }

      const hashedPassword = await bcryp.hash(password, 10)
      const newUser = await userService.createUser({
        name,
        email,
        password: hashedPassword,
      })

      const payload = { id: newUser.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      })

    } catch (error) {
      console.error('Error during signup: ', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  return {
    // login,
    singup
  }
}

export { AuthController }
