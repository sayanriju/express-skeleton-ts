import { DocumentType } from '@typegoose/typegoose';
import { Request, Response } from 'express';
import { sign as signJWT, Secret } from 'jsonwebtoken';

import { User, UserClass } from '../../../models/user';

/**
 *
 * @api {post} /login User login
 * @apiName userLogin
 * @apiGroup Auth
 * @apiVersion  1.0.0
 * @apiPermission Public
 *
 *
 * @apiParam  {String} handle (mobile / email)
 * @apiParam  {String} password user's password
 *
 * @apiSuccess (200) {json} name description
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *     "handle" : "myEmail@logic-square.com",
 *     "password" : "myNewPassword"
 * }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "error" : false,
 *     "handle" : "myEmail@logic-square.com",
 *     "token": "authToken.abc.xyz"
 * }
 *
 *
 */
export async function post(req: Request, res: Response) {
  try {
    // const { type } = req.params
    const { handle, password }: { handle: string; password: string } = req.body;
    if (handle === undefined || password === undefined) {
      return res.status(400).json({
        error: true,
        reason: 'Fields `handle` and `password` are mandatory',
      });
    }
    const user: DocumentType<UserClass> | null = await User.findOne({
      $or: [{ email: handle.toLowerCase() }, { phone: handle }],
    }).exec();
    if (user === null) throw new Error('User Not Found');
    if (user.isActive === false) throw new Error('User Inactive');
    // check pass
    await user.comparePassword(password);
    // No error, send jwt
    const payload = {
      id: user._id,
      _id: user._id,
      fullName: user.name?.full,
      email: user.email,
      phone: user.phone,
    };
    const token = signJWT(payload, <Secret>process.env.SECRET, {
      algorithm: 'HS256',
      expiresIn: 3600 * 24 * 30, // 1 month
    });
    return res.json({ error: false, handle, token });
  } catch (err) {
    return res.status(500).json({ error: true, reason: err.message });
  }
}
