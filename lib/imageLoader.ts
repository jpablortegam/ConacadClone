// lib/imageLoader.ts
const elementCache = new Map<string, HTMLImageElement>();
const promiseCache = new Map<string, Promise<HTMLImageElement>>();

function pLimit(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  const next = () => {
    active--;
    queue.shift()?.();
  };
  return <T>(fn: () => Promise<T>) =>
    new Promise<T>((resolve, reject) => {
      const run = () => {
        active++;
        fn()
          .then((v) => {
            resolve(v);
            next();
          })
          .catch((e) => {
            reject(e);
            next();
          });
      };
      if (active < max) {
        run();
      } else {
        queue.push(run);
      }
    });
}

const limit = pLimit(4); // 4-6 concurrentes va bien

export function loadSharedImage(url: string): Promise<HTMLImageElement> {
  if (elementCache.has(url)) return Promise.resolve(elementCache.get(url)!);
  if (promiseCache.has(url)) return promiseCache.get(url)!;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.decoding = 'async';

  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const t = setTimeout(() => {
      promiseCache.delete(url);
      reject(new Error('timeout'));
    }, 10000);
    img.onload = () => {
      clearTimeout(t);
      elementCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(t);
      promiseCache.delete(url);
      reject(new Error(`Failed to load image: ${url}`));
    };
  });

  promiseCache.set(url, p);
  img.src = url;

  return limit(() => p);
}
