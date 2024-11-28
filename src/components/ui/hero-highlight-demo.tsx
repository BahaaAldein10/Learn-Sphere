'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import HomeNavbar from '../shared/HomeNavbar';
import ButtonAnimatedGradient from './ButtonAnimatedGradient';
import { HeroHighlight, Highlight } from './hero-highlight';

export function HeroHighlightDemo() {
  return (
    <HeroHighlight>
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <HomeNavbar />
      </motion.div>

      {/* Hero Text */}
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="mx-auto mt-20 max-w-5xl px-4 text-center text-3xl font-bold leading-relaxed text-purple-900 md:text-4xl lg:text-5xl lg:leading-snug"
      >
        Unlock the power of learning through{' '}
        <Highlight className="text-purple-800">
          collaboration, innovation, and AI.
        </Highlight>
      </motion.h1>

      {/* CTA Button */}
      <div className="mt-10 flex justify-center gap-4">
        <Link href="/courses">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <ButtonAnimatedGradient />
          </motion.div>
        </Link>
      </div>
    </HeroHighlight>
  );
}
