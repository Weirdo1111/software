import os
import uuid
from pathlib import Path

from character_profiles import CHARACTER_PROFILES


def load_env_files():
    root = Path(__file__).resolve().parents[2]
    for filename in (".env", ".env.local"):
      path = root / filename
      if not path.exists():
          continue

      for raw_line in path.read_text(encoding="utf-8").splitlines():
          line = raw_line.strip()
          if not line or line.startswith("#") or "=" not in line:
              continue

          key, value = line.split("=", 1)
          key = key.strip()
          value = value.strip().strip('"').strip("'")
          os.environ.setdefault(key, value)


load_env_files()

DEFAULT_CHARACTER = os.getenv("ROLEPLAY_CHARACTER", "wizard_boy")
DEFAULT_BASE_URL = "wss://openspeech.bytedance.com/api/v3/realtime/dialogue"
DEFAULT_RESOURCE_ID = "volc.speech.dialog"


def get_character(character_id=None):
    chosen_character = character_id or DEFAULT_CHARACTER
    base_character = CHARACTER_PROFILES.get(chosen_character) or CHARACTER_PROFILES[DEFAULT_CHARACTER]
    character = dict(base_character)

    if chosen_character == "wizard_boy":
        speaker_override = os.getenv("ROLEPLAY_HARRISON_SPEAKER") or os.getenv(
            "NEXT_PUBLIC_ROLEPLAY_HARRISON_SPEAKER",
            "",
        )
        if speaker_override:
            character["speaker"] = speaker_override

    if chosen_character == "british_codebreaker":
        speaker_override = os.getenv("ROLEPLAY_CODEBREAKER_SPEAKER") or os.getenv(
            "NEXT_PUBLIC_ROLEPLAY_CODEBREAKER_SPEAKER",
            "",
        )
        if speaker_override:
            character["speaker"] = speaker_override

    return character


def build_ws_config():
    return {
        "base_url": os.getenv("ROLEPLAY_DIALOG_BASE_URL", DEFAULT_BASE_URL),
        "headers": {
            "X-Api-App-ID": os.getenv("ROLEPLAY_DIALOG_APP_ID", ""),
            "X-Api-Access-Key": os.getenv("ROLEPLAY_DIALOG_ACCESS_KEY", ""),
            "X-Api-Resource-Id": os.getenv("ROLEPLAY_DIALOG_RESOURCE_ID", DEFAULT_RESOURCE_ID),
            "X-Api-App-Key": os.getenv("ROLEPLAY_DIALOG_APP_KEY", ""),
            "X-Api-Connect-Id": str(uuid.uuid4()),
        },
    }


def validate_ws_config(ws_config):
    missing = [
        key
        for key, value in ws_config["headers"].items()
        if key != "X-Api-Connect-Id" and not value
    ]
    if missing:
        joined = ", ".join(missing)
        raise RuntimeError(f"Missing realtime roleplay bridge env vars for: {joined}")


def build_start_session_req(
    character_id=None,
    output_audio_format="pcm",
    input_mod="audio",
    recv_timeout=10,
):
    character = get_character(character_id)
    return {
        "asr": {
            "extra": {
                "end_smooth_window_ms": 1500,
            },
        },
        "tts": {
            "speaker": character["speaker"],
            "audio_config": {
                "channel": 1,
                "format": output_audio_format,
                "sample_rate": 24000,
            },
        },
        "dialog": {
            "bot_name": character["bot_name"],
            "system_role": character["system_role"],
            "speaking_style": character["speaking_style"],
            "character_manifest": character["character_manifest"],
            "location": {
                "city": os.getenv("ROLEPLAY_DIALOG_CITY", "Beijing"),
            },
            "extra": {
                "strict_audit": False,
                "audit_response": "Please follow the platform safety response policy.",
                "recv_timeout": recv_timeout,
                "input_mod": input_mod,
            },
        },
    }
