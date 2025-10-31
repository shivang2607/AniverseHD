import { NextResponse } from 'next/server';
import { getUserInfo, updateUser } from '../utils';

// GET user by ID
export async function GET(req, { params }) {
    const { userId } = params;

    const { data, status } = await getUserInfo(userId);
    return NextResponse.json(data, { status });
}

// PATCH update user
export async function PATCH(req,{ params }) {
    const { userId } = params;
    const updateData = await req.json();
    const { data, status } = await updateUser(userId, updateData);
    return NextResponse.json(data, { status });
}