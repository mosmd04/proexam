import Link from "next/link";

export const metadata = {
  title: "403 - Unauthorized | ProExam",
  description: "You do not have permission to access this resource.",
};

export default function UnauthorizedPage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#0a0a0a",
        color: "#ededed",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "6rem",
          fontWeight: 800,
          background: "linear-gradient(135deg, #ef4444, #f97316)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          marginBottom: "1rem",
        }}
      >
        403
      </div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: "0.75rem",
        }}
      >
        Access Denied
      </h1>
      <p
        style={{
          fontSize: "1rem",
          color: "#a1a1aa",
          maxWidth: "28rem",
          marginBottom: "2rem",
          lineHeight: 1.6,
        }}
      >
        You do not have the required permissions to access this page. If you
        believe this is an error, please contact your administrator.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
          color: "#ededed",
          fontSize: "0.875rem",
          fontWeight: 500,
          textDecoration: "none",
          transition: "background-color 0.2s",
        }}
      >
        ← Return to Home
      </Link>
    </main>
  );
}
