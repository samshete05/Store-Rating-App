import React, { useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { Field } from "../components/Field";
import StatsGrid from "../components/StatsGrid";
import { RatingPill } from "../components/SortableTable";
import { useApp } from "../context/AppContext";
import { averageRating, formatDateTime, formatRating, ratingCount } from "../utils/helpers";
import { validatePassword } from "../utils/validation";

export default function OwnerDashboard() {
  const { currentUser, users, stores, ratings, logout, updatePassword } = useApp();
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [query, setQuery] = useState("");

  const ownedStores = stores.filter((store) => store.ownerId === currentUser.id);

  const storeRatings = useMemo(() => {
    const search = query.trim().toLowerCase();
    return ratings
      .filter((rating) => ownedStores.some((store) => store.id === rating.storeId))
      .map((rating) => ({
        ...rating,
        user: users.find((user) => user.id === rating.userId),
        store: stores.find((store) => store.id === rating.storeId),
      }))
      .filter((rating) => {
        if (!search) return true;
        return (
          rating.user?.name.toLowerCase().includes(search) ||
          rating.user?.email.toLowerCase().includes(search) ||
          rating.store?.name.toLowerCase().includes(search) ||
          (rating.feedback || "").toLowerCase().includes(search)
        );
      });
  }, [ownedStores, query, ratings, stores, users]);

  const stats = useMemo(
    () => [
      { label: "Owned Stores", value: ownedStores.length, note: "Assigned to you" },
      {
        label: "Total Ratings",
        value: ownedStores.reduce((sum, store) => sum + ratingCount(ratings, store.id), 0),
        note: "Customer feedback",
      },
      {
        label: "Average Rating",
        value: ownedStores.length
          ? formatRating(
              ownedStores.reduce((sum, store) => sum + averageRating(ratings, store.id), 0) /
                ownedStores.length
            )
          : "0.0",
        note: "Across your stores",
      },
      {
        label: "Visible Reviews",
        value: storeRatings.length,
        note: "After search filter",
      },
    ],
    [ownedStores, ratings, storeRatings.length]
  );

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
      title="Store owner dashboard"
      subtitle="See who rated your store, review average scores, and update your password after logging in."
      navItems={[
        { to: "/owner", label: "Overview" },
        { to: "/owner#password", label: "Password" },
      ]}
      onLogout={logout}
    >
      <StatsGrid items={stats} />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="app-title text-2xl font-bold text-slate-900">Your stores</div>
          <p className="mt-2 text-sm text-slate-600">
            Each store card shows the average rating and rating volume.
          </p>
          <div className="mt-5 space-y-4">
            {ownedStores.length ? (
              ownedStores.map((store) => (
                <div key={store.id} className="rounded-3xl bg-slate-50 px-5 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="app-title text-xl font-bold text-slate-900">{store.name}</div>
                      <div className="mt-1 text-sm text-slate-600">{store.address}</div>
                      <div className="mt-1 text-sm text-slate-500">{store.email}</div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Metric label="Average" value={<RatingPill value={averageRating(ratings, store.id)} />} />
                      <Metric label="Votes" value={ratingCount(ratings, store.id)} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 px-5 py-8 text-sm text-slate-500">
                No store is currently assigned to this account.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="app-title text-2xl font-bold text-slate-900">Ratings on your stores</div>
          <p className="mt-2 text-sm text-slate-600">
            Search customer reviews, including written feedback, and see the latest submissions.
          </p>
          <div className="mt-5">
            <Field
              label="Search reviews"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="User name, email, or store"
            />
          </div>
          <div className="mt-5 space-y-3">
            {storeRatings.length ? (
              storeRatings.map((rating) => (
                <div key={rating.id} className="rounded-3xl bg-slate-50 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {rating.user?.name || "Unknown user"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{rating.user?.email}</div>
                      <div className="mt-1 text-xs text-slate-500">{rating.store?.name}</div>
                      {rating.feedback ? (
                        <p className="mt-3 max-w-xl rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                          {rating.feedback}
                        </p>
                      ) : (
                        <p className="mt-3 text-xs italic text-slate-400">No written feedback.</p>
                      )}
                    </div>
                    <div className="text-right">
                      <RatingPill value={rating.rating} />
                      <div className="mt-2 text-xs text-slate-500">
                        {formatDateTime(rating.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 px-5 py-8 text-sm text-slate-500">
                No ratings match the current search.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card id="password">
        <div className="app-title text-2xl font-bold text-slate-900">Update password</div>
        <p className="mt-2 text-sm text-slate-600">
          Store owners can update their password after logging in.
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
    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
