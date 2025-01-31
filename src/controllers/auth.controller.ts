import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import config from "../config/config";
import { User } from "../entity";

export class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).json({
        message: 'Şifre veya Email yanlış',
        status: false,
        data: '',
        errorCode: 400,
      });
      return;
    }

    //Get user from database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({
        where: {
          email: email
        }
      });
    } catch (error) {
      res.status(400).json({
        message: 'Şifre veya Email yanlış',
        status: false,
        data: '',
        errorCode: 400,
      });
      return;
    }

    console.log(user);

    // if (!user) {
    //   res.status(401).send();
    //   return;
    // }


    //Check if encrypted password match
    if (!user || !user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).json({
        message: 'Email veya şifre yanlış',
        status: false,
        data: '',
        errorCode: 400,
      });
      return;
    }

    //Sing JWT, valid for 1 hour
    const token = jwt.sign({
      userId: user.id,
      username: user.username
    },
      config.jwtSecret,
      {
        expiresIn: "1d"
      }
    );

    //Send the jwt in the response
    res.json({
      status: true,
      message: '',
      data: {
        email: user.email,
        firstName: user.username,
        lastName: user.username,
        token: token,
      }
    });

  };

  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    //Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    //Check if old password matchs
    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    //Validate de model (password lenght)
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    //Hash the new password and save
    user.hashPassword();
    userRepository.save(user);

    res.status(204).send();
  };

  static me = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).json();
    }

    res.status(200).json({
      status: true,
      message: '',
      data: {
        email: user.email,
        firstName: user.username,
        lastName: user.username,
      }
    });
  }
}

export default AuthController;
