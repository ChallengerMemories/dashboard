import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AdminUser from '@/models/adminUser';

export async function POST(req: Request) {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;

    if (!setupSecret) {
      return NextResponse.json(
        { message: 'Admin setup is not configured' },
        { status: 503 }
      );
    }

    const { secret, email, password, name } = await req.json();

    if (secret !== setupSecret) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!email || !password || !name || password.length < 12) {
      return NextResponse.json(
        { message: 'Name, email, and a password of at least 12 characters are required' },
        { status: 400 }
      );
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return NextResponse.json(
        { message: 'Database is not configured' },
        { status: 503 }
      );
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, { dbName: 'space' });
    }

    if (await AdminUser.exists({})) {
      return NextResponse.json(
        { message: 'An admin account already exists; setup is closed' },
        { status: 409 }
      );
    }

    const user = await AdminUser.create({
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 12),
      name: name.trim(),
      role: 'super',
    });

    return NextResponse.json(
      { message: 'Admin account created', email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error('[auth/setup]', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
