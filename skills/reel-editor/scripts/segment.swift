// Person-segmentation matte for a video, using Apple Vision.
// usage: swift segment.swift <input.mp4> <outdir>   → writes outdir/m00001.png ... (grayscale mattes)
import AVFoundation
import CoreImage
import Foundation
import Vision

let args = CommandLine.arguments
let input = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let asset = AVURLAsset(url: input)
let track = asset.tracks(withMediaType: .video)[0]
let reader = try AVAssetReader(asset: asset)
let output = AVAssetReaderTrackOutput(track: track, outputSettings: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
])
reader.add(output)
reader.startReading()

let ctx = CIContext()
let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8

var i = 0
while let sample = output.copyNextSampleBuffer(), let pb = CMSampleBufferGetImageBuffer(sample) {
    i += 1
    let handler = VNImageRequestHandler(cvPixelBuffer: pb, options: [:])
    try handler.perform([request])
    guard let mask = request.results?.first?.pixelBuffer else { continue }
    let img = CIImage(cvPixelBuffer: mask)
    let url = outDir.appendingPathComponent(String(format: "m%05d.png", i))
    try ctx.writePNGRepresentation(of: img, to: url, format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())
}
print("frames:", i)
