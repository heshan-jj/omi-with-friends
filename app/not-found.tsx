import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <h1>This table isn’t here.</h1>
      <p>Check your invite link, or start a new table with your friends.</p>
      <Link className="button primary" href="/">
        Back to Omi
      </Link>
    </main>
  );
}
