import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      api(`/auth/verify-email/${token}`)
        .then((data) => {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        })
        .catch((err) => {
          setStatus("error");
          setMessage(err.message);
        });
    } else {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>{status === "loading" ? "Verifying..." : status === "success" ? "✅ Verified!" : "❌ Error"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{message}</p>
          {status !== "loading" && (
            <Link to="/login" className="text-primary hover:underline">Go to login</Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
