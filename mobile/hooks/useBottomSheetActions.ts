import { useState, useCallback } from "react";
import { ToastAndroid, Alert } from "react-native";
import { Chat, User } from "@/types";
import { bottomSheetOptionsData } from "@/constants/data";
import { deleteChat, createGroup, leaveGroup, archiveChat } from "@/api/chat";

type UseBottomSheetActionsProps = {
  user: User | null;
  clearChat: (id: string) => void;
  setChats: (chats: any[]) => void;
  clearGroup: (id: string) => void;
  clearMessages: (id: string) => void;
  updateChat: (chat: Chat) => void;
};

export function useBottomSheetActions({
  user,
  clearChat,
  setChats,
  clearGroup,
  clearMessages,
  updateChat,
}: UseBottomSheetActionsProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Other user name
  const selectedChatName =
    selectedChat?.name ||
    selectedChat?.users?.find((u) => u.user._id !== user?._id)?.user?.name;

  const isArchived = selectedChat?.archivedInfos.some(
    (archive) => archive.user._id === user?._id
  );

  const filteredOptions = selectedChat
    ? bottomSheetOptionsData
        .filter(
          (option) =>
            option.showFor === "all" ||
            option.showFor === (selectedChat.isGroupChat ? "group" : "chat")
        )
        .map((option) => {
          if (option.path === "/archive" && isArchived) {
            return {
              ...option,
              name: "Unarchive",
              icon: "arrow-up-outline",
              path: "/unarchive",
            };
          }

          if (option.path === "/create-group") {
            return {
              ...option,
              name: `Create group chat with "${selectedChatName}"`,
            };
          }

          return option;
        })
    : [];

  const openSheet = (chat: Chat) => {
    setSelectedChat(chat);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setSelectedChat(null);
  };

  // Handler logic inside the hook
  const handleDeleteChat = (chat: Chat) => {
    return new Promise<void>((resolve) => {
      Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
        { text: "Cancel", style: "cancel", onPress: () => resolve() },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Call async logic but don't make onPress async
            (async () => {
              const data = await deleteChat(chat._id);
              if (data.status) {
                ToastAndroid.show(data.message, ToastAndroid.SHORT);
                clearChat(chat._id);
                clearMessages(chat._id);
              }
              resolve();
            })();
          },
        },
      ]);
    });
  };

  const handleCreateGroup = async (chat: Chat) => {
    const userIds = chat.users?.map((user) => user.user._id) ?? [];
    try {
      const data = await createGroup(userIds);
      if (data.status) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        if (data.result) {
          setChats([data.result]);
        }
      }
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  const handleArchiveChat = async (chat: Chat) => {
    try {
      const data = await archiveChat(chat._id);
      ToastAndroid.show(data.message, ToastAndroid.SHORT);

      updateChat(data.result);
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  const handleLeaveGroup = (chat: Chat) => {
    return new Promise<void>((resolve) => {
      Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
        { text: "Cancel", style: "cancel", onPress: () => resolve() },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            (async () => {
              try {
                const data = await leaveGroup(chat._id);
                if (data.status) {
                  ToastAndroid.show(data.message, ToastAndroid.SHORT);
                  clearGroup(chat._id);
                  clearMessages(chat._id);
                }
              } catch (error: any) {
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
              }
              resolve();
            })();
          },
        },
      ]);
    });
  };

  const handleOptionSelect = useCallback(
    async (index: number) => {
      if (!selectedChat) return;

      const isGroup = selectedChat.isGroupChat;
      const options = bottomSheetOptionsData.filter(
        (option) =>
          option.showFor === "all" ||
          option.showFor === (isGroup ? "group" : "chat")
      );
      const selectedOption = options[index];

      try {
        setIsLoadingAction(true);
         closeSheet();

        switch (selectedOption.path) {
          case "/delete":
            await handleDeleteChat(selectedChat);
            break;
          case "/create-group":
            await handleCreateGroup(selectedChat);
            break;
          case "/leave-group":
            await handleLeaveGroup(selectedChat);
            break;
          case "/archive":
          case "/unarchive":
            await handleArchiveChat(selectedChat);
            break;
          default:
            ToastAndroid.show(
              `${selectedOption.name} pressed`,
              ToastAndroid.SHORT
            );
            break;
        }
      } catch (error: any) {
        ToastAndroid.show(error.message, ToastAndroid.SHORT);
      } finally {
        setIsLoadingAction(false);
        closeSheet();
      }
    },
    [selectedChat]
  );

  return {
    selectedChat,
    isSheetVisible,
    isLoadingAction,
    filteredOptions,
    openSheet,
    closeSheet,
    handleOptionSelect,
  };
}
