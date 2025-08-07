// import { useFocusEffect, useRouter } from "expo-router";
// import { useCallback, useEffect, useRef, useState } from "react";
// import useDebounce from "@/hooks/useDebounce";
// import {
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   ActivityIndicator,
//   ToastAndroid,
//   useColorScheme,
// } from "react-native";
// import { createOrOpen } from "@/api/chat";
// import { ThemedView } from "@/components/ThemedView";
// import { ThemedText } from "@/components/ThemedText";
// import { Colors } from "@/constants/colors";
// import UserItem from "@/components/UserItem";
// import { useUsersSearchStore } from "@/stores/usersSearchStore";
// import { Ionicons } from "@expo/vector-icons";
// import { User } from "@/types";
// import { useChatStore } from "@/stores/chatStore";
// import { useAuthStore } from "@/stores/authStore";
// import { getMe } from "@/api/user";

// export default function Search() {
//   const router = useRouter();
//   const inputRef = useRef<TextInput>(null);
//   const colorScheme = useColorScheme();
//   const color = Colors[colorScheme ?? "light"];

//   const [loading, setLoading] = useState(false);
//   const isNavigatingRef = useRef(false);

//   const user = useAuthStore((state) => state.user);
//   const updateUser = useAuthStore((state) => state.updateUser);
//   const { setChats, getChatById, onlineUserIds } = useChatStore();

//   const {
//     results,
//     // page,
//     keyword,
//     selectedFilter,
//     hasMore,
//     isLoading,
//     isPaging,
//     // errorMessage,
//     setKeyword,
//     setSelectedFilter,
//     fetchSearchUsers,
//   } = useUsersSearchStore();

//   const debouncedKeyword = useDebounce(keyword, 400);

//   useFocusEffect(
//     useCallback(() => {
//       const refreshUser = async () => {
//         try {
//           const data = await getMe();
//           updateUser(data.result.user); // Updates Zustand store
//         } catch (error: any) {
//           console.log("Failed to refresh user", error.message);
//         }
//       };

//       refreshUser();
//     }, [updateUser])
//   );

//   useEffect(() => {
//     fetchSearchUsers(false);
//   }, [debouncedKeyword, fetchSearchUsers, selectedFilter]);

//   const handleLoadMore = async () => {
//     if (hasMore && !isPaging && !isLoading) {
//       await fetchSearchUsers(true);
//     }
//   };

//   const handleResult = async (user: User) => {
//     if (isNavigatingRef.current) return;
//     isNavigatingRef.current = true;
//     setLoading(true);

//     try {
//       const response = await createOrOpen(user._id);
//       const chat = response.data.result;

//       if (response.status === 200 && !getChatById(chat._id)) {
//         setChats([chat]);
//       } else if (response.status === 201) {
//         setChats([chat]);
//       }

//       router.push({
//         pathname: "/(chat)",
//         params: { chatId: chat._id },
//       });
//     } catch (error: any) {
//       ToastAndroid.show(error.message, ToastAndroid.SHORT);
//     } finally {
//       // Wait a bit to allow navigation to settle
//       setTimeout(() => {
//         isNavigatingRef.current = false;
//       }, 1000); // consistent delay for all cases
//       setLoading(false);
//     }
//   };

//   if (!user) return null;

//   const filterTypes = ["All", "Online", "Male", "Female"];

//   const friends = results.filter(
//     (u) => user.following.includes(u._id) && user.followers.includes(u._id)
//   );
//   const filteredFriends =
//     selectedFilter === "Online"
//       ? friends.filter((u) => onlineUserIds.includes(u._id))
//       : friends;

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor: color.primaryBackground }]}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
//     >
//       {/* Header */}
//       <ThemedView
//         style={[styles.header, { borderBottomColor: color.primaryBorder }]}
//       >
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons
//             name="chevron-back-outline"
//             size={22}
//             color={color.primaryIcon}
//           />
//         </TouchableOpacity>
//         <ThemedView style={styles.headerTitleContainer}>
//           <ThemedText type="headerTitle">Groups</ThemedText>
//         </ThemedView>
//       </ThemedView>
//       <ThemedView style={styles.headerInputContainer}>
//         <ThemedView style={styles.inputContainer}>
//           <ThemedView
//             style={[
//               styles.inputTextContainer,
//               { backgroundColor: color.secondaryBackground },
//             ]}
//           >
//             <Ionicons
//               name="search-outline"
//               size={22}
//               color={color.primaryIcon}
//             />
//             <TextInput
//               ref={inputRef}
//               value={keyword}
//               onChangeText={setKeyword}
//               placeholder="Search"
//               placeholderTextColor="gray"
//               style={[styles.textInput, { color: color.primaryText }]}
//             />
//           </ThemedView>
//         </ThemedView>
//       </ThemedView>

//       <ThemedView
//         style={[
//           styles.filterContainer,
//           { borderBottomColor: color.primaryBorder },
//         ]}
//       >
//         {filterTypes.map((filter) => (
//           <TouchableOpacity
//             key={filter}
//             style={[
//               styles.filterButton,
//               { borderColor: color.secondaryBorder },
//               selectedFilter === filter && {
//                 backgroundColor: color.primaryText,
//               },
//             ]}
//             onPress={() => setSelectedFilter(filter)}
//           >
//             <ThemedText
//               type="small"
//               style={[
//                 {
//                   color:
//                     selectedFilter === filter
//                       ? color.primaryBackground
//                       : color.primaryText,
//                 },
//               ]}
//             >
//               {filter}
//             </ThemedText>
//           </TouchableOpacity>
//         ))}
//       </ThemedView>

//       <FlatList
//         data={filteredFriends}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => {
//           let isOnline = false;
//           const otherUserId = item._id !== user._id ? item._id : null;
//           if (otherUserId) isOnline = onlineUserIds.includes(otherUserId);
//           return (
//             <UserItem
//               user={item}
//               isOnline={isOnline}
//               disabled={loading}
//               onPress={() => handleResult(item)}
//             />
//           );
//         }}
//         ListEmptyComponent={
//           debouncedKeyword && !isLoading ? (
//             <ThemedText style={{ textAlign: "center", marginVertical: 10 }}>
//               No results found!
//             </ThemedText>
//           ) : null
//         }
//         style={styles.resultList}
//         showsVerticalScrollIndicator={false}
//         onEndReached={handleLoadMore}
//         onEndReachedThreshold={1}
//         ListFooterComponent={
//           hasMore && results.length > 0 && isPaging ? (
//             <ActivityIndicator size="small" color={color.primaryIcon} />
//           ) : null
//         }
//       />
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: "center",
//     marginRight: 22,
//   },
//   header: {
//     padding: 15,
//     // paddingRight: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     borderBottomWidth: 0.4,
//   },
//   headerInputContainer: {
//     paddingVertical: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   inputContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//   },
//   inputTextContainer: {
//     height: 40,
//     width: "95%",
//     borderRadius: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   textInput: {
//     flex: 1,
//     paddingBottom: 0,
//     paddingTop: 0,
//     height: "100%",
//     paddingLeft: 20,
//   },
//   filterContainer: {
//     flexDirection: "row",
//     paddingHorizontal: 30,
//     borderBottomWidth: 0.4,
//     paddingBottom: 10,
//   },
//   filterButton: {
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 20,
//     borderWidth: 0.5,
//     marginHorizontal: 3,
//   },
//   resultList: { flex: 1 },
// });
