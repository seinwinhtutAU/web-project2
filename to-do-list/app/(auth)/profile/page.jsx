"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/context/userProvider";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { green, red } from "@mui/material/colors";

// Define a custom theme with a lighter green primary color
const lightGreenTheme = createTheme({
  palette: {
    primary: {
      main: green[600], // A lighter, more vibrant green
    },
    secondary: {
      main: green[300], // An even lighter green for accents
    },
    error: {
      main: red[300], // A standard red for errors
    },
    background: {
      default: "#f1f8e9", // A very light mint green for the page background
      paper: "#ffffff", // White for the card background
    },
  },
});

export default function ProfilePage() {
  const { currentUser, updateUser, deleteUser } = useUser();
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [password, setPassword] = useState("********"); // invisible default
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(currentUser?.name || "");
    setEmail(currentUser?.email || "");
  }, [currentUser]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!currentUser) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (email !== currentUser.email) {
        const res = await fetch(
          `/api/check-email?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (data.exists) {
          setError("This email is already in use by another user.");
          setLoading(false);
          return;
        }
      }

      const updateData = { name, email };
      if (password !== "********") updateData.password = password;

      await updateUser(updateData);
      setPassword("********");
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update user:", err);
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    try {
      await deleteUser();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordFocus = () => {
    if (password === "********") {
      setPassword("");
    }
  };

  return (
    <ThemeProvider theme={lightGreenTheme}>
      <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            Your Profile
          </Typography>

          <Card sx={{ width: "100%", p: 4, borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={2} sx={{ mb: 2 }}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
              </Stack>

              <Box
                component="form"
                onSubmit={handleUpdate}
                noValidate
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                sx={{ mt: 1 }}
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
