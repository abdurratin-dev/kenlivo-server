import { AppError } from '../../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { User, type UserDocument } from '../user/user.model.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

function issueTokens(user: UserDocument) {
  const payload = { sub: user.id as string, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function toPublicUser(user: UserDocument) {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const exists = await User.exists({ email: input.email });
    if (exists) throw AppError.conflict('An account with this email already exists');

    const user = await User.create(input);
    return { user: toPublicUser(user), tokens: issueTokens(user) };
  },

  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user || !user.isActive) throw AppError.unauthorized('Invalid credentials');

    const valid = await user.comparePassword(input.password);
    if (!valid) throw AppError.unauthorized('Invalid credentials');

    return { user: toPublicUser(user), tokens: issueTokens(user) };
  },

  async refresh(token: string) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) throw AppError.unauthorized('User no longer active');
    return { tokens: issueTokens(user) };
  },

  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return toPublicUser(user);
  },
};
