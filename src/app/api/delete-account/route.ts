import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabaseAdmin
      .from("income_entries")
      .delete()
      .eq("user_id", userId);

    await supabaseAdmin
      .from("expense_entries")
      .delete()
      .eq("user_id", userId);

    await supabaseAdmin
      .from("invoices")
      .delete()
      .eq("user_id", userId);

    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    const { error } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}