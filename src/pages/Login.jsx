import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner, Stack } from "react-bootstrap";
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      const destination = location.state?.from?.pathname || getHomePath(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center py-5">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={10} lg={6} xl={5}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <div className="mb-4">
                <div className="text-uppercase small fw-semibold text-secondary" style={{ letterSpacing: "0.22em" }}>
                  Sign in
                </div>
                <h1 className="app-title mt-2 mb-2 fw-bold">Welcome back</h1>
                <p className="text-secondary mb-0">Use your registered email and password to continue.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Stack gap={3}>
                  <Form.Group controlId="loginEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      placeholder="admin@storegrid.com"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="loginPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      placeholder="Admin@1234"
                      required
                    />
                  </Form.Group>
                  {error ? <Alert variant="danger" className="mb-0">{error}</Alert> : null}
                  <Button type="submit" variant="dark" className="w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </Stack>
              </Form>

              <div className="mt-4 rounded-3 border bg-light p-3 text-secondary">
                Need an account?{" "}
                <Link to="/register" className="fw-semibold text-decoration-none">
                  Register here
                </Link>
              </div>

              <Alert variant="info" className="mt-4 mb-0">
                <div className="fw-semibold mb-2">Demo credentials</div>
                <div className="small">Admin: admin@storegrid.com / Admin@1234</div>
                <div className="small">Owner: owner@storegrid.com / Owner@1234</div>
                <div className="small">User: user@storegrid.com / User@1234</div>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
