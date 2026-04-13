import { db } from "@/utils";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthScreen() {
  const [sentEmail, setSentEmail] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in to start chatting</Text>

      {!sentEmail ? (
        <EmailStep onSendEmail={setSentEmail} />
      ) : (
        <CodeStep sentEmail={sentEmail} onReset={() => setSentEmail("")} />
      )}
    </View>
  );
}

interface EmailStepProps {
  onSendEmail: (email: string) => void;
}

function EmailStep({ onSendEmail }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await db.auth.sendMagicCode({ email: trimmed });
      onSendEmail(trimmed);
    } catch {
      // Do not expose raw server error messages — they may leak account info.
      Alert.alert(
        "Could not send code",
        "Please check your email address and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.form}>
      <TextInput
        placeholder="you@example.com"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setEmail}
        value={email}
        onSubmitEditing={handleSubmit}
        returnKeyType="send"
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.btn, styles.primaryBtn, loading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.primaryBtnText}>
          {loading ? "Sending…" : "Send Magic Code"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.secondaryBtn]}
        onPress={() => db.auth.signInAsGuest()}
      >
        <Text style={styles.secondaryBtnText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
}

interface CodeStepProps {
  sentEmail: string;
  onReset: () => void;
}

function CodeStep({ sentEmail, onReset }: CodeStepProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmitCode() {
    const trimmed = code.trim();
    if (!trimmed || !/^\d{6}$/.test(trimmed)) {
      Alert.alert("Invalid code", "Please enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code: trimmed });
    } catch {
      // Generic message — do not reveal whether the code is wrong vs expired.
      Alert.alert(
        "Sign-in failed",
        "Invalid or expired code. Please try again."
      );
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.hint}>
        We sent a code to{"\n"}
        <Text style={styles.hintEmail}>{sentEmail}</Text>
      </Text>
      <TextInput
        placeholder="Enter 6-digit code"
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={setCode}
        value={code}
        onSubmitEditing={handleSubmitCode}
        returnKeyType="done"
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.btn, styles.primaryBtn, loading && styles.btnDisabled]}
        onPress={handleSubmitCode}
        disabled={loading}
      >
        <Text style={styles.primaryBtnText}>
          {loading ? "Verifying…" : "Confirm Code"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.resendLink} onPress={onReset}>
        <Text style={styles.resendText}>Wrong email? Go back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 36,
  },
  form: {
    gap: 14,
  },
  hint: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  hintEmail: {
    fontWeight: "600",
    color: "#111",
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fafafa",
    color: "#111",
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: "#6C63FF",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryBtn: {
    backgroundColor: "#f0f0f0",
  },
  secondaryBtnText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  resendLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  resendText: {
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "500",
  },
});
