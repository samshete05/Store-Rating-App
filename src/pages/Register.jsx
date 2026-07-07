import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row, Stack } from "react-bootstrap";
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

  // react hook to redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(getHomePath(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  // react hook submit handler 
  // error handle 
  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      // register the user using the registerUser function from context 
      registerUser(form);
      // set success message and reset form
      setSuccess("Registration completed. You can sign in now.");
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
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
                  Signup
                </div>
                <h1 className="app-title mt-2 mb-2 fw-bold">Create a user account</h1>
                <p className="text-secondary mb-0">Register as a normal user with name, email, address, and password.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Stack gap={3}>
                  <Form.Group controlId="registerName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="Aarav Prakash Menon"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="registerEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      placeholder="name@example.com"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="registerAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      value={form.address}
                      onChange={(event) => setForm({ ...form, address: event.target.value })}
                      placeholder="Street, city, state"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="registerPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      placeholder="User@1234"
                      required
                    />
                  </Form.Group>

                  {error ? <Alert variant="danger" className="mb-0">{error}</Alert> : null}
                  {success ? <Alert variant="success" className="mb-0">{success}</Alert> : null}

                  <Button type="submit" variant="dark" className="w-100">
                    Create account
                  </Button>
                </Stack>
              </Form>

              <p className="mt-4 mb-0 text-secondary">
                Already have an account?{" "}
                <Link to="/login" className="fw-semibold text-decoration-none">
                  Sign in
                </Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
