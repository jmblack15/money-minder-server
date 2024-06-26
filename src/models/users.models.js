import connection from '../lib/connection.js'
import bcrypt from 'bcrypt'

const UsersModel = () => {

  const findUserByEmail = async (email) => {
    const client = await connection.connect()
    const res = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )

    client.release()
    return res.rows[0]
  }

  const createUser = async (newUser) => {

    const client = await connection.connect()
    let { name, email, password } = newUser
    const res = await client.query(
      "INSERT INTO Users (name, email, password) VALUES ($1 , $2, $3) RETURNING *",
      [name, email, password]
    )
    client.release()
    return res.rows[0]
  }

  return {
    findUserByEmail,
    createUser
  }
}

export { UsersModel }