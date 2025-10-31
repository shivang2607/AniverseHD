import { NextResponse } from 'next/server';
import {addUserInfo} from './utils';

// POST new user
export async function POST(req) {
    const userData = await req.json();
    const { data, status } = await addUserInfo(userData);
    return NextResponse.json(data, { status });
}




