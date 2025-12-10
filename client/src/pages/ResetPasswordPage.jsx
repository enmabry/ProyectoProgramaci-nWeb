import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  Text,
  Link,
  useToast,
} from "@chakra-ui/react";
import "../styles/login.css";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touchedPass, setTouchedPass] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast({ title: "Token faltante", status: "error", duration: 3000 });
    }
  }, [token]);

  const passError = !password
    ? "Contraseña requerida"
    : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
    ? ""
    : "Mín. 8 con mayúscula, minúscula y número";
  const confirmError = !confirm
    ? "Confirma la contraseña"
    : confirm !== password
    ? "Las contraseñas no coinciden"
    : "";

  const isValid = !passError && !confirmError && !!token;

  async function onSubmit(e) {
    e.preventDefault();
    setTouchedPass(true);
    setTouchedConfirm(true);
    if (!isValid) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "No se pudo restablecer la contraseña");
      toast({
        title: "Contraseña actualizada",
        status: "success",
        duration: 3000,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Flex minH="100vh" bg="brand.50" align="center" justify="center">
      <Box className="auth-container">
        <Box className="auth-card">
          <Heading size="lg" mb={5}>
            Restablecer contraseña
          </Heading>
          {!token && (
            <Text mb={4} color="red.500">
              Token inválido o faltante.
            </Text>
          )}
          <form onSubmit={onSubmit}>
            <FormControl mb={5} isInvalid={touchedPass && !!passError}>
              <FormLabel>Nueva contraseña</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouchedPass(true)}
                placeholder="Nueva contraseña"
                borderRadius="full"
              />
              <FormErrorMessage>{passError}</FormErrorMessage>
            </FormControl>
            <FormControl mb={5} isInvalid={touchedConfirm && !!confirmError}>
              <FormLabel>Confirmar contraseña</FormLabel>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouchedConfirm(true)}
                placeholder="Repite contraseña"
                borderRadius="full"
              />
              <FormErrorMessage>{confirmError}</FormErrorMessage>
            </FormControl>
            {error && (
              <Text color="red.500" mb={4}>
                {error}
              </Text>
            )}
            <Button
              type="submit"
              isLoading={submitting}
              isDisabled={!isValid || submitting}
              w="full"
              size="lg"
            >
              Restablecer
            </Button>
          </form>
          <Flex mt={4} justify="center">
            <Link as={RouterLink} to="/login" color="brand.700">
              Volver a iniciar sesión
            </Link>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
