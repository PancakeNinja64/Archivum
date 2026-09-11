import wordmarkDark from "./wordmark-dark.svg";
import wordmarkLight from "./wordmark-light.svg";
import styles from "./Brand.module.css";

function assetUrl(src: string | { src: string }) {
  return typeof src === "string" ? src : src.src;
}

/** Official outlined assets; no font substitution or redrawing of the wordmark. */
export function BrandWordmark() {
  return <span className={styles.wordmark}>
    <img src={assetUrl(wordmarkDark)} alt="Archivum" width={680} height={146} className={styles.onLight} fetchPriority="high" />
    <img src={assetUrl(wordmarkLight)} alt="Archivum" width={680} height={146} className={styles.onDark} />
  </span>;
}
/** Original compact mark geometry. Signal highlights only the layered crossbar. */
export function BrandMark({ className, signal = false }: { className?: string; signal?: boolean }) {
  return <svg viewBox="0 0 180 180" width="32" height="32" className={className} aria-hidden="true" focusable="false">
    <polygon points="22,160 75,22 94,22 54,160" fill="currentColor" />
    <polygon points="86,22 105,22 158,160 126,160" fill="currentColor" />
    <polygon points="53,111 88,111 94,127 47,127" fill="currentColor" />
    <polygon points="91,105 126,105 133,121 98,121" fill={signal ? "var(--signal-blue, #4DA3FF)" : "currentColor"} />
  </svg>;
}
