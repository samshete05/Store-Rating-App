import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,Form,Modal,
  Nav,
  Navbar,
  Row,
  Table,
} from "react-bootstrap";
import { useApp } from "../context/AppContext";
import {
  averageRating,
  formatRating,
  formatRole,
  ratingCount,
  sortByField,
} from "../utils/helpers";
import {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
  validateStoreName,
} from "../utils/validation";

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
  const {
    currentUser,
    users,
    stores,
    ratings,
    addUser,
    addStore,
    logout,
    updatePassword,
  } = useApp();
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
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirm: "",
  });
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
            ? stores.reduce(
                (sum, store) => sum + averageRating(ratings, store.id),
                0,
              ) / stores.length
            : 0,
        ),
        note: "Platform wide",
      },
    ],
    [ratings, stores, users.length],
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

  const ownerOptions = users.filter(
    (user) => user.role === "store_owner" || user.role === "normal_user",
  );

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setUserError("");
    setNotice("");

    try {
      if (userForm.role === "store_owner" && !userForm.storeId) {
        throw new Error("Choose a store to assign to the store owner.");
      }

      await addUser(userForm);
      setUserForm(defaultUserForm);
      setNotice("User created successfully.");
    } catch (err) {
      setUserError(err.message);
    }
  };

  const handleStoreSubmit = async (event) => {
    event.preventDefault();
    setStoreError("");
    setNotice("");

    try {
      await addStore(storeForm);
      setStoreForm(defaultStoreForm);
      setNotice("Store created successfully.");
    } catch (err) {
      setStoreError(err.message);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordNotice("");

    if (passwordForm.password !== passwordForm.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      await updatePassword({
        userId: currentUser.id,
        password: passwordForm.password,
      });
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
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (row) => formatRole(row.role),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (row) => {
        if (row.role !== "store_owner")
          return <span className="text-secondary">-</span>;

        const store = stores.find((entry) => entry.id === row.storeId);
        return (
          <RatingPill value={store ? averageRating(ratings, store.id) : 0} />
        );
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
    <DashboardShell
      currentUser={currentUser}
      title="Admin overview"
      subtitle="Create users and stores, search every list, sort key fields, and inspect any record in detail."
      navItems={[
        { to: "/admin", label: "Overview" },
        { to: "/admin#stores", label: "Stores" },
        { to: "/admin#users", label: "Users" },
      ]}
      onLogout={logout}
    >
      {notice ? <Alert variant="success">{notice}</Alert> : null}

      <StatsGrid items={stats} />

      <Row className="g-4 mb-4">
        <Col xs={12} xl={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="app-title h3 fw-bold mb-2">Add a store</div>
              <p className="text-secondary mb-4">
                Create a new store and assign to a store owner.
              </p>
              <Form onSubmit={handleStoreSubmit} className="d-grid gap-3">
                <Form.Group controlId="storeName">
                  <Form.Label>Store Name</Form.Label>
                  <Form.Control
                    value={storeForm.name}
                    onChange={(event) =>
                      setStoreForm({ ...storeForm, name: event.target.value })
                    }
                    placeholder="Northwind Groceries"
                    isInvalid={Boolean(
                      storeForm.name && validateStoreName(storeForm.name),
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validateStoreName(storeForm.name)}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="storeEmail">
                  <Form.Label>Store Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={storeForm.email}
                    onChange={(event) =>
                      setStoreForm({ ...storeForm, email: event.target.value })
                    }
                    placeholder="store@example.com"
                    isInvalid={Boolean(
                      storeForm.email && validateEmail(storeForm.email),
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validateEmail(storeForm.email)}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="storeAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    value={storeForm.address}
                    onChange={(event) =>
                      setStoreForm({
                        ...storeForm,
                        address: event.target.value,
                      })
                    }
                    placeholder="Full postal address"
                    isInvalid={Boolean(
                      storeForm.address && validateAddress(storeForm.address),
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validateAddress(storeForm.address)}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="storeOwnerId">
                  <Form.Label>Owner</Form.Label>
                  <Form.Select
                    value={storeForm.ownerId}
                    onChange={(event) =>
                      setStoreForm({
                        ...storeForm,
                        ownerId: event.target.value,
                      })
                    }
                  >
                    <option value="">Unassigned</option>
                    {ownerOptions.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {storeError ? (
                  <Alert variant="danger" className="mb-0">
                    {storeError}
                  </Alert>
                ) : null}
                <div>
                  <Button type="submit" variant="dark">
                    Create store
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} xl={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="app-title h3 fw-bold mb-2">Add a user</div>
              <p className="text-secondary mb-4">
                Create a normal user, admin user, or store owner from one form.
              </p>
              <Form onSubmit={handleUserSubmit} className="d-grid gap-3">
                <Form.Group controlId="userName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={userForm.name}
                    onChange={(event) =>
                      setUserForm({ ...userForm, name: event.target.value })
                    }
                    placeholder="Cecilia Alexandra Bennett"
                    isInvalid={Boolean(
                      userForm.name && validateName(userForm.name),
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validateName(userForm.name)}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="userEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={userForm.email}
                    onChange={(event) =>
                      setUserForm({ ...userForm, email: event.target.value })
                    }
                    placeholder="user@example.com"
                    isInvalid={Boolean(
                      userForm.email && validateEmail(userForm.email),
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validateEmail(userForm.email)}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="userAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    value={userForm.address}
                    onChange={(event) =>
                      setUserForm({ ...userForm, address: event.target.value })
                    }
                    placeholder="Address"
                    isInvalid={Boolean(
                      userForm.address && validateAddress(userForm.address),
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validateAddress(userForm.address)}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="userPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={userForm.password}
                    onChange={(event) =>
                      setUserForm({ ...userForm, password: event.target.value })
                    }
                    placeholder="Admin@1234"
                    isInvalid={Boolean(
                      userForm.password && validatePassword(userForm.password),
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validatePassword(userForm.password)}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="userRole">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={userForm.role}
                    onChange={(event) =>
                      setUserForm({ ...userForm, role: event.target.value })
                    }
                  >
                    <option value="normal_user">Normal User</option>
                    <option value="admin">Admin</option>
                    <option value="store_owner">Store Owner</option>
                  </Form.Select>
                </Form.Group>
                {userForm.role === "store_owner" ? (
                  <Form.Group controlId="userStoreId">
                    <Form.Label>Assign Store</Form.Label>
                    <Form.Select
                      value={userForm.storeId}
                      onChange={(event) =>
                        setUserForm({
                          ...userForm,
                          storeId: event.target.value,
                        })
                      }
                    >
                      <option value="">Choose a store</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                ) : null}
                {userError ? (
                  <Alert variant="danger" className="mb-0">
                    {userError}
                  </Alert>
                ) : null}
                <div>
                  <Button type="submit" variant="dark">
                    Create user
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <section id="stores" className="mb-4">
        <div className="d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-3">
          <div>
            <h2 className="app-title h3 fw-bold mb-1">Stores</h2>
            <p className="text-secondary mb-0">
              Search by name, email, or address and sort by key fields.
            </p>
          </div>
          <Form.Group className="mb-0" controlId="filterStores">
            <Form.Label>Filter stores</Form.Label>
            <Form.Control
              value={storeQuery}
              onChange={(event) => setStoreQuery(event.target.value)}
              placeholder="Search stores"
            />
          </Form.Group>
        </div>
        <EntityTable
          title="Registered stores"
          columns={storeColumns}
          rows={filteredStores}
          sortConfig={storeSort}
          onSort={(key) =>
            setStoreSort((current) =>
              current.key === key
                ? {
                    key,
                    direction: current.direction === "asc" ? "desc" : "asc",
                  }
                : { key, direction: "asc" },
            )
          }
          rowActions={(row) => (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setActiveUser({ type: "store", item: row })}
            >
              View details
            </Button>
          )}
        />
      </section>

      <section id="users" className="mb-4">
        <div className="d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-3">
          <div>
            <h2 className="app-title h3 fw-bold mb-1">Users</h2>
            <p className="text-secondary mb-0">
              Filter across name, email, address, and role.
            </p>
          </div>
          <Form.Group className="mb-0" controlId="filterUsers">
            <Form.Label>Filter users</Form.Label>
            <Form.Control
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="Search users"
            />
          </Form.Group>
        </div>
        <EntityTable
          title="All users"
          columns={userColumns}
          rows={filteredUsers}
          sortConfig={userSort}
          onSort={(key) =>
            setUserSort((current) =>
              current.key === key
                ? {
                    key,
                    direction: current.direction === "asc" ? "desc" : "asc",
                  }
                : { key, direction: "asc" },
            )
          }
          rowActions={(row) => (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setActiveUser({ type: "user", item: row })}
            >
              View details
            </Button>
          )}
        />
      </section>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="app-title h3 fw-bold mb-2">Admin password</div>
          <p className="text-secondary mb-4">
            The challenge includes password updates after login. This panel
            gives the same flow to the admin account for completeness.
          </p>
          <Form onSubmit={handlePasswordSubmit} className="d-grid gap-3">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="adminPassword">
                  <Form.Label>New password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.password}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        password: event.target.value,
                      })
                    }
                    isInvalid={Boolean(
                      passwordForm.password &&
                      validatePassword(passwordForm.password),
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validatePassword(passwordForm.password)}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="adminPasswordConfirm">
                  <Form.Label>Confirm password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm: event.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            {passwordError ? (
              <Alert variant="danger" className="mb-0">
                {passwordError}
              </Alert>
            ) : null}
            {passwordNotice ? (
              <Alert variant="success" className="mb-0">
                {passwordNotice}
              </Alert>
            ) : null}
            <div>
              <Button type="submit" variant="dark">
                Update admin password
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal
        show={Boolean(activeUser)}
        onHide={() => setActiveUser(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {activeUser?.type === "user" ? "User details" : "Store details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeUser?.type === "user" ? (
            <Row className="g-3">
              <DetailCol label="Name" value={activeUser.item.name} />
              <DetailCol label="Email" value={activeUser.item.email} />
              <DetailCol label="Address" value={activeUser.item.address} />
              <DetailCol
                label="Role"
                value={formatRole(activeUser.item.role)}
              />
              {activeUser.item.role === "store_owner" ? (
                <DetailCol
                  label="Store Rating"
                  value={formatRating(
                    averageRating(ratings, activeUser.item.storeId || ""),
                  )}
                />
              ) : null}
            </Row>
          ) : (
            <Row className="g-3">
              <DetailCol label="Name" value={activeUser?.item.name} />
              <DetailCol label="Email" value={activeUser?.item.email} />
              <DetailCol label="Address" value={activeUser?.item.address} />
              <DetailCol
                label="Overall Rating"
                value={formatRating(
                  averageRating(ratings, activeUser?.item.id),
                )}
              />
              <DetailCol
                label="Rating Count"
                value={ratingCount(ratings, activeUser?.item.id)}
              />
              <DetailCol
                label="Owner"
                value={
                  users.find((user) => user.id === activeUser?.item.ownerId)
                    ?.name || "Unassigned"
                }
              />
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </DashboardShell>
  );
}

function DashboardShell({
  currentUser,
  title,
  subtitle,
  navItems,
  onLogout,
  children,
}) {
  return (
    <div className="min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid="xl">
          <Navbar.Brand className="d-flex align-items-center gap-2 fw-semibold">
            <span className="app-logo">SG</span>
            <span>StoreGrid</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="dashboard-nav" />
          <Navbar.Collapse id="dashboard-nav">
            <Nav className="me-auto gap-1">
              {navItems.map((item) => (
                <Nav.Link
                  key={item.label}
                  as={Link}
                  to={item.to}
                  className="fw-semibold"
                >
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
            <div className="d-flex align-items-center gap-3 ms-lg-auto">
              <div className="text-end small">
                <div className="fw-semibold">{currentUser.name}</div>
                <div className="text-white-50 text-capitalize">
                  {formatRole(currentUser.role)}
                </div>
              </div>
              <Button variant="outline-light" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid="xl" className="py-4 py-lg-5">
        <div className="mb-4 d-flex flex-column flex-lg-row justify-content-between gap-3">
          <div>
            <div
              className="text-uppercase small fw-semibold text-secondary"
              style={{ letterSpacing: "0.22em" }}
            >
              Dashboard
            </div>
            <h1 className="app-title display-6 fw-bold mb-2">{title}</h1>
            <p className="text-secondary mb-0">{subtitle}</p>
          </div>
          <div className="text-lg-end">
            <div className="small text-secondary">Signed in as</div>
            <div className="fw-semibold">{currentUser.email}</div>
          </div>
        </div>
        {children}
      </Container>
    </div>
  );
}

function StatsGrid({ items }) {
  return (
    <Row className="g-3 mb-4">
      {items.map((item) => (
        <Col key={item.label} xs={12} md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div
                className="text-uppercase small fw-semibold text-secondary"
                style={{ letterSpacing: "0.18em" }}
              >
                {item.label}
              </div>
              <div className="mt-2 d-flex align-items-end justify-content-between gap-3">
                <div className="app-title h2 mb-0 fw-bold">{item.value}</div>
                <Badge bg="secondary" pill className="text-uppercase">
                  {item.note}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function EntityTable({ title, columns, rows, sortConfig, onSort, rowActions }) {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-0">
        <div className="border-bottom px-4 py-3 d-flex align-items-center justify-content-between gap-3">
          <div>
            <div className="fw-semibold">{title}</div>
            <div className="text-secondary small">{rows.length} records</div>
          </div>
        </div>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.sortable ? (
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none fw-semibold text-dark"
                        onClick={() => onSort(column.key)}
                      >
                        {column.label}{" "}
                        {sortConfig.key === column.key
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </Button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
                {rowActions ? <th className="text-end">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="text-end">{rowActions(row)}</td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (rowActions ? 1 : 0)}
                    className="text-center text-secondary py-4"
                  >
                    No records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

function DetailCol({ label, value }) {
  return (
    <Col xs={12} sm={6}>
      <div className="border rounded-3 bg-light p-3 h-100">
        <div
          className="text-uppercase small text-secondary"
          style={{ letterSpacing: "0.18em" }}
        >
          {label}
        </div>
        <div className="mt-2 fw-semibold">{value}</div>
      </div>
    </Col>
  );
}

function RatingPill({ value }) {
  const rating = Number(value || 0);
  const variant =
    rating >= 4
      ? "success"
      : rating >= 3
        ? "warning"
        : rating > 0
          ? "danger"
          : "secondary";

  return (
    <Badge
      bg={variant}
      text={variant === "warning" ? "dark" : undefined}
      pill
      className="px-3 py-2"
    >
      {formatRating(rating)}
    </Badge>
  );
}
