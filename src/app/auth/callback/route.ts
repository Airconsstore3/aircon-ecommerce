import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";

// Landing point for Supabase email links (signup confirmation, password
// recovery, magic links). Exchanges the one-time code/token for a session
// cookie, then sends the user on their way.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/account/orders";

  const supabase = createClient(await cookies());

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Failure: send to the client-side error page. Supabase appends the real
  // reason in the URL hash (#error=...&error_code=...), which the server
  // cannot see — the error page reads it client-side. The fragment survives
  // this redirect, so the actual error is preserved.
  return NextResponse.redirect(`${origin}/auth/error`);
}
