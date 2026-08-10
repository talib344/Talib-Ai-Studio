"""Pipeline services — modular AI generation logic.

Each service mirrors a frontend module. Replace the placeholder logic
with real model calls (OpenAI, image, TTS providers) by reading the
keys from backend.app.core.config.settings.
"""
import random
from typing import List, Dict, Any


async def research_topic(keyword: str, country: str, language: str, length: str) -> List[Dict[str, Any]]:
    angles = ["The Untold Origin Story", "How It Changed the World", "The Hidden Conspiracy",
              "A Forgotten Tragedy", "Rise and Fall", "What Really Happened"]
    return [
        {
            "id": f"idea-{i}",
            "title": f"{angles[i % len(angles)]} — {keyword}",
            "angle": angles[i % len(angles)],
            "difficulty": random.randint(20, 90),
            "virality": random.randint(30, 98),
            "competition": random.randint(10, 85),
            "estimatedViews": random.randint(50000, 4500000),
        }
        for i in range(6)
    ]


async def generate_script(topic: str, angle: str, duration_min: int, tone: str) -> Dict[str, Any]:
    scenes = [
        {"section": "Hook", "content": f"What if everything you knew about {topic} was only half the story?"},
        {"section": "Introduction", "content": f"{topic} has shaped history in ways most people never realize."},
        {"section": "Act 1 — Origins", "content": "It started quietly. Long before the headlines..."},
        {"section": "Act 2 — The Turning Point", "content": "Then came the moment that changed everything."},
        {"section": "Act 3 — Consequences", "content": "The aftermath was not what anyone predicted."},
        {"section": "Ending", "content": f"{topic} is far from over."},
        {"section": "Call to Action", "content": "Subscribe and turn on the bell for weekly documentaries."},
    ]
    word_count = sum(len(s["content"].split()) for s in scenes)
    return {"scenes": scenes, "wordCount": word_count, "estimatedSeconds": word_count * 6}


async def generate_scenes(topic: str, count: int) -> List[Dict[str, Any]]:
    visuals = ["Archival pan", "Drone shot", "Interview close-up", "Animated map", "Reenactment silhouette"]
    transitions = ["Cross dissolve", "Whip pan", "Match cut", "Fade to black"]
    return [
        {
            "id": f"scene-{i}", "index": i + 1,
            "narration": f"Scene {i + 1}: exploring a dimension of {topic}.",
            "visual": visuals[i % len(visuals)],
            "transition": transitions[i % len(transitions)],
            "durationSec": random.randint(18, 40),
        }
        for i in range(count)
    ]


async def generate_image_prompts(topic: str, style: str, count: int) -> List[Dict[str, Any]]:
    modifiers = {
        "Realistic": "photorealistic, 35mm, 8k", "Documentary": "documentary still, editorial",
        "News": "photojournalism, high contrast", "War": "war photography, chiaroscuro",
        "History": "historical reenactment, period-accurate", "Politics": "political editorial, studio key",
        "Nature": "nature documentary, golden hour",
    }
    mod = modifiers.get(style, modifiers["Realistic"])
    return [
        {"id": f"img-{i}", "scene": i + 1, "style": style,
         "prompt": f"Cinematic {style.lower()} image about {topic}, scene {i + 1}, {mod}, --ar 16:9"}
        for i in range(count)
    ]


async def generate_thumbnails(topic: str, count: int) -> List[Dict[str, Any]]:
    hooks = ["THE TRUTH REVEALED", "WHAT THEY HID", "NEVER TOLD", "THE REAL STORY", "EXPOSED"]
    palettes = [["#1a5ff0", "#02a5f0", "#0b1020"], ["#ef4444", "#f59e0b", "#0b1020"], ["#10b981", "#22bdff", "#0b1020"]]
    return [
        {"id": f"thumb-{i}", "headline": f"{hooks[i % len(hooks)]}: {topic.upper()[:24]}",
         "prompt": f"YouTube thumbnail, {topic}, bold text, high contrast, {','.join(palettes[i % 3])}",
         "ctr": round(3 + random.random() * 9, 1), "colors": palettes[i % 3]}
        for i in range(count)
    ]


async def generate_seo(topic: str) -> Dict[str, Any]:
    return {
        "titles": [f"The {topic} Documentary They Tried to Bury", f"{topic}: The Full Story Explained"],
        "description": f"Discover the untold story of {topic}. Subscribe for weekly deep-dives.",
        "tags": [topic, "documentary", "history", "explainer"],
        "hashtags": ["#documentary", "#history", f"#{topic.replace(' ', '')}"],
        "keywords": [topic, f"{topic} documentary", f"{topic} explained"],
        "seoScore": random.randint(70, 98),
    }
