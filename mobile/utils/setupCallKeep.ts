// import { APP_NAME } from "@/constants";
// import { PermissionsAndroid } from "react-native";
// import RNCallKeep from "react-native-callkeep";

// const callkeepConfig = {
//   ios: {
//     appName: "MyApp",
//   },
//   android: {
//     alertTitle: "Phone Call Permission",
//     alertDescription: `${APP_NAME} needs access to show incoming call UI and handle calls.`,
//     cancelButton: "Cancel",
//     okButton: "Allow",
//     additionalPermissions: [PermissionsAndroid.PERMISSIONS.CALL_PHONE],
//     foregroundService: {
//       channelId: "com.chat.mal",
//       channelName: "Call Notifications",
//       notificationTitle: `Calling in Progress`,
//       // notificationIcon: "",
//     },
//   },
// };

// export const setupCallKeep = async () => {
//   try {
//     await RNCallKeep.setup(callkeepConfig);
//     await RNCallKeep.setAvailable(true);
//   } catch (err: any) {
//     console.error("CallKeep setup failed", err.message);
//   }
// };
