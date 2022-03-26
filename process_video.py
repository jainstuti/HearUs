import sys
import speech_recognition as sr
import moviepy.editor as mp

VIDEO_PATH = f'public/uploads/{sys.argv[1]}'
print(f'Opening {VIDEO_PATH}')
video = mp.VideoFileClip(VIDEO_PATH)

clip_duration = video.duration
print(f'Clip duration {clip_duration}')
SUB_CLIP_SIZE = 10  # Split the clips into sizes of 10s
AUDIO_BASE_PATH = 'audio/'
cur_duration, i = 0, 0


subtitles_with_timestamp = []

print('Processing uploaded video')
r = sr.Recognizer()
while cur_duration < clip_duration:
    # Grab the current clip from the video and extract the audio
    start_duration, end_duration = cur_duration, min(
        cur_duration + SUB_CLIP_SIZE, clip_duration)
    new_clip = video.subclip(start_duration, end_duration)
    new_clip.audio.write_audiofile(f'{AUDIO_BASE_PATH}/audio{i}.wav')

    # Read the audio with speech recognizer
    audio = sr.AudioFile(f'{AUDIO_BASE_PATH}/audio{i}.wav')
    with audio as source:
        r.adjust_for_ambient_noise(source)
        audio_file = r.record(source)
    try:
        text = r.recognize_google(audio_file)
    except:
        text = ''

    start_minutes, start_seconds = start_duration // 60, start_duration % 60
    end_minutes, end_seconds = end_duration // 60, end_duration % 60
    subtitles_with_timestamp.append({
        'start': f"{start_minutes:02}:{start_seconds:02}.000",
        'end': f"{end_minutes:02}:{end_seconds:02}.000",
        'text': text
    })

    i += 1
    cur_duration += SUB_CLIP_SIZE

print(subtitles_with_timestamp)

with open(f'public/uploads/{sys.argv[2]}', 'w') as file:
    file.write('WEBVTT')
    file.write('\n\n')
    for s in subtitles_with_timestamp:
        if s['text'] == '':
            continue
        file.write(f"{s['start']} --> {s['end']}\n")
        file.write(f"{s['text']}\n")
        file.write('\n')

print('Subtitles wrote successfully')
