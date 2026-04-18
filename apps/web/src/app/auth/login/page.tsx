import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@/components/auth/login-form"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  ),
});

export default function LoginPage() {
  return <LoginForm />;
}

