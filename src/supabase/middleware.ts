import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const corsWhitelist = ["http://localhost"];
const authRoutes = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.map(({ name, value, options }) =>
						request.cookies.set(name, value),
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.map(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user && authRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	if (
		request.nextUrl.pathname.startsWith("/api") &&
		!corsWhitelist.includes(request.nextUrl.origin)
	) {
		return NextResponse.json(
			{},
			{
				status: 401,
				statusText: "Unauthorized origin.",
			},
		);
	}

	return supabaseResponse;
}
