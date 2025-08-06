import { BottomSheetOption, DetailItem, MenuItem, SettingItem } from "@/types";

export const DetailsData: (DetailItem & {
  showFor: "all" | "group" | "chat";
})[] = [
  {
    id: "1",
    label: "Search in chat",
    iconName: "search-outline",
    path: "/search",
    showFor: "all",
  },
  {
    id: "2",
    label: "Archive",
    iconName: "archive-outline",
    path: "/archive",
    showFor: "all",
  },
  {
    id: "3",
    label: "Mute",
    iconName: "notifications-off-outline",
    path: "/mute",
    showFor: "all",
  },
  {
    id: "4",
    label: `Create group chat with`,
    iconName: "person-outline",
    path: "/create-group",
    showFor: "chat",
  },
  {
    id: "5",
    label: "Members",
    iconName: "people-outline",
    path: "/members",
    showFor: "group",
  },
  {
    id: "6",
    label: "Block",
    iconName: "remove-circle-outline",
    path: "/block",
    showFor: "chat",
  },
  {
    id: "7",
    label: "Leave group",
    iconName: "log-out-outline",
    path: "/leave-group",
    showFor: "group",
  },
  {
    id: "8",
    label: "Delete",
    iconName: "trash-outline",
    path: "/delete",
    showFor: "all",
  },
];

export const bottomSheetOptionsData: (BottomSheetOption & {
  showFor: "all" | "group" | "chat";
})[] = [
  {
    _id: "1",
    name: "Archive",
    icon: "archive-outline",
    path: "/archive",
    showFor: "all",
  },
  {
    _id: "2",
    name: "Mute",
    icon: "notifications-off-outline",
    path: "/mute",
    showFor: "all",
  },
  {
    _id: "3",
    name: "Create group chat with",
    icon: "people-outline",
    path: "/create-group",
    showFor: "chat",
  },
  {
    _id: "4",
    name: "Leave group",
    icon: "exit-outline",
    path: "/leave-group",
    showFor: "group",
  },
  {
    _id: "5",
    name: "Delete",
    icon: "trash-outline",
    path: "/delete",
    showFor: "all",
  },
];

// Helper to get options based on chat type
export const getBottomSheetOptions = (
  isGroupChat: boolean
): BottomSheetOption[] => {
  return bottomSheetOptionsData.filter((option) => {
    if (option._id === "3" && isGroupChat) return false; // Hide "Create group chat with" for groups
    if (option._id === "4" && !isGroupChat) return false; // Hide "Leave group" for non-groups
    return true;
  });
};

export const SETTINGS: SettingItem[] = [
  {
    id: "1",
    label: "Settings",
    iconName: "settings-outline",
    path: "/setting",
  },
  {
    id: "2",
    label: "Help & Support",
    iconName: "help-circle-outline",
    path: "/help",
  },
  {
    id: "3",
    label: "Pravicy Policy",
    iconName: "document-lock-outline",
    path: "/privacy-policy",
  },
];

export const MENUS: MenuItem[] = [
  { id: "1", label: "Friends", iconName: "people-outline", path: "/friends" },
  {
    id: "2",
    label: "Groups",
    iconName: "people-circle-outline",
    path: "/groups",
  },
  {
    id: "3",
    label: "Message Request",
    iconName: "chatbubble-ellipses-outline",
    path: "/message-request",
  },
  {
    id: "4",
    label: "Archived Chats",
    iconName: "archive-outline",
    path: "/archived-chats",
  },
  // { id: "5", label: "Events", iconName: "calendar-outline", path: "/events" },
  // { id: "6", label: "Memories", iconName: "time-outline", path: "/memories" },
];
