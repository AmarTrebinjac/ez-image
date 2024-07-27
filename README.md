# EZ-Image

Easily cache and resize images in React.

EZ-Image utilizes [wsrv.nl](https://images.weserv.nl/) under the hood to cache and resize images on the fly. This package would not be possible without it.

The goal of EZ-Image is to make it super easy to cache and serve correctly sized images, and improve your performance scores with minimal efforts.

## Usage

Install ez-image:

    npm install ez-image

Example:

```ts
import { Size } from "ez-image/types";
import Image from "ez-image";

const sizes: Size[] = [
  { width: 320, height: 568 },
  { width: 768, height: 1024 },
  { width: 1920, height: 1080 },
];

function App() {
  return <Image src="/public/profilepic.jpg" sizes={sizes} alt="Avatar" />;
}
```

Sizes are optional. If you do not provide any sizes, these defaults will be used instead:

```ts
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
```
