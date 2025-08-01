import RNCallKeep from "react-native-callkeep";
import { APP_NAME } from "@/constants";
import { PermissionsAndroid } from "react-native";

const options = {
  ios: {
    appName: APP_NAME,
  },
  android: {
    alertTitle: "Permissions required",
    alertDescription:
      "This application needs to access your phone accounts to make calls",
    cancelButton: "Cancel",
    okButton: "OK",
    // Required for Android 11+
    additionalPermissions: [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO],
    // Optionally you can add foreground service config
    foregroundService: {
      channelId: "com.yourapp.callkeep",
      channelName: "Foreground service for calls",
      notificationTitle: "YourAppName is running",
      notificationIcon: "ic_launcher", // your app icon
    },
  },
};

export async function setupCallKeep() {
  await RNCallKeep.setup(options);

  // Handle events
  RNCallKeep.addEventListener(
    "didReceiveStartCallAction",
    ({ callUUID, handle }) => {
      console.log("didReceiveStartCallAction", callUUID, handle);
      // Here, start your call UI & logic
    }
  );

  RNCallKeep.addEventListener("answerCall", ({ callUUID }) => {
    console.log("answerCall", callUUID);
    // Accept call and show your call screen
  });

  RNCallKeep.addEventListener("endCall", ({ callUUID }) => {
    console.log("endCall", callUUID);
    // End call & cleanup
  });

  RNCallKeep.addEventListener(
    "didDisplayIncomingCall",
    ({ callUUID, handle }) => {
      console.log("Incoming call displayed", callUUID, handle);
    }
  );

  RNCallKeep.addEventListener("didPerformSetMutedCallAction", ({ muted }) => {
    console.log("Call muted status changed", muted);
  });

  RNCallKeep.addEventListener("didToggleHoldCallAction", ({ hold }) => {
    console.log("Call hold toggled", hold);
  });
}

// To display an incoming call
export function displayIncomingCall(
  callUUID: string,
  handle: string,
  localizedCallerName?: string
) {
  RNCallKeep.displayIncomingCall(callUUID, handle, localizedCallerName);
}

// To start outgoing call
export function startCall(
  callUUID: string,
  handle: string,
  localizedCallerName?: string
) {
  RNCallKeep.startCall(callUUID, handle, localizedCallerName);
}

// To end call
export function endCall(callUUID: string) {
  RNCallKeep.endCall(callUUID);
}

// To set call muted state
export function setMutedCall(callUUID: string, muted: boolean) {
  RNCallKeep.setMutedCall(callUUID, muted);
}
