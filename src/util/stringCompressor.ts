import "server-only";
import { brotliCompress, brotliDecompress } from "zlib";

export class StringCompressor {
  static compress({ text }: { text: string }) {
    if (!text.trim()) return "";
    const input = Buffer.from(text, "utf-8");
    return new Promise<string>((resolve, reject) => {
      brotliCompress(input, (err, compressed) => {
        if (err) {
          reject(err);
        } else {
          resolve(compressed.toString("base64"));
        }
      });
    });
  }

  static decompress({ compressedText }: { compressedText: string }) {
    if (!compressedText.trim()) return "";
    const input = Buffer.from(compressedText, "base64");

    return new Promise<string>((resolve, reject) => {
      brotliDecompress(input, (err, decompressed) => {
        if (err) {
          reject(err);
        } else {
          resolve(decompressed.toString("utf-8"));
        }
      });
    });
  }
}
