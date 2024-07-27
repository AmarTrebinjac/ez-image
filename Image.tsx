"use client";

import React, { ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { Size } from "./types";

type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "sizes" | "height" | "width"
> & {
  className?: string;
  sizes?: Size[];
  preload?: boolean;
  src: string;
};

const __DEFAULT_SIZES__: Size[] = [
  { width: 320, height: 320 },
  { width: 480, height: 480 },
  { width: 768, height: 768 },
  { width: 1024, height: 1024 },
  { width: 1440, height: 1440 },
  { width: 1920, height: 1920 },
  { width: 2560, height: 2560 },
  { width: 3840, height: 3840 },
];

/**
 * Caches and resizes the image based on the sizes provided, and then renders the component.
 *
 * Contains default breakpoints width
 * of 320, 480, 768, 1024, 1440, 1920, 2560, 3840 pixels.
 *
 * Note: Does not cache images in development mode.
 */
const Image = ({
  src,
  sizes = __DEFAULT_SIZES__,
  preload = false,
  ...rest
}: ImageProps) => {
  const bodyRef = useRef<HTMLElement | null>(null);
  const [currentSize, setCurrentSize] = useState<Size | undefined>();
  const sizeSet = getWidths(sizes);
  const srcSet = createSrcSet(src, sizes);

  useEffect(() => {
    bodyRef.current = document.body;

    if (preload) {
      const head = document.head;

      const preconnectLink: HTMLLinkElement | null = head.querySelector(
        'link[href="//wsrv.nl"]'
      );

      if (!preconnectLink) {
        const newPreconnectLink = document.createElement("link");
        newPreconnectLink.rel = "preconnect";
        newPreconnectLink.href = "//wsrv.nl";
        head.appendChild(newPreconnectLink);
      }

      const preloadLink: HTMLLinkElement | null = head.querySelector(
        `link[as="image"][imageSrcset="${srcSet}"][imageSizes="${sizeSet}"]`
      );

      if (!preloadLink) {
        const newPreloadLink = document.createElement("link");
        newPreloadLink.rel = "preload";
        newPreloadLink.as = "image";
        newPreloadLink.imageSrcset = srcSet;
        newPreloadLink.imageSizes = sizeSet;

        head.appendChild(newPreloadLink);
      }
    }

    const handleResize = () => {
      const viewportWidth = bodyRef!.current!.clientWidth;
      let currSize;
      // Get the breakpoint that is less than the viewport width, but closest to it
      for (const size of sizes.filter(({ width }) => width <= viewportWidth)) {
        if (!currSize || size.width > currSize.width) {
          currSize = size;
        }
      }

      setCurrentSize(currSize);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <img
      srcSet={srcSet}
      sizes={sizeSet}
      {...rest}
      height={currentSize?.height && `${currentSize.height}px`}
      width={currentSize?.width && `${currentSize.width}px`}
    />
  );
};

const getWidths = (sizes: Size[]) =>
  sizes.map(({ width }) => `(max-width: ${width}px) ${width}px`).join(", ");

const createSrcSet = (src: string, sizes: Size[], height: string = "") => {
  let trueSrc = src;

  // We need to have a valid url to actually cache static images.
  if (process.env.NODE_ENV === "production") {
    if (!isDomain(src)) {
      trueSrc = src.startsWith("/")
        ? window.location.origin + src
        : window.location.origin + "/" + src;
    }
    trueSrc = "//wsrv.nl?url=" + trueSrc;
  }

  return sizes
    .map(({ width, height }) => `${trueSrc}?w=${width}&h=${height} ${width}w`)
    .join(", ");
};

// TODO: Find a better and more reliable way to check if the path is a domain.
function isDomain(path: string) {
  return (
    /^(https?:\/\/|www\.)/i.test(path) ||
    /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}/i.test(path)
  );
}
export default Image;
