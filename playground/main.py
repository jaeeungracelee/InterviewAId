import asyncio
import pyaudio
import numpy as np
import whisper

# Parameters
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1024  # Process smaller chunks for lower latency
BUFFER_SECONDS = 3  # Total buffer duration in seconds
BUFFER_SIZE = RATE * BUFFER_SECONDS  # Total buffer size in samples

# Initialize PyAudio
audio = pyaudio.PyAudio()

# Open stream
stream = audio.open(
    format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK
)

# Load Whisper model
model = whisper.load_model("base.en")


def listen():
    print("Listening...")

    # Buffer to store audio data
    buffer = np.zeros(BUFFER_SIZE, dtype=np.float32)
    buffer_ptr = 0
    buffer_full = asyncio.Event()

    async def capture_audio():
        nonlocal buffer_ptr
        while True:
            data = stream.read(CHUNK)
            audio_chunk = np.frombuffer(data, np.int16).astype(np.float32) / 32768.0

            # Add the new chunk to the buffer using a sliding window approach
            end_ptr = buffer_ptr + CHUNK
            if end_ptr < BUFFER_SIZE:
                buffer[buffer_ptr:end_ptr] = audio_chunk
            else:
                # Handle wrap-around case
                part1_size = BUFFER_SIZE - buffer_ptr
                buffer[buffer_ptr:BUFFER_SIZE] = audio_chunk[:part1_size]
                buffer[0 : end_ptr % BUFFER_SIZE] = audio_chunk[part1_size:]

            # Check if buffer is full
            if end_ptr > BUFFER_SIZE:
                buffer_full.set()  # Signal that buffer is full

            buffer_ptr = end_ptr % BUFFER_SIZE

            await asyncio.sleep(0.01)  # Slight delay to allow other tasks to run

    async def transcribe_audio():
        while True:
            await buffer_full.wait()  # Wait until buffer is full
            buffer_full.clear()  # Clear the event for next trigger

            print("Transcribing...")
            result = model.transcribe(buffer)
            print("Transcription: ", result["text"])

    async def main():
        await asyncio.gather(capture_audio(), transcribe_audio())

    try:
        asyncio.run(main())

    except KeyboardInterrupt:
        print("Stopping...")

    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()


if __name__ == "__main__":
    listen()
