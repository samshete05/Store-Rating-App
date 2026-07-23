import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Container, Form, Nav, Navbar, Row } from "react-bootstrap";
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

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordNotice("");

    if (passwordForm.password !== passwordForm.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      await updatePassword({ userId: currentUser.id, password: passwordForm.password });
      setPasswordForm({ password: "", confirm: "" });
      setPasswordNotice("Password updated successfully.");
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  return (
    <DashboardShell
      currentUser={currentUser}
      title="Store owner dashboard"
      subtitle="See who rated your store, review average scores, and update your password after logging in."
      navItems={[
        { to: "/owner", label: "Overview" },
        { to: "/owner#password", label: "Password" },
      ]}
      onLogout={logout}
    >
      <StatsGrid items={stats} />

      <Row className="g-4 mb-4">
        <Col xs={12} xl={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="app-title h3 fw-bold mb-2">Your stores</div>
              <p className="text-secondary mb-4">Each store card shows the average rating and rating volume.</p>
              <div className="d-grid gap-3">
                {ownedStores.length ? (
                  ownedStores.map((store) => (
                    <div key={store.id} className="border rounded-3 bg-light p-3 p-md-4">
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div>
                          <div className="app-title h4 fw-bold mb-1">{store.name}</div>
                          <div className="text-secondary">{store.address}</div>
                          <div className="text-secondary small">{store.email}</div>
                        </div>
                        <div className="d-flex flex-wrap gap-3">
                          <Metric label="Average" value={<RatingPill value={averageRating(ratings, store.id)} />} />
                          <Metric label="Votes" value={ratingCount(ratings, store.id)} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="secondary" className="mb-0">
                    No store is currently assigned to this account.
                  </Alert>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} xl={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="app-title h3 fw-bold mb-2">Ratings on your stores</div>
              <p className="text-secondary mb-4">Search customer reviews, including written feedback, and see the latest submissions.</p>
              <Form.Group className="mb-4" controlId="searchReviews">
                <Form.Label>Search reviews</Form.Label>
                <Form.Control
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="User name, email, or store"
                />
              </Form.Group>
              <div className="d-grid gap-3">
                {storeRatings.length ? (
                  storeRatings.map((rating) => (
                    <div key={rating.id} className="border rounded-3 bg-light p-3 p-md-4">
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div>
                          <div className="fw-semibold">{rating.user?.name || "Unknown user"}</div>
                          <div className="text-secondary small">{rating.user?.email}</div>
                          <div className="text-secondary small">{rating.store?.name}</div>
                          {rating.feedback ? (
                            <p className="mt-3 mb-0 rounded-3 bg-white px-3 py-3 text-secondary shadow-sm">
                              {rating.feedback}
                            </p>
                          ) : (
                            <p className="mt-3 mb-0 text-secondary fst-italic">No written feedback.</p>
                          )}
                        </div>
                        <div className="text-md-end">
                          <RatingPill value={rating.rating} />
                          <div className="mt-2 small text-secondary">{formatDateTime(rating.updatedAt)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="secondary" className="mb-0">
                    No ratings match the current search.
                  </Alert>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card id="password" className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="app-title h3 fw-bold mb-2">Update password</div>
          <p className="text-secondary mb-4">Store owners can update their password after logging in.</p>
          <Form onSubmit={handlePasswordSubmit}>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="ownerPassword">
                  <Form.Label>New password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.password}
                    onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
                    isInvalid={Boolean(passwordForm.password && validatePassword(passwordForm.password))}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validatePassword(passwordForm.password)}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="ownerPasswordConfirm">
                  <Form.Label>Confirm password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              {passwordError ? <Alert variant="danger" className="mb-3">{passwordError}</Alert> : null}
              {passwordNotice ? <Alert variant="success" className="mb-3">{passwordNotice}</Alert> : null}
              <Button type="submit" variant="dark">
                Update password
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </DashboardShell>
  );
}

function DashboardShell({ currentUser, title, subtitle, navItems, onLogout, children }) {
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
                <Nav.Link key={item.label} as={Link} to={item.to} className="fw-semibold">
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
            <div className="d-flex align-items-center gap-3 ms-lg-auto">
              <div className="text-end small">
                <div className="fw-semibold">{currentUser.name}</div>
                <div className="text-white-50 text-capitalize">{currentUser.role.replaceAll("_", " ")}</div>
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
            <div className="text-uppercase small fw-semibold text-secondary" style={{ letterSpacing: "0.22em" }}>
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
              <div className="text-uppercase small fw-semibold text-secondary" style={{ letterSpacing: "0.18em" }}>
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

function RatingPill({ value }) {
  const rating = Number(value || 0);
  const variant = rating >= 4 ? "success" : rating >= 3 ? "warning" : rating > 0 ? "danger" : "secondary";

  return (
    <Badge bg={variant} text={variant === "warning" ? "dark" : undefined} pill className="px-3 py-2">
      {formatRating(rating)}
    </Badge>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border rounded-3 bg-white px-3 py-3 shadow-sm h-100">
      <div className="text-uppercase small text-secondary" style={{ letterSpacing: "0.18em" }}>
        {label}
      </div>
      <div className="mt-2 fw-semibold">{value}</div>
    </div>
  );
}