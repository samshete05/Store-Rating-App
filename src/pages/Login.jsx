import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { Field } from "../components/Field";
import { useApp } from "../context/AppContext";
import { getHomePath } from "./routeHelpers";

export default function Login() {
  const { currentUser, login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate(getHomePath(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = login(form);
      const destination = location.state?.from?.pathname || getHomePath(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="p-5">
          <div className="app-title text-lg font-bold text-[var(--ink)]">Welcome back</div>
 

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="admin@storegrid.com"
              required
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Admin@1234"
              required
            />
            {error ? (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 rounded-2xl bg-[#f5ecdf] px-3 py-3 text-xs text-[#6f614e]">
            Need an account?{" "}
            <Link to="/register" className="text-xs font-semibold text-[#b44e2c] hover:text-[#913a1d]">
              Register here
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-[#dbcdb8] px-3 py-3 text-xs text-[#6f614e]">
            Dummy logins:
            <div className="mt-2 space-y-1 text-[10px] text-[#8a7c67]">
              <div>Admin: admin@storegrid.com / Admin@1234</div>
              <div>Owner: owner@storegrid.com / Owner@1234</div>
              <div>User: user@storegrid.com / User@1234</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
