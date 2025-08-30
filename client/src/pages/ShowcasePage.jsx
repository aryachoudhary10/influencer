import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../config";
import {
  Instagram,
  Youtube,
  Twitter,
  Music2,
  ShoppingBag,
  RefreshCcw,
  PackageOpen,
} from "lucide-react";
import Loader from "../components/loader";

export const ShowcasePage = () => {
  const { username } = useParams();
  const [influencer, setInfluencer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShowcaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/showcase/${username}`);
      if (!response.ok) throw new Error("Failed to fetch showcase");
      const data = await response.json();

      setInfluencer(data.influencer);
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcaseData();
  }, [username]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-300 bg-[#121212] p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-4">Oops!</h2>
        <p className="mb-6 text-sm sm:text-base">{error}</p>
        <button
          onClick={fetchShowcaseData}
          className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-3 rounded-lg font-medium hover:bg-yellow-300 transition"
        >
          <RefreshCcw className="w-5 h-5" />
          Retry
        </button>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-500 bg-[#121212] p-6">
        <PackageOpen size={56} className="text-gray-700 mb-6" />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-300">
          Showcase Not Found
        </h3>
        <p className="text-sm sm:text-base">
          We couldn’t find a showcase with the username "@{username}".
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0d0d0d] to-black text-gray-100 font-sans">
      <div className="container mx-auto px-4 py-6 sm:px-6 md:px-10 max-w-7xl">
        {/* HEADER */}
        <header className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="relative group">
              <img
                src={
                  influencer.profileImageUrl ||
                  `https://placehold.co/128x128/1f1f1f/FBBF24?text=${influencer.username[0].toUpperCase()}`
                }
                alt={influencer.username}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 shadow-lg object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-2xl opacity-0 group-hover:opacity-100 transition" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-4 tracking-tight px-2">
              @{influencer.username}{" "}
              <span className="text-yellow-400">Showcase</span>
            </h1>
          </motion.div>

          {influencer.bio && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mt-4"
            >
              {influencer.bio}
            </motion.p>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-5 mt-6"
          >
            {influencer.instagram && (
              <a
                href={`https://instagram.com/${influencer.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition transform hover:scale-110"
              >
                <Instagram size={24} />
              </a>
            )}
            {influencer.youtube && (
              <a
                href={`https://youtube.com/${influencer.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition transform hover:scale-110"
              >
                <Youtube size={24} />
              </a>
            )}
            {influencer.twitter && (
              <a
                href={`https://twitter.com/${influencer.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition transform hover:scale-110"
              >
                <Twitter size={24} />
              </a>
            )}
            {influencer.tiktok && (
              <a
                href={`https://tiktok.com/@${influencer.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition transform hover:scale-110"
              >
                <Music2 size={24} />
              </a>
            )}
          </motion.div>
        </header>

        {/* PRODUCTS */}
        <main>
          <AnimatePresence>
            {products.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl overflow-hidden flex flex-col border border-transparent hover:border-yellow-400/40 transition-all shadow-md hover:shadow-yellow-400/20"
                  >
                    {/* IMAGE */}
                    <div className="relative h-36 sm:h-48 md:h-56">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {product.category && (
                        <span className="absolute top-2 right-2 bg-black/60 text-yellow-400 text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                      <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-100 flex-grow mb-2 sm:mb-3 line-clamp-2">
                        {product.name}
                      </h3>
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-yellow-400 text-black font-bold py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg flex items-center justify-center mt-auto hover:bg-white transition text-xs sm:text-sm md:text-base"
                      >
                        <ShoppingBag size={14} className="mr-2" />
                        Shop Now
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-500 mt-12 sm:mt-16 flex flex-col items-center gap-4"
              >
                <PackageOpen size={56} className="text-gray-700" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-300">
                  Nothing to show... yet!
                </h3>
                <p className="text-sm sm:text-base">
                  @{influencer.username} hasn’t added any products.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="text-center mt-16 sm:mt-20 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs sm:text-sm">
            Powered by{" "}
            <a
              href="#"
              className="text-yellow-400 hover:underline font-semibold"
            >
              Seizo.o
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};
