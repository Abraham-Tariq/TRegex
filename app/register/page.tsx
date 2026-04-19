import SignupForm from "@/components/signupForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-mono">
      <header className="flex items-center px-6 py-3.5 border-b border-border gap-5">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          login
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          home
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-12 px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium tracking-tight mb-1.5">register</h1>
            <p className="text-sm text-muted-foreground">create an account to save your regex history.</p>
          </div>
          <SignupForm />
        </div>
      </main>
    </div>
  );
}