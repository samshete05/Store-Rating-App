import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { Field } from "../components/Field";
import { useApp } from "../context/AppContext";
import { getHomePath } from "./routeHelpers";

const initialForm = {
  name: "",
  email: "",
  address: "",
  password: "",
};

export default function Register() {
  const { currentUser, registerUser } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (currentUser) {
      navigate(getHomePath(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      registerUser(form);
      setSuccess("Registration completed. You can sign in now.");
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-[#9f8163]">Signup</div>
        <h1 className="app-title mt-1.5 text-lg font-bold text-[var(--ink)]">
          Create a user account
        </h1>
        <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#776b58]">
          Register as normal user with name, email, address, and password (8-16 chars).
        </p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <Field
                label="Full Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Aarav Prakash Menon"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="name@example.com"
              />
              <Field
                label="Address"
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder="Street, city, state"
              />
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="User@1234"
              />

              {error ? (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                  {success}
                </div>
              ) : null}

              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>

            <p className="mt-3 text-xs text-[#6f614e]">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#b44e2c] hover:text-[#913a1d]">
                Sign in
              </Link>
            </p>
      </Card>
    </div>
  );
}
