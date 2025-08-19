import Head from "next/head";
import { FaGooglePlay, FaApple } from "react-icons/fa";

import image1 from "../assets/images/app_1.jpg";
import image2 from "../assets/images/app_2.jpg";
import image3 from "../assets/images/app_3.jpg";
import image4 from "../assets/images/app_4.jpg";
import image5 from "../assets/images/app_5.jpg";

export default function Home() {
  const screenshots = [image1, image2, image3, image4, image5];

  return (
    <>
      <Head>
        <title>Chat Mal – Modern Messaging</title>
        <meta
          name="description"
          content="Chat Mal is a sleek, fast, and private messaging video chat app. Get it now on iOS and Android."
        />
      </Head>

      <main className="bg-[#0e0e10] text-white min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-10 py-16 font-sans">
        {/* Hero */}
        <section className="text-center max-w-3xl w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text mb-6">
            Chat Mal
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 px-2">
            Sleek, secure, and lightning fast messaging — built for the new era.
          </p>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 px-2">
            <a
              href="https://apkpure.com/p/com.chat.mal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 transition rounded-xl px-6 py-3 text-sm font-semibold shadow-md w-full sm:w-auto"
              aria-label="Get it on Google Play"
            >
              <FaGooglePlay className="w-5 h-5" />
              Get it on Google Play
            </a>

            <button
              disabled
              className="inline-flex items-center justify-center gap-3 bg-gray-700 text-gray-400 rounded-xl px-6 py-3 text-sm font-semibold cursor-not-allowed select-none relative w-full sm:w-auto"
              aria-label="App Store coming soon"
              title="App Store coming soon"
            >
              <FaApple className="w-5 h-5" />
              Download on the App Store
              <span className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold px-2 rounded-bl-lg">
                Coming Soon
              </span>
            </button>
          </div>

          {/* Horizontal Screenshot Carousel */}
          <div className="mt-6 sm:mt-10 w-full overflow-x-auto">
            <div className="flex gap-4 sm:gap-6 px-2 pb-2">
              {screenshots.map((src, i) => (
                <img
                  key={i}
                  src={src.src}
                  alt={`App Screenshot ${i + 1}`}
                  className="w-52 sm:w-60 md:w-64 flex-shrink-0 rounded-xl shadow-lg border border-gray-800 transition hover:scale-105"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-20 max-w-6xl w-full px-2 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-[#1a1a1d] p-5 sm:p-6 rounded-2xl border border-gray-800 shadow-md"
              >
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 text-center text-sm text-gray-500 px-4">
          &copy; {new Date().getFullYear()} Chat Mal. All rights reserved.
          <a
            href="/privacy-policy"
            className="text-purple-400 hover:underline ml-2 inline-block"
          >
            Privacy Policy
          </a>
        </footer>
      </main>
    </>
  );
}

const features = [
  {
    title: "🔐 End-to-End Encryption",
    desc: "Every message you send is private. Not even we can read them.",
  },
  {
    title: "⚡ Instant Messaging",
    desc: "Chat Mal delivers messages faster than light. Almost.",
  },
  {
    title: "🎨 Sleek Dark UI",
    desc: "Built for late-night chats and modern tastes.",
  },
  {
    title: "📱 Cross-Platform",
    desc: "Available now on iOS & Android. More coming soon.",
  },
];
