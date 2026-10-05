import { NextResponse } from "next/server";
import { getDishes } from "@/lib/dishes";

export async function GET() {
  return NextResponse.json(getDishes());
}