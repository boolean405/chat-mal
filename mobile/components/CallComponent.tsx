// import React from "react";
// import { View, Text } from "react-native";
// import { RTCView } from "react-native-webrtc";

// export default function CallComponent() {
//   return (
//     <View>
//       <RTCView
//         streamURL={localStream?.toURL() ?? ""}
//         style={{
//           width: 100,
//           height: 150,
//           position: "absolute",
//           top: 10,
//           right: 10,
//           zIndex: 100,
//         }}
//       />
//       <RTCView
//         streamURL={remoteStream?.toURL() ?? ""}
//         style={{ flex: 1, backgroundColor: "black" }}
//       />
//       <TouchableOpacity
//         onPress={endCall}
//         style={{
//           position: "absolute",
//           bottom: 30,
//           left: "50%",
//           marginLeft: -40,
//           width: 80,
//           height: 40,
//           backgroundColor: "red",
//           justifyContent: "center",
//           alignItems: "center",
//           borderRadius: 20,
//           zIndex: 100,
//         }}
//       >
//         <Text style={{ color: "white" }}>End Call</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
