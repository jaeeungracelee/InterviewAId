import asyncio
import pyaudio
import numpy as np
import whisper

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1024
BUFFER_SECONDS = 3
BUFFER_SIZE = RATE * BUFFER_SECONDS

audio = pyaudio.PyAudio()

stream = audio.open(
    format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK
)

model = whisper.load_model("base.en")


async def capture_audio(buffer, buffer_ptr, buffer_full):
    while True:
        try:
            data = stream.read(CHUNK, exception_on_overflow=False)
        except Exception as e:
            print(f"Error reading audio stream: {e}")
            continue

        audio_chunk = np.frombuffer(data, np.int16).astype(np.float32) / 32768.0

        end_ptr = buffer_ptr[0] + CHUNK
        if end_ptr < BUFFER_SIZE:
            buffer[buffer_ptr[0]:end_ptr] = audio_chunk
        else:
            part1_size = BUFFER_SIZE - buffer_ptr[0]
            buffer[buffer_ptr[0]:BUFFER_SIZE] = audio_chunk[:part1_size]
            buffer[0 : end_ptr % BUFFER_SIZE] = audio_chunk[part1_size:]

        if end_ptr >= BUFFER_SIZE:
            buffer_full.set()

        buffer_ptr[0] = end_ptr % BUFFER_SIZE

        await asyncio.sleep(0.01)


async def transcribe_audio(buffer, buffer_full, silence_event):
    last_activity = asyncio.get_event_loop().time()
    transcriptions = []

    while True:
        await buffer_full.wait()
        buffer_full.clear()

        print("Transcribing...")
        try:
            result = model.transcribe(buffer)
            text = result["text"]
            if text:
                transcriptions.append(text)
                last_activity = asyncio.get_event_loop().time()
            print("Transcription: ", text)
        except Exception as e:
            print(f"Error during transcription: {e}")

        current_time = asyncio.get_event_loop().time()
        if current_time - last_activity > 3:
            silence_event.set()


async def main(buffer, buffer_ptr, buffer_full, silence_event):
    await asyncio.gather(
        capture_audio(buffer, buffer_ptr, buffer_full),
        transcribe_audio(buffer, buffer_full, silence_event),
    )


def listen():
    print("Listening...")

    buffer = np.zeros(BUFFER_SIZE, dtype=np.float32)
    buffer_ptr = [0]
    buffer_full = asyncio.Event()
    silence_event = asyncio.Event()

    try:
        asyncio.run(main(buffer, buffer_ptr, buffer_full, silence_event))

    except KeyboardInterrupt:
        print("Stopping...")

    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()

if __name__ == "__main__":
    listen()
