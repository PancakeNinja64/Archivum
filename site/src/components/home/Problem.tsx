"use client";

import { motion, useReducedMotion } from "framer-motion";

const risks = [
  {
    title: "Wrong answers ship",
    body: "Outdated or dirty data reaches production, and the model hallucinates with confidence.",
  },
  {
    title: "Licenses surface too late",
    body: "Commercial restrictions get discovered after training, not before.",
  },
  {
    title: "Weeks disappear",
    body: "Searching, validating, and cleaning eats the time you meant to spend building.",
  },
];

export function Problem() {
  const reduce = useReducedMotion();
  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">The problem</p>
          <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-accent md:text-5xl">
            You wouldn&rsquo;t buy a used car without the history report.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            You can see the dataset. You can&rsquo;t see whether it was scraped legally,
            who touched it, when it was last real, or whether using it commercially
            will get you sued. Teams spend weeks hunting for data, then still can&rsquo;t
            answer those questions.
          </p>
          <p className="mt-8 border-l-2 border-accent pl-5 font-serif text-2xl italic leading-snug text-accent-strong dark:text-accent md:text-[1.7rem]">
            Archivum is the history report.
          </p>
        </div>

        <ul className="flex flex-col justify-center border-t border-border">
          {risks.map((r, i) => (
            <motion.li
              key={r.title}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="border-b border-border py-7"
            >
              <h3 className="text-lg tracking-[-0.01em] text-foreground">{r.title}</h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{r.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
