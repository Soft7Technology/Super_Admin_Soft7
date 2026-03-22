/* eslint-disable @typescript-eslint/no-unused-vars */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import {jwtVerify, SignJWT} from "jose"
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET || 'access_secret');
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET || 'refresh_secret');

export async function POST(){
    try{
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if(!refreshToken){
            return NextResponse.json({error: "refresh token not found"}, {status: 401});
        }

        
        const {payload} = await jwtVerify(refreshToken, REFRESH_SECRET)
        const decode = payload as {id: number, email: string, role: string}

        const user = await prisma.user.findUnique({
            where: {
                id: decode.id
            }
        })

        if(!user || !user.refreshToken){
            return NextResponse.json({error: "Invalid Session"}, {status: 403})
        }

        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

        if(!isMatch){
            await prisma.user.update({
                where: {id: user.id},
                data: {refreshToken: null}
            })

            return NextResponse.json({error: "Token reuse detected"}, {status: 403})
        }

        const newAccessToken = await new SignJWT({id: user.id, email: user.email, role: user.role, companyId: user.companyId, trialEndAt: user.trialEndAt, subscriptionEnd: user.subscriptionEnd}).setProtectedHeader({alg: 'HS256'}).setExpirationTime('15m').sign(ACCESS_SECRET);

        const response = NextResponse.json({success: true, message: "Access token generated successfully"});

        response.cookies.set("accessToken",newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60
        })

        return response;

    }catch(error){
        return NextResponse.json({error: "Invalid refresh token"}, {status: 403})
    }
} 