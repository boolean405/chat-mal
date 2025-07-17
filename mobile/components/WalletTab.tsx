import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  balance: number;
  tint: string;
  backgroundColor: string;
}

export const WalletTab: React.FC<Props> = ({
  balance,
  tint,
  backgroundColor,
}) => (
  <ThemedView style={[styles.walletTab, { backgroundColor }]}>
    <Ionicons name="wallet-outline" size={28} color={tint} />
    <ThemedView
      style={[styles.walletInfo, { backgroundColor: backgroundColor }]}
    >
      <ThemedText type="large" style={[styles.walletLabel, { color: tint }]}>
        Balance
      </ThemedText>
      <ThemedText type="larger" style={[styles.walletAmount, { color: tint }]}>
        ${balance.toFixed(2)}
      </ThemedText>
    </ThemedView>
    <TouchableOpacity style={styles.addMoneyButton}>
      <Ionicons name="add-circle-outline" size={28} color={tint} />
      <ThemedText type="large" style={[styles.addMoneyText, { color: tint }]}>
        Deposit
      </ThemedText>
    </TouchableOpacity>
  </ThemedView>
);

const styles = StyleSheet.create({
  walletTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
  },
  walletInfo: {
    flex: 1,
    marginLeft: 15,
  },
  walletLabel: {
    fontWeight: "600",
  },
  walletAmount: {
    fontWeight: "bold",
    marginTop: 4,
  },
  addMoneyButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addMoneyText: {
    fontWeight: "600",
    marginLeft: 6,
  },
});
