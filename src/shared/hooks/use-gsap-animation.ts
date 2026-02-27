"use client";

import { useRef } from "react";

/**
 * Animation utilities menggunakan CSS transitions.
 * Lebih ringan, zero-dependency, kompatibel dengan semua bundler.
 */
export function useGSAPAnimation() {
    const scope = useRef<HTMLDivElement>(null);

    /**
     * Trigger fade-in animation pada elemen dengan class selector.
     * Elemen harus punya opacity-0 di awal, lalu class ini akan menambahkan transition.
     */
    const animateIn = (selector = ".gsap-fade-in", delay = 0, stagger = 0.05) => {
        if (typeof document === "undefined") return;

        const elements = document.querySelectorAll<HTMLElement>(selector);
        elements.forEach((el, i) => {
            const elementDelay = delay + i * stagger;
            el.style.transition = `opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease`;
            el.style.transitionDelay = `${elementDelay}s`;
            // Force reflow
            void el.offsetHeight;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            el.style.filter = "blur(0px)";
        });
    };

    const animateStagger = (selector: string, delay = 0) => {
        animateIn(selector, delay, 0.06);
    };

    const animateHoverEnter = (target: Element) => {
        const el = target as HTMLElement;
        el.style.transition = "transform 0.25s ease";
        el.style.transform = "scale(1.02)";
    };

    const animateHoverLeave = (target: Element) => {
        const el = target as HTMLElement;
        el.style.transition = "transform 0.25s ease";
        el.style.transform = "scale(1)";
    };

    const animatePageOut = (onComplete: () => void) => {
        document.body.style.transition = "opacity 0.3s ease";
        document.body.style.opacity = "0";
        setTimeout(onComplete, 300);
    };

    return {
        scope,
        animateIn,
        animateStagger,
        animateHoverEnter,
        animateHoverLeave,
        animatePageOut,
    };
}
