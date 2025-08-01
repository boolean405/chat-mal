// import fs from "fs";
// import path from "path";
// import sharp from "sharp";
// import axios from "axios";
// import { fileURLToPath } from "url";

// import resError from "./resError.js";

// const canvasSize = 256;

// async function createCircularImage(buffer, diameter) {
//   const circleSvg = `<svg width="${diameter}" height="${diameter}">
//     <circle cx="${diameter / 2}" cy="${diameter / 2}" r="${
//     diameter / 2
//   }" fill="#fff"/>
//   </svg>`;
//   try {
//     return await sharp(buffer)
//       .resize(diameter, diameter)
//       .composite([{ input: Buffer.from(circleSvg), blend: "dest-in" }])
//       .png()
//       .toBuffer();
//   } catch (err) {
//     console.error("Failed to process image buffer with sharp:", err.message);
//     throw resError(400, "Image processing error");
//   }
// }

// export default async function generateGroupPhoto(imageUrls) {
//   try {
//     const count = Math.min(imageUrls.length, 4);

//     // Responsive avatar size
//     let avatarSize = 256; // default for 1
//     if (count === 2) avatarSize = 140;
//     if (count === 3) avatarSize = 120;
//     if (count === 4) avatarSize = 100;

//     const overlapRatio = 0.4; // how much they overlap (40%)
//     const overlapOffset = avatarSize * (1 - overlapRatio);
//     const totalWidth = overlapOffset * (count - 1) + avatarSize;
//     const startX = (canvasSize - totalWidth) / 2;
//     const centerY = (canvasSize - avatarSize) / 2;

//     // Get default photo if fail
//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = path.dirname(__filename);
//     let defaultPhoto = path.join(
//       __dirname,
//       "../assets/images/profile_photo.jpg"
//     );
//     const fallbackBuffer = fs.readFileSync(path.resolve(defaultPhoto));

//     const buffers = await Promise.all(
//       imageUrls.slice(0, count).map(async (url, i) => {
//         try {
//           const res = await axios.get(url, {
//             responseType: "arraybuffer",
//             headers: {
//               Accept: "image/*",
//             },
//           });
//           return await createCircularImage(res.data, avatarSize);
//         } catch (err) {
//           // Use fallback image buffer instead of failing
//           return await createCircularImage(fallbackBuffer, avatarSize);
//         }
//       })
//     );

//     const composite = [];
//     for (let i = 0; i < count; i++) {
//       composite.push({
//         input: buffers[i],
//         left: Math.round(startX + i * overlapOffset),
//         top: centerY,
//       });
//     }

//     const finalImageBuffer = await sharp({
//       create: {
//         width: canvasSize,
//         height: canvasSize,
//         channels: 4,
//         background: "#ffffff",
//       },
//     })
//       .composite(composite)
//       .png()
//       .toBuffer();

//     const base64Image = `data:image/jpeg;base64,${finalImageBuffer.toString(
//       "base64"
//     )}`;

//     return base64Image;
//   } catch (error) {
//     throw resError(400, error.message || "Failed to generate group photo!");
//   }
// }
