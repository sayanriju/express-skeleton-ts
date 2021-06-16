/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from 'bcrypt';
import {
  getModelForClass,
  modelOptions,
  post,
  pre,
  prop,
} from '@typegoose/typegoose';
import { sendMail } from '../lib/mail';

/** Subclass/ sudocument/ subschema definitions */
class NameClass {
  @prop()
  first?: string | undefined | null;

  @prop()
  last?: string | undefined | null;

  /** Virtuals */
  public get full() {
    const first =
      this.first === undefined || this.first === null ? '' : this.first;
    const last =
      this.last === undefined || this.last === null ? '' : ` ${this.last}`;
    return `${first}${last}`;
  }

  public set full(v) {
    this.first = v.substr(0, v.indexOf(' '));
    this.last = v.substr(v.indexOf(' ') + 1);
  }
}
class ForgotPasswordClass {
  @prop({ default: null })
  requestedAt: Date | null;

  @prop({ default: null })
  token: string | null;

  @prop({ default: null })
  expiresAt: Date | null;
}

/** Hooks */
@pre<UserClass>('validate', async function (next) {
  const user = this;
  if (this.isModified('password') || this.isNew) {
    try {
      user.password = await bcrypt.hash(
        user.password || '',
        +(process.env.SALT_ROUNDS || 10),
      );
    } catch (error) {
      return next(error);
    }
  }
  return next();
})
@post<UserClass>('save', function (doc) {
  if (doc.generatedPassword !== undefined) {
    // Send welcome email, but NO WAITING!
    sendMail('welcome', {
      to: doc.email,
      subject: 'Welcome!!!',
      locals: {
        email: doc.email,
        password: doc.generatedPassword,
        name: doc.name,
      },
    });
  }
})
/** Main Class/Schema definition */
@modelOptions({
  options: { customName: 'User', automaticName: false },
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
})
export class UserClass {
  @prop({ required: true, lowercase: true, unique: true })
  public email!: string;

  @prop()
  public phone?: string;

  @prop({ required: true })
  public password?: string;

  @prop({ default: true })
  public isActive: boolean;

  @prop()
  public name: NameClass;

  @prop()
  forgotpassword?: ForgotPasswordClass;

  @prop()
  generatedPassword?: string;

  public async comparePassword(pw: string) {
    try {
      if (this.password === undefined) throw new Error('No password set!');
      const isMatch = await bcrypt.compare(pw, this.password);
      if (isMatch === false) throw new Error('Credential Mismatch!');
    } catch (error) {
      throw error; // rethrow
    }
  }
}

export const User = getModelForClass(UserClass);
