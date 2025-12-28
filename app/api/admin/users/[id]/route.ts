
import { NextResponse } from "next/server";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: Props) {
  await dbConnect();

  try {
    const { id } = await params;
    
    const user = await Customer.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const orders = await Order.find({ customer: id }).sort({ createdAt: -1 });

    return NextResponse.json({ user, orders });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
