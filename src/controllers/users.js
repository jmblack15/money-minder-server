import { UserService } from '../services/users.services.js'
import { userSchemaValidation } from '../validations/user.js'
import bcrypt from 'bcrypt'

const UsersController = () => {
  const userService = UserService()

  const createUser = async (req, res) => {
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

      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = await userService.createUser({
        name,
        email,
        password: hashedPassword,
      })

      res.status(201).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      })

    } catch (error) {
      console.error('Error creating user: ', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  return {
    createUser
  }
}

export { UsersController }