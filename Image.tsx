"use client";

import React, {
  ImgHTMLAttributes,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Size } from "./types";

type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "sizes" | "height" | "width"
> & {
  alt?: string;
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
 */
const Image = ({
  src,
  sizes = __DEFAULT_SIZES__,
  preload = true,
  ...rest
}: ImageProps) => {
  const bodyRef = useRef(document.getElementsByTagName("body")[0]);
  const [currentSize, setCurrentSize] = useState<Size | undefined>();
  const sizeSet = getWidths(sizes);
  const srcSet = createSrcSet(`//wsrv.nl?url=${src}`, sizes);

  useLayoutEffect(() => {
    const handleResize = () => {
      const viewportWidth = bodyRef.current.clientWidth;

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
    <>
      {preload && (
        <>
          <PreconnectResources />
          <PreloadResource srcSet={srcSet} sizes={sizeSet} />
        </>
      )}
      <img
        srcSet={srcSet}
        sizes={sizeSet}
        {...rest}
        height={currentSize?.height && `${currentSize.height}px`}
        width={currentSize?.width && `${currentSize.width}px`}
        // For some reason height and width property are getting ignored in certain cases, so we set the height & width using the style prop as well.
        style={{
          ...rest.style,
          height: currentSize?.height && `${currentSize.height}px`,
          width: currentSize?.width && `${currentSize.width}px`,
        }}
      />
    </>
  );
};

const PreconnectResources = () => {
  const headNode = document.getElementsByTagName("head")[0];
  return createPortal(<link rel="preconnect" href="//wsrv.nl" />, headNode);
};

type PreloadProps = {
  srcSet?: string;
  sizes?: string;
};

const PreloadResource = ({ srcSet, sizes }: PreloadProps) => {
  const headNode = document.getElementsByTagName("head")[0];

  return createPortal(
    <link rel="preload" as="image" imageSrcSet={srcSet} imageSizes={sizes} />,
    headNode
  );
};

const getWidths = (sizes: Size[]) =>
  sizes.map(({ width }) => `(max-width: ${width}px) ${width}px`).join(", ");

const createSrcSet = (src: string, sizes: Size[], height: string = "") => {
  return sizes
    .map(({ width, height }) => `${src}?w=${width}&h=${height} ${width}w`)
    .join(", ");
};

export default Image;
