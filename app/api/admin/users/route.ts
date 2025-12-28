
import { NextResponse } from "next/server";
import Customer from "@/models/Customer";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    const users = await Customer.find({})
      .select("_id name email createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
