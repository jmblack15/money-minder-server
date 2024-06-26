import express from 'express'
import cors from 'cors'
import passport from 'passport'
import { applyJWTAuthentication } from './middelwares/auth.js'
import { AuthRouter } from './routes/auth.js'
import { UsersRoutes } from './routes/users.js'

const app = express()
const PORT = process.env.PORT ?? 8080

app.disable('x-powered-by')
app.use(express.json())
app.use(cors())

app.use(passport.initialize())

app.use(applyJWTAuthentication)

// app.use('/auth', AuthRouter())
app.use('/users', UsersRoutes())



app.listen(PORT, () => {
  console.log(`server listening on the port http://localhost:${PORT}`)
})