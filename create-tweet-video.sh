#!/bin/bash

# Create Twitter video from image + TTS audio
# Usage: ./create-tweet-video.sh <image_path> <audio_path> <output_path>

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <image_path> <audio_path> <output_path>"
    echo "Example: $0 /path/to/image.png /path/to/audio.mp3 /path/to/output.mp4"
    exit 1
fi

IMAGE_PATH="$1"
AUDIO_PATH="$2"
OUTPUT_PATH="$3"

# Check if files exist
if [ ! -f "$IMAGE_PATH" ]; then
    echo "Error: Image file not found: $IMAGE_PATH"
    exit 1
fi

if [ ! -f "$AUDIO_PATH" ]; then
    echo "Error: Audio file not found: $AUDIO_PATH"
    exit 1
fi

# Get audio duration
echo "Getting audio duration..."
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_PATH")

if [ -z "$DURATION" ]; then
    echo "Error: Could not get audio duration"
    exit 1
fi

echo "Audio duration: ${DURATION}s"

# Create video with subtle effects (Ken Burns, waveform, saturation, vignette)
echo "Creating video with effects..."
ffmpeg -loop 1 -i "$IMAGE_PATH" -i "$AUDIO_PATH" \
    -filter_complex "
        [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,
        zoompan=z='if(eq(mod(floor(time/15),2),0),1+0.008*mod(time,15),1.12-0.008*mod(time,15))':d=1:s=720x1280:fps=30,
        eq=saturation=1.15,
        vignette=angle=PI/4:mode=forward:eval=frame:a=0.3,
        format=yuv420p[vid];
        [1:a]showwaves=s=720x100:mode=line:colors=white@0.6[waves];
        [vid][waves]overlay=0:H-h:shortest=1[out]
    " \
    -map "[out]" -map 1:a \
    -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k \
    -shortest -t "$DURATION" \
    -y "$OUTPUT_PATH"

if [ $? -eq 0 ]; then
    echo "✓ Video created successfully: $OUTPUT_PATH"
    # Get video file size
    SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
    echo "  File size: $SIZE"
else
    echo "✗ Error creating video"
    exit 1
fi
