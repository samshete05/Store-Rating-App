import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Container, Form, Nav, Navbar, Row } from "react-bootstrap";
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
  }, [currentUser.id, ratings, stores, getSubmittedRating]);

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stores.filter((store) => {
      if (!query) return true;

      return store.name.toLowerCase().includes(query) || store.address.toLowerCase().includes(query);
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
        value: stores.length
          ? formatRating(stores.reduce((sum, store) => sum + getStoreAverage(store.id), 0) / stores.length)
          : "0.0",
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
    <DashboardShell
      currentUser={currentUser}
      title="User store ratings"
      subtitle="Search stores by name or address, submit a rating and feedback, or update either one in place."
      navItems={[
        { to: "/user", label: "Stores" },
        { to: "/user#password", label: "Password" },
      ]}
      onLogout={logout}
    >
      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <StatsGrid items={stats} />

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div>
            <div className="app-title h3 fw-bold mb-2">Registered stores</div>
            <p className="text-secondary mb-0">
              Each listing shows the overall rating, your submitted rating, and a direct save action.
            </p>
          </div>
          <Form.Group className="mb-0" controlId="searchStores">
            <Form.Label>Search stores</Form.Label>
            <Form.Control
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or address"
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <div className="d-grid gap-4">
        {filteredStores.map((store) => {
          const submitted = getSubmittedRating(ratings, currentUser.id, store.id);

          return (
            <Card key={store.id} className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
                  <div>
                    <div className="app-title h3 fw-bold mb-2">{store.name}</div>
                    <div className="text-secondary">{store.address}</div>
                    <div className="text-secondary small">{store.email}</div>
                  </div>
                  <Row className="g-3">
                    <Col xs={12} sm={4}>
                      <Metric label="Overall Rating" value={<RatingPill value={averageRating(ratings, store.id)} />} />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Metric
                        label="Your Rating"
                        value={submitted ? <RatingPill value={submitted.rating} /> : <span className="text-secondary">Not submitted</span>}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Metric label="Total Votes" value={ratingCount(ratings, store.id)} />
                    </Col>
                  </Row>
                </div>

                <Row className="g-4 mt-2">
                  <Col xs={12} md={8}>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <Form.Group controlId={`rating-${store.id}`}>
                          <Form.Label>Submit or modify rating</Form.Label>
                          <Form.Select
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
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Group controlId={`feedback-${store.id}`}>
                          <Form.Label>Feedback</Form.Label>
                          <Form.Control
                            as="textarea"
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
                            placeholder="Write what stood out, what could be better, or anything you want the owner to know."
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={12} md={4} className="d-flex align-items-end">
                    <Button variant="dark" onClick={() => handleSubmitRating(store.id)}>
                      {submitted ? "Update review" : "Submit review"}
                    </Button>
                  </Col>
                </Row>

                {submitted?.feedback ? (
                  <div className="mt-4 border rounded-3 bg-light p-3">
                    <div className="text-uppercase small text-secondary" style={{ letterSpacing: "0.18em" }}>
                      Your feedback
                    </div>
                    <p className="mt-2 mb-0 text-secondary">{submitted.feedback}</p>
                  </div>
                ) : null}
              </Card.Body>
            </Card>
          );
        })}
      </div>

      <Card id="password" className="border-0 shadow-sm mt-4">
        <Card.Body className="p-4">
          <div className="app-title h3 fw-bold mb-2">Update password</div>
          <p className="text-secondary mb-4">
            Normal users can update their password after logging in, matching the challenge scope.
          </p>
          <Form onSubmit={handlePasswordSubmit}>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="userPassword">
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
                <Form.Group controlId="userPasswordConfirm">
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