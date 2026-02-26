export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-wrapper">
      <div className="auth-overlay">
        <div className="auth-card">
          {children}
        </div>

        <div className="powered">
          <span>Powered by</span>
          <img src="/images/ftrlogo.png" alt="Footer Logo" />
        </div>
      </div>
    </div>
  );
}