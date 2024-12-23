import { UserService } from "../services/users.services.js";
import bcryp from "bcrypt";
import jwt from "jsonwebtoken";

const AuthController = () => {
  const userService = UserService();

  const login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcryp.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const payload = {
        id: user.id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET);
      res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json(error.message || error.code);
    }
  };

  return {
    login,
  };
};

export { AuthController };
