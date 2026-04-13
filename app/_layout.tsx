import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="room/[id]"
        options={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#6C63FF",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
    </Stack>
  );
}
