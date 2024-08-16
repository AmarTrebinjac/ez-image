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
  origin?: string;
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
 * **Note**: Static images included in your project need to define the "origin" prop on the \<Image /> component.
 *
 *  Images that include the "origin" prop will not be cached in development mode.
 *
 * @example
 * const sizes: Size[] = [
 * { width: 320, height: 568 },
 * { width: 768, height: 1024 },
 * { width: 1920, height: 1080 }
 *];
 *
 * Sample web image:
 * <Image
 *    src="https://someAWSBucket.com/myImage"
 *    sizes={sizes}
 *  />
 *
 * Sample static image:
 * <Image
 *    origin="https://myWebsite.com"
 *    src="/static/myImage.webp"
 *    sizes={sizes}
 *  />
 */
const Image = ({
  src,
  sizes = __DEFAULT_SIZES__,
  preload = false,
  origin,
  ...rest
}: ImageProps) => {
  const [currentSize, setCurrentSize] = useState<Size | undefined>();
  const sizeSet = getWidths(sizes);
  const srcSet = createSrcSet(src, sizes, origin);

  useEffect(() => {
    const body = document.body;

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
      const viewportWidth = body?.clientWidth;
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

const createSrcSet = (src: string, sizes: Size[], origin?: string) => {
  let trueSrc = src;

  if (!origin) {
    trueSrc = "//wsrv.nl?url=" + trueSrc;
  } else if (process.env.NODE_ENV === "production") {
    const srcWithOrigin = src.startsWith("/")
      ? origin + src
      : origin + "/" + src;
    trueSrc = "//wsrv.nl?url=" + srcWithOrigin;
  }

  return sizes
    .map(({ width, height }) => `${trueSrc}?w=${width}&h=${height} ${width}w`)
    .join(", ");
};

export default Image;
