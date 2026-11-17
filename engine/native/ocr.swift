// Text in images, read with Apple's Vision framework (macOS only, no dependencies beyond the system).
// Usage: swift engine/native/ocr.swift <image> [<image> …]
// Prints one JSON object per image: { file, lines: [{ text, x, y, w, h, confidence }] } with boxes as fractions of the
// image, y from the TOP. Used by scripts/market.mjs to read competitors' screenshot captions.
import Foundation
import Vision
import AppKit

for path in CommandLine.arguments.dropFirst() {
  guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("{\"file\":\"\(path)\",\"error\":\"unreadable\"}"); continue
  }
  let req = VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.usesLanguageCorrection = true
  req.automaticallyDetectsLanguage = true
  let handler = VNImageRequestHandler(cgImage: cg, options: [:])
  try? handler.perform([req])
  var lines: [[String: Any]] = []
  for obs in req.results ?? [] {
    guard let top = obs.topCandidates(1).first else { continue }
    let b = obs.boundingBox
    lines.append(["text": top.string, "x": b.minX, "y": 1 - b.maxY, "w": b.width, "h": b.height, "confidence": top.confidence])
  }
  let obj: [String: Any] = ["file": path, "lines": lines]
  if let data = try? JSONSerialization.data(withJSONObject: obj), let s = String(data: data, encoding: .utf8) { print(s) }
}
