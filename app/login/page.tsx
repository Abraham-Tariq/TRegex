import LoginForm from "@/components/loginform";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-mono">
      <header className="flex items-center px-6 py-3.5 border-b border-border gap-5">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          home
        </Link>
        <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          register
        </Link>
      
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-12 px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium tracking-tight mb-1.5">login</h1>
            <p className="text-sm text-muted-foreground">sign in to your account</p>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}