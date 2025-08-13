import React from "react";
import { Library, ReactNativeLegal } from "react-native-legal";
import { ActivityIndicator, FlatList, Linking, View } from "react-native";

import LicenseRow from "@/components/LicenseRow";
import { fetchLicenses } from "@/services/licenses";
import { ThemedView } from "@/components/ThemedView";
import ScreenHeader from "@/components/ScreenHeader";

export default function LicensesListScreen() {
  const [items, setItems] = React.useState<Library[] | null>(null);

  React.useEffect(() => {
    fetchLicenses()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (!items) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScreenHeader title="Open-source Licenses" />
      <FlatList
        data={items}
        keyExtractor={(lib) => lib.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => {
          const match = item.id.match(/^(.*)@(\d.*)$/);
          const pkgName = match ? match[1] : item.id;
          const pkgVersion = match ? match[2] : undefined;
          return (
            <LicenseRow
              name={item.name || pkgName}
              licenseName={item.licenses?.[0]?.name}
              version={pkgVersion}
              description={item.description}
              website={item.website}
              onPress={async () =>
                await Linking.openURL(item.website || "https://github.com")
              }
            />
          );
        }}
      />
    </ThemedView>
  );
}
