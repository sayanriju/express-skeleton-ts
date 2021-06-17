import { DocumentType } from '@typegoose/typegoose';
import { LeanDocument } from 'mongoose';

import express from 'express';
const router = express.Router();

import { User, UserClass } from '../../models/user';

/* GET home page. */
router.get('/resetpassword/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const now = new Date();
    const user: LeanDocument<DocumentType<UserClass>> | null =
      await User.findOne({
        isActive: true,
        'forgotpassword.token': token,
        'forgotpassword.expiresAt': { $gte: now },
      })
        .select('email')
        .lean()
        .exec();
    if (user === null) throw new Error('INVALID OR EXPIRED LINK');
    return res.render('resetpassword', { handle: user.email, token });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

export { router };
