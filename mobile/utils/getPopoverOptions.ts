// import { ToastAndroid } from "react-native";

// interface PopoverOption {
//   label: string;
//   action: () => void;
// }

// export function getPopoverOptions(params: {
//   currentUserId: string;
//   targetUserId: string;
//   creatorId: string;
//   adminUserIds: Set<string>;
// }): PopoverOption[] {
//   const { currentUserId, targetUserId, creatorId, adminUserIds } = params;

//   const isSelf = targetUserId === currentUserId;
//   const isTargetAdmin = adminUserIds.has(targetUserId);
//   const isTargetCreator = targetUserId === creatorId;
//   const isCurrentCreator = currentUserId === creatorId;
//   const isCurrentAdmin = adminUserIds.has(currentUserId);
//   const isCurrentMember = !isCurrentCreator && !isCurrentAdmin;

//   const options: PopoverOption[] = [];

//   if (isSelf) return [];

//   // Always show PM Chat
//   options.push({
//     label: "PM Chat",
//     action: () => ToastAndroid.show("PM Chat", ToastAndroid.SHORT),
//   });

//   if (isCurrentCreator) {
//     if (isTargetCreator) return options;

//     if (isTargetAdmin) {
//       options.unshift({
//         label: "Remove Admin",
//         action: () => ToastAndroid.show("Removed Admin", ToastAndroid.SHORT),
//       });
//     } else {
//       options.unshift({
//         label: "Make Admin",
//         action: () => ToastAndroid.show("Made Admin", ToastAndroid.SHORT),
//       });
//     }

//     options.unshift({
//       label: "Remove from group",
//       action: () => ToastAndroid.show("Removed from group", ToastAndroid.SHORT),
//     });
//   } else if (isCurrentAdmin) {
//     if (isTargetCreator) return options;

//     if (isTargetAdmin) {
//       options.unshift({
//         label: "Request Remove Admin",
//         action: () =>
//           ToastAndroid.show("Requested removal", ToastAndroid.SHORT),
//       });
//     } else {
//       options.unshift({
//         label: "Make Admin",
//         action: () => ToastAndroid.show("Made Admin", ToastAndroid.SHORT),
//       });
//       options.unshift({
//         label: "Remove from group",
//         action: () =>
//           ToastAndroid.show("Removed from group", ToastAndroid.SHORT),
//       });
//     }
//   }

//   return options;
// }
