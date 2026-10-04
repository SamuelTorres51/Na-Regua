import { Stack } from "expo-router";

// PROVISÓRIO: sem proteção de sessão até a integração com a API. Quando ela
// existir, o layout raiz passa a usar Stack.Protected em volta deste grupo.
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{ animation: "slide_from_right", headerShown: false }}
    />
  );
}
