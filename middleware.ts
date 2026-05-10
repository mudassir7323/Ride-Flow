import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token?.role) return false;
        const path = req.nextUrl.pathname;
        if (path.startsWith("/admin")) return token.role === "admin";
        if (path.startsWith("/driver")) return token.role === "driver";
        if (path.startsWith("/rider")) return token.role === "rider";
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/rider/:path*", "/driver/:path*", "/admin/:path*"],
};
