import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Copy, Field, Page, usePalette } from "@/components/workspace-ui";
import { Spacing as S, Type, Radius } from "@/constants/theme";
export default function Home() {
  const c = usePalette();
  const [search, setSearch] = useState("");
  return (
    <Page>
      <View style={{ gap: S.two, paddingVertical: S.four }}>
        <Text
          style={{
            color: c.accent,
            fontSize: Type.small,
            fontWeight: "700",
            letterSpacing: 2,
          }}
        >
          YOUR EVERYDAY WORKSPACE
        </Text>
        <Text
          style={{
            color: c.text,
            fontSize: 36,
            fontWeight: "700",
            lineHeight: 42,
          }}
        >
          All your tools.{"\n"}One place.
        </Text>
        <Copy muted>A personal collection of apps, built around you.</Copy>
      </View>
      <Field
        label="Find an app"
        placeholder="Search your apps"
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Copy title>Your apps</Copy>
        <Copy muted>01 app</Copy>
      </View>
      <ScrollView style={{ flex: 1, marginTop: S.four }}>
        {("whatsapp api messaging".includes(search.toLowerCase())) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open WhatsApp API"
            onPress={() => router.push("/whatsapp")}
            style={({ pressed }) => ({
              backgroundColor: c.surface,
              borderRadius: Radius.large,
              borderCurve: "continuous",
              padding: S.four,
              gap: S.four,
              opacity: pressed ? 0.7 : 1,
              borderWidth: 1,
              borderColor: c.line,
              marginBottom: S.four,
            })}
          >
            <Image
              source={require("@/assets/images/whatsapp-api.png")}
              style={{ width: 84, height: 84, borderRadius: Radius.medium }}
            />
            <View style={{ gap: S.two }}>
              <Copy title>WhatsApp API</Copy>
              <Copy muted>Conversations, media and message templates.</Copy>
            </View>
            <Text
              style={{ color: c.accent, fontSize: Type.body, fontWeight: "600" }}
            >
              Open workspace →
            </Text>
          </Pressable>
        )}

        {("vps studio hostinger dashboard server".includes(search.toLowerCase())) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open VPS Studio"
            onPress={() => router.push("/vps")}
            style={({ pressed }) => ({
              backgroundColor: c.surface,
              borderRadius: Radius.large,
              borderCurve: "continuous",
              padding: S.four,
              gap: S.four,
              opacity: pressed ? 0.7 : 1,
              borderWidth: 1,
              borderColor: c.line,
              marginBottom: S.four,
            })}
          >
            <View style={{ width: 84, height: 84, borderRadius: Radius.medium, backgroundColor: '#2b2b2b', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 32 }}>☁️</Text>
            </View>
            <View style={{ gap: S.two }}>
              <Copy title>VPS Studio</Copy>
              <Copy muted>Manage Hostinger server status and controls.</Copy>
            </View>
            <Text
              style={{ color: c.accent, fontSize: Type.body, fontWeight: "600" }}
            >
              Open workspace →
            </Text>
          </Pressable>
        )}
        
        {search && !("whatsapp api messaging vps studio hostinger dashboard server".includes(search.toLowerCase())) && (
          <Copy muted>No apps match “{search}”.</Copy>
        )}
      </ScrollView>
      <Copy muted>Your collection will grow here as we build more apps.</Copy>
    </Page>
  );
}
