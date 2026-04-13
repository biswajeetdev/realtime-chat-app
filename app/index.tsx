import { AuthScreen } from "@/components/screens/AuthScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { db } from "@/utils";
import { View } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <db.SignedIn>
        <HomeScreen />
      </db.SignedIn>
      <db.SignedOut>
        <AuthScreen />
      </db.SignedOut>
    </View>
  );
}
