import React, { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { Field, TextAreaField } from "../components/Field";
import PageShell from "../components/PageShell";
import StatsGrid from "../components/StatsGrid";
import { RatingPill } from "../components/SortableTable";
import { useApp } from "../context/AppContext";
import { averageRating, formatRating, getSubmittedRating, ratingCount } from "../utils/helpers";
import { validateFeedback, validatePassword, validateRating } from "../utils/validation";

export default function UserDashboard() {
  const {
    currentUser,
    stores,
    ratings,
    logout,
    submitRating,
    updatePassword,
    getStoreAverage,
  } = useApp();
  const [search, setSearch] = useState("");
  const [draftReviews, setDraftReviews] = useState({});
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const nextDrafts = {};
    stores.forEach((store) => {
      const existing = getSubmittedRating(ratings, currentUser.id, store.id);
      if (existing) {
        nextDrafts[store.id] = {
          rating: String(existing.rating),
          feedback: existing.feedback || "",
        };
      }
    });
    setDraftReviews(nextDrafts);
  }, [currentUser.id, ratings, stores]);

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stores.filter((store) => {
      if (!query) return true;
      return (
        store.name.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query)
      );
    });
  }, [search, stores]);

  const stats = useMemo(
    () => [
      { label: "Stores Available", value: stores.length, note: "Registered stores" },
      {
        label: "Your Ratings",
        value: ratings.filter((rating) => rating.userId === currentUser.id).length,
        note: "Submitted by you",
      },
      {
        label: "Latest Average",
        value: stores.length ? formatRating(stores.reduce((sum, store) => sum + getStoreAverage(store.id), 0) / stores.length) : "0.0",
        note: "Across all stores",
      },
      {
        label: "Search Results",
        value: filteredStores.length,
        note: "Matching your query",
      },
    ],
    [currentUser.id, filteredStores.length, getStoreAverage, ratings, stores]
  );

  const handleSubmitRating = (storeId) => {
    setError("");
    setNotice("");
    const value = draftReviews[storeId]?.rating;
    const feedback = draftReviews[storeId]?.feedback || "";
    const validationError = validateRating(value);
    if (validationError) {
      setError(validationError);
      return;
    }

    const feedbackError = validateFeedback(feedback);
    if (feedbackError) {
      setError(feedbackError);
      return;
    }

    try {
      submitRating({ userId: currentUser.id, storeId, rating: Number(value), feedback });
      setNotice("Review saved.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordNotice("");

    if (passwordForm.password !== passwordForm.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      updatePassword({ userId: currentUser.id, password: passwordForm.password });
      setPasswordForm({ password: "", confirm: "" });
      setPasswordNotice("Password updated successfully.");
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  return (
    <PageShell
      user={currentUser}
      title="User store ratings"
      subtitle="Search stores by name or address, submit a rating and feedback, or update either one in place."
      navItems={[
        { to: "/user", label: "Stores" },
        { to: "/user#password", label: "Password" },
      ]}
      onLogout={logout}
    >
      {notice ? (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">{notice}</Card>
      ) : null}
      {error ? (
        <Card className="border-rose-200 bg-rose-50 text-rose-800">{error}</Card>
      ) : null}

      <StatsGrid items={stats} />

      <Card className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="app-title text-2xl font-bold text-slate-900">Registered stores</div>
          <p className="mt-2 text-sm text-slate-600">
            Each listing shows the overall rating, your submitted rating, and a direct save action.
          </p>
        </div>
        <Field
          label="Search stores"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or address"
          className="md:w-96"
        />
      </Card>

      <div className="grid gap-5">
        {filteredStores.map((store) => {
          const submitted = getSubmittedRating(ratings, currentUser.id, store.id);
          return (
            <Card key={store.id} className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="app-title text-2xl font-bold text-slate-900">{store.name}</div>
                  <div className="mt-2 text-sm text-slate-600">{store.address}</div>
                  <div className="mt-2 text-sm text-slate-500">{store.email}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric label="Overall Rating" value={<RatingPill value={averageRating(ratings, store.id)} />} />
                  <Metric
                    label="Your Rating"
                    value={
                      submitted ? (
                        <RatingPill value={submitted.rating} />
                      ) : (
                        <span className="text-slate-400">Not submitted</span>
                      )
                    }
                  />
                  <Metric label="Total Votes" value={ratingCount(ratings, store.id)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="grid gap-4 md:grid-cols-2 md:col-span-1">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Submit or modify rating</span>
                    <select
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      value={draftReviews[store.id]?.rating || ""}
                      onChange={(event) =>
                        setDraftReviews({
                          ...draftReviews,
                          [store.id]: {
                            ...(draftReviews[store.id] || {}),
                            rating: event.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Choose rating</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextAreaField
                    label="Feedback"
                    rows={4}
                    value={draftReviews[store.id]?.feedback || ""}
                    onChange={(event) =>
                      setDraftReviews({
                        ...draftReviews,
                        [store.id]: {
                          ...(draftReviews[store.id] || {}),
                          feedback: event.target.value,
                        },
                      })
                    }
                    hint="Write what stood out, what could be better, or anything you want the owner to know."
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => handleSubmitRating(store.id)}>
                    {submitted ? "Update review" : "Submit review"}
                  </Button>
                </div>
              </div>

              {submitted?.feedback ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Your feedback</div>
                  <p className="mt-2 leading-6">{submitted.feedback}</p>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>

      <Card id="password">
        <div className="app-title text-2xl font-bold text-slate-900">Update password</div>
        <p className="mt-2 text-sm text-slate-600">
          Normal users can update their password after logging in, matching the challenge scope.
        </p>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handlePasswordSubmit}>
          <Field
            label="New password"
            type="password"
            value={passwordForm.password}
            onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
            error={passwordForm.password ? validatePassword(passwordForm.password) : ""}
          />
          <Field
            label="Confirm password"
            type="password"
            value={passwordForm.confirm}
            onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })}
          />
          <div className="md:col-span-2">
            {passwordError ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {passwordError}
              </div>
            ) : null}
            {passwordNotice ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {passwordNotice}
              </div>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
