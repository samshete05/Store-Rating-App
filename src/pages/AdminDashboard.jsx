import React, { useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import PageShell from "../components/PageShell";
import { Field } from "../components/Field";
import StatsGrid from "../components/StatsGrid";
import SortableTable, { RatingPill } from "../components/SortableTable";
import { useApp } from "../context/AppContext";
import {
  averageRating,
  formatRating,
  formatRole,
  ratingCount,
  sortByField,
} from "../utils/helpers";
import { validateAddress, validateEmail, validateName, validatePassword, validateStoreName } from "../utils/validation";

const defaultUserForm = {
  name: "",
  email: "",
  address: "",
  password: "",
  role: "normal_user",
  storeId: "",
};

const defaultStoreForm = {
  name: "",
  email: "",
  address: "",
  ownerId: "",
};

export default function AdminDashboard() {
  const { currentUser, users, stores, ratings, addUser, addStore, logout, updatePassword } = useApp();
  const [userQuery, setUserQuery] = useState("");
  const [storeQuery, setStoreQuery] = useState("");
  const [userSort, setUserSort] = useState({ key: "name", direction: "asc" });
  const [storeSort, setStoreSort] = useState({ key: "name", direction: "asc" });
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [storeForm, setStoreForm] = useState(defaultStoreForm);
  const [activeUser, setActiveUser] = useState(null);
  const [notice, setNotice] = useState("");
  const [userError, setUserError] = useState("");
  const [storeError, setStoreError] = useState("");
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

  const stats = useMemo(
    () => [
      { label: "Total Users", value: users.length, note: "All roles" },
      { label: "Total Stores", value: stores.length, note: "Registered" },
      { label: "Total Ratings", value: ratings.length, note: "Submitted" },
      {
        label: "Average Store Rating",
        value: formatRating(
          stores.length
            ? stores.reduce((sum, store) => sum + averageRating(ratings, store.id), 0) / stores.length
            : 0
        ),
        note: "Platform wide",
      },
    ],
    [ratings, stores, users.length]
  );

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    const rows = users.filter((user) => {
      if (!query) return true;
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.address.toLowerCase().includes(query) ||
        formatRole(user.role).toLowerCase().includes(query)
      );
    });
    return sortByField(rows, userSort.key, userSort.direction, (user) => {
      if (userSort.key === "rating") {
        const store = stores.find((entry) => entry.id === user.storeId);
        return store ? averageRating(ratings, store.id) : 0;
      }
      return user[userSort.key] || "";
    });
  }, [ratings, stores, userQuery, userSort.direction, userSort.key, users]);

  const filteredStores = useMemo(() => {
    const query = storeQuery.trim().toLowerCase();
    const rows = stores.filter((store) => {
      if (!query) return true;
      return (
        store.name.toLowerCase().includes(query) ||
        store.email.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query)
      );
    });
    return sortByField(rows, storeSort.key, storeSort.direction, (store) => {
      if (storeSort.key === "rating") return averageRating(ratings, store.id);
      if (storeSort.key === "owner") {
        const owner = users.find((user) => user.id === store.ownerId);
        return owner ? owner.name : "";
      }
      return store[storeSort.key] || "";
    });
  }, [ratings, storeQuery, storeSort.direction, storeSort.key, stores, users]);

  const ownerOptions = users.filter((user) => user.role === "store_owner" || user.role === "normal_user");

  const handleUserSubmit = (event) => {
    event.preventDefault();
    setUserError("");
    setNotice("");

    try {
      if (userForm.role === "store_owner" && !userForm.storeId) {
        throw new Error("Choose a store to assign to the store owner.");
      }
      addUser(userForm);
      setUserForm(defaultUserForm);
      setNotice("User created successfully.");
    } catch (err) {
      setUserError(err.message);
    }
  };

  const handleStoreSubmit = (event) => {
    event.preventDefault();
    setStoreError("");
    setNotice("");

    try {
      addStore(storeForm);
      setStoreForm(defaultStoreForm);
      setNotice("Store created successfully.");
    } catch (err) {
      setStoreError(err.message);
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

  const userColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true },
    { key: "role", label: "Role", sortable: true, render: (row) => formatRole(row.role) },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (row) => {
        if (row.role !== "store_owner") return <span className="text-slate-400">-</span>;
        const store = stores.find((entry) => entry.id === row.storeId);
        return <RatingPill value={store ? averageRating(ratings, store.id) : 0} />;
      },
    },
  ];

  const storeColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true },
    {
      key: "owner",
      label: "Owner",
      sortable: true,
      render: (row) => {
        const owner = users.find((user) => user.id === row.ownerId);
        return owner ? owner.name : "Unassigned";
      },
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (row) => <RatingPill value={averageRating(ratings, row.id)} />,
    },
  ];

  return (
    <PageShell
      user={currentUser}
      title="Admin overview"
      subtitle="Create users and stores, search every list, sort key fields, and inspect any record in detail."
      navItems={[
        { to: "/admin", label: "Overview" },
        { to: "/admin#stores", label: "Stores" },
        { to: "/admin#users", label: "Users" },
      ]}
      onLogout={logout}
    >
      {notice ? (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">{notice}</Card>
      ) : null}

      <StatsGrid items={stats} />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="app-title text-2xl font-bold text-slate-900">Add a store</div>
          <p className="mt-2 text-sm text-slate-600">
            Create a new store and optionally assign a store owner.
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleStoreSubmit}>
            <Field
              label="Store Name"
              value={storeForm.name}
              onChange={(event) => setStoreForm({ ...storeForm, name: event.target.value })}
              placeholder="Northwind Groceries"
              error={storeForm.name ? validateStoreName(storeForm.name) : ""}
            />
            <Field
              label="Store Email"
              value={storeForm.email}
              onChange={(event) => setStoreForm({ ...storeForm, email: event.target.value })}
              placeholder="store@example.com"
              error={storeForm.email ? validateEmail(storeForm.email) : ""}
            />
            <Field
              label="Address"
              value={storeForm.address}
              onChange={(event) => setStoreForm({ ...storeForm, address: event.target.value })}
              placeholder="Full postal address"
              error={storeForm.address ? validateAddress(storeForm.address) : ""}
            />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Owner</span>
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={storeForm.ownerId}
                onChange={(event) => setStoreForm({ ...storeForm, ownerId: event.target.value })}
              >
                <option value="">Unassigned</option>
                {ownerOptions.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </label>
            {storeError ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {storeError}
              </div>
            ) : null}
            <Button type="submit">Create store</Button>
          </form>
        </Card>

        <Card>
          <div className="app-title text-2xl font-bold text-slate-900">Add a user</div>
          <p className="mt-2 text-sm text-slate-600">
            Create a normal user, admin user, or store owner from one form.
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleUserSubmit}>
            <Field
              label="Name"
              value={userForm.name}
              onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              placeholder="Cecilia Alexandra Bennett"
              error={userForm.name ? validateName(userForm.name) : ""}
            />
            <Field
              label="Email"
              value={userForm.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              placeholder="user@example.com"
              error={userForm.email ? validateEmail(userForm.email) : ""}
            />
            <Field
              label="Address"
              value={userForm.address}
              onChange={(event) => setUserForm({ ...userForm, address: event.target.value })}
              placeholder="Address"
              error={userForm.address ? validateAddress(userForm.address) : ""}
            />
            <Field
              label="Password"
              type="password"
              value={userForm.password}
              onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
              placeholder="Admin@1234"
              error={userForm.password ? validatePassword(userForm.password) : ""}
            />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={userForm.role}
                onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}
              >
                <option value="normal_user">Normal User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </label>
            {userForm.role === "store_owner" ? (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Assign Store</span>
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={userForm.storeId}
                  onChange={(event) => setUserForm({ ...userForm, storeId: event.target.value })}
                >
                  <option value="">Choose a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {userError ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {userError}
              </div>
            ) : null}
            <Button type="submit">Create user</Button>
          </form>
        </Card>
      </div>

      <div id="stores" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="app-title text-2xl font-bold text-slate-900">Stores</h2>
            <p className="mt-1 text-sm text-slate-600">
              Search by name, email, or address and sort by key fields.
            </p>
          </div>
          <Field
            label="Filter stores"
            value={storeQuery}
            onChange={(event) => setStoreQuery(event.target.value)}
            placeholder="Search stores"
            className="md:w-80"
          />
        </div>
        <SortableTable
          title="Registered stores"
          columns={storeColumns}
          rows={filteredStores}
          sortConfig={storeSort}
          onSort={(key) =>
            setStoreSort((current) =>
              current.key === key
                ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
            )
          }
          rowActions={(row) => (
            <Button variant="soft" onClick={() => setActiveUser({ type: "store", item: row })}>
              View details
            </Button>
          )}
        />
      </div>

      <div id="users" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="app-title text-2xl font-bold text-slate-900">Users</h2>
            <p className="mt-1 text-sm text-slate-600">
              Filter across name, email, address, and role.
            </p>
          </div>
          <Field
            label="Filter users"
            value={userQuery}
            onChange={(event) => setUserQuery(event.target.value)}
            placeholder="Search users"
            className="md:w-80"
          />
        </div>
        <SortableTable
          title="All users"
          columns={userColumns}
          rows={filteredUsers}
          sortConfig={userSort}
          onSort={(key) =>
            setUserSort((current) =>
              current.key === key
                ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
            )
          }
          rowActions={(row) => (
            <Button variant="soft" onClick={() => setActiveUser({ type: "user", item: row })}>
              View details
            </Button>
          )}
        />
      </div>

      <Card>
        <div className="app-title text-2xl font-bold text-slate-900">Admin password</div>
        <p className="mt-2 text-sm text-slate-600">
          The challenge includes password updates after login. This panel gives the same flow to
          the admin account for completeness.
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
            <Button type="submit">Update admin password</Button>
          </div>
        </form>
      </Card>

      {activeUser ? (
        <Modal
          title={activeUser.type === "user" ? "User details" : "Store details"}
          onClose={() => setActiveUser(null)}
        >
          {activeUser.type === "user" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Name" value={activeUser.item.name} />
              <Detail label="Email" value={activeUser.item.email} />
              <Detail label="Address" value={activeUser.item.address} />
              <Detail label="Role" value={formatRole(activeUser.item.role)} />
              {activeUser.item.role === "store_owner" ? (
                <Detail
                  label="Store Rating"
                  value={formatRating(
                    averageRating(ratings, activeUser.item.storeId || "")
                  )}
                />
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Name" value={activeUser.item.name} />
              <Detail label="Email" value={activeUser.item.email} />
              <Detail label="Address" value={activeUser.item.address} />
              <Detail
                label="Overall Rating"
                value={formatRating(averageRating(ratings, activeUser.item.id))}
              />
              <Detail label="Rating Count" value={ratingCount(ratings, activeUser.item.id)} />
              <Detail
                label="Owner"
                value={
                  users.find((user) => user.id === activeUser.item.ownerId)?.name || "Unassigned"
                }
              />
            </div>
          )}
        </Modal>
      ) : null}
    </PageShell>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
