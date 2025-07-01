import { DetailItem } from "@/types";

export const DetailData: (DetailItem & {
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
