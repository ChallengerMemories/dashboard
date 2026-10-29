import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AdminUser from '@/models/adminUser';

const MONGO_URI  = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;


async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI, { dbName: 'space' });
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();

    const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token, name: user.name, role: user.role });
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
