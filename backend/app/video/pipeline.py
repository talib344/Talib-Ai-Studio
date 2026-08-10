import os
import json
import asyncio
import tempfile
from typing import List, Optional, Tuple
from pathlib import Path
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip
from moviepy import video as mv_video
from moviepy import editor as mpy
import subprocess

DATA_DIR = Path("data")
JOBS_DIR = DATA_DIR / "jobs"
JOBS_DIR.mkdir(parents=True, exist_ok=True)

async def create_video_from_images(job_id: int, image_paths: List[str], durations: List[float], subtitles: Optional[List[Tuple[float, float, str]]] = None, music_path: Optional[str] = None, output_filename: Optional[str] = None) -> str:
    """
    Create a video from images with Ken Burns-style zoom/pan, crossfade transitions, background music, and optional subtitles.
    Returns the final output file path.
    """
    if not image_paths:
        raise ValueError("No images provided")

    if len(durations) != len(image_paths):
        # allow single duration applied to all
        if len(durations) == 1:
            durations = durations * len(image_paths)
        else:
            raise ValueError("durations length must match images length or be a single value")

    tempdir = JOBS_DIR / f"job_{job_id}"
    tempdir.mkdir(parents=True, exist_ok=True)

    clips = []
    fps = 30
    # create image clips with simple ken-burns-like zoom effect using resize with lambda and set_position
    for idx, (img, dur) in enumerate(zip(image_paths, durations)):
        clip = ImageClip(img).set_duration(dur)
        # ensure full HD
        clip = clip.resize((1920, 1080))
        # apply zoom effect: gradually zoom in by 5% over clip duration
        def zoom(get_frame, t):
            frame = get_frame(t)
            # moviepy handles resizing differently; use original clip resized
            return frame
        # approximate ken burns by applying a small resize over time using fx
        try:
            clip = clip.fx(mpy.vfx.resize, lambda t: 1.0 + 0.03 * (t / max(1.0, dur)))
        except Exception:
            # fallback: no dynamic resize
            pass
        # set position center
        clip = clip.set_position(('center', 'center'))
        # apply fade in/out to help crossfade
        clip = clip.crossfadein(0.5).crossfadeout(0.5)
        clips.append(clip)

    # Concatenate with crossfade by using concatenate_videoclips with method='compose'
    final = concatenate_videoclips(clips, method="compose")

    # Add background music if provided
    total_duration = final.duration
    if music_path:
        try:
            audio = AudioFileClip(music_path).audio_loop(duration=total_duration)
            # lower volume
            audio = audio.volumex(0.2)
            final = final.set_audio(audio)
        except Exception as e:
            # log but continue without music
            print(f"Warning: failed to load music {music_path}: {e}")

    # Prepare output filenames
    if not output_filename:
        output_filename = f"video_job_{job_id}.mp4"
    output_path = tempdir / output_filename
    tmp_output = str(tempdir / f"tmp_{output_filename}")

    # Write video file (no subtitles yet)
    # Use threads=4 and preset ultrafast for CI speed; production may use slower preset
    final.write_videofile(tmp_output, fps=fps, codec='libx264', audio_codec='aac', threads=4, preset='ultrafast', verbose=False, logger=None)

    # If subtitles provided, burn them using ffmpeg subtitles filter via a generated SRT file
    if subtitles:
        srt_path = tempdir / "subs.srt"
        with open(srt_path, "w", encoding="utf-8") as f:
            for i, (start, end, text) in enumerate(subtitles, start=1):
                def fmt_time(t):
                    h = int(t // 3600)
                    m = int((t % 3600) // 60)
                    s = int(t % 60)
                    ms = int((t - int(t)) * 1000)
                    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
                f.write(f"{i}\n")
                f.write(f"{fmt_time(start)} --> {fmt_time(end)}\n")
                f.write(f"{text}\n\n")
        final_output = str(output_path)
        # Burn subtitles with ffmpeg. This requires ffmpeg with libass support.
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            tmp_output,
            "-vf",
            f"subtitles={str(srt_path)}:force_style='FontName=Arial,FontSize=36,PrimaryColour=&HFFFFFF&'",
            "-c:a",
            "copy",
            final_output
        ]
        res = subprocess.run(cmd, capture_output=True)
        if res.returncode != 0:
            # If burning subtitles fails, fallback to using tmp_output as final
            print("ffmpeg subtitles failed:", res.stderr.decode())
            Path(tmp_output).rename(output_path)
        else:
            # remove tmp_output
            try:
                os.remove(tmp_output)
            except Exception:
                pass
    else:
        # move tmp_output to final
        Path(tmp_output).rename(output_path)

    return str(output_path)
