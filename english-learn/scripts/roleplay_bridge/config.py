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
CHARACTER_ENV_PREFIXES = {
    "wizard_boy": "HARRISON",
    "british_codebreaker": "CODEBREAKER",
    "pop_star_mentor": "POP_STAR",
    "pronunciation_teacher": "TEACHER",
}


def get_character_env_prefix(character_id=None):
    return CHARACTER_ENV_PREFIXES.get(character_id or "", "")


def normalize_dialog_variant(value):
    normalized = (value or "").strip().lower()

    if normalized in ("sc", "strong-character", "strong_character", "s2s-sc", "s2s_sc"):
        return "sc"
    if normalized in ("o", "omni", "s2s-o", "s2s_o"):
        return "omni"

    return "default"


def get_dialog_variant(character_id=None):
    prefix = get_character_env_prefix(character_id)
    if prefix:
        override = os.getenv(f"ROLEPLAY_{prefix}_DIALOG_VARIANT", "")
        if override.strip():
            return normalize_dialog_variant(override)

    return normalize_dialog_variant(os.getenv("ROLEPLAY_DIALOG_VARIANT", "default"))


def get_dialog_setting(name, default="", variant=None):
    variant = normalize_dialog_variant(variant or "default")

    if variant == "sc":
        return (
            os.getenv(f"ROLEPLAY_DIALOG_SC_{name}")
            or os.getenv(f"ROLEPLAY_SC_{name}")
            or os.getenv(f"ROLEPLAY_DIALOG_{name}", default)
        )

    if variant == "omni":
        return (
            os.getenv(f"ROLEPLAY_DIALOG_OMNI_{name}")
            or os.getenv(f"ROLEPLAY_OMNI_{name}")
            or os.getenv(f"ROLEPLAY_DIALOG_{name}", default)
        )

    return os.getenv(f"ROLEPLAY_DIALOG_{name}", default)


def get_realtime_model_for_speaker(speaker, variant=None):
    speaker_name = (speaker or "").strip()

    if speaker_name.startswith("saturn_"):
        return "SC2.0"

    if speaker_name.startswith("ICL_"):
        return "SC"

    if speaker_name.startswith("S_"):
        return "SC"

    return "O"


def get_character_model(character_id=None, speaker=""):
    prefix = get_character_env_prefix(character_id)
    if prefix:
        override = os.getenv(f"ROLEPLAY_{prefix}_MODEL", "").strip().upper()
        if override in ("O", "SC", "SC2.0"):
            return override

    return get_realtime_model_for_speaker(speaker)


def get_character_bool_setting(character_id=None, suffix="", default=False):
    prefix = get_character_env_prefix(character_id)
    if prefix and suffix:
        raw = os.getenv(f"ROLEPLAY_{prefix}_{suffix}", "").strip().lower()
        if raw:
            return raw in ("1", "true", "yes", "on")

    return default


def should_reset_session_each_turn(character_id=None):
    return get_character_bool_setting(character_id, "RESET_SESSION_EACH_TURN", default=False)


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

    if chosen_character == "pop_star_mentor":
        speaker_override = os.getenv("ROLEPLAY_POP_STAR_SPEAKER") or os.getenv(
            "NEXT_PUBLIC_ROLEPLAY_POP_STAR_SPEAKER",
            "",
        )
        if speaker_override:
            character["speaker"] = speaker_override

    if chosen_character == "pronunciation_teacher":
        speaker_override = os.getenv("ROLEPLAY_TEACHER_SPEAKER") or os.getenv(
            "NEXT_PUBLIC_ROLEPLAY_TEACHER_SPEAKER",
            "",
        )
        if speaker_override:
            character["speaker"] = speaker_override

    return character


def build_ws_config(character_id=None):
    variant = get_dialog_variant(character_id)
    return {
        "variant": variant,
        "base_url": get_dialog_setting("BASE_URL", DEFAULT_BASE_URL, variant=variant),
        "resource_id": get_dialog_setting("RESOURCE_ID", DEFAULT_RESOURCE_ID, variant=variant),
        "headers": {
            "X-Api-App-ID": get_dialog_setting("APP_ID", "", variant=variant),
            "X-Api-Access-Key": get_dialog_setting("ACCESS_KEY", "", variant=variant),
            "X-Api-Resource-Id": get_dialog_setting("RESOURCE_ID", DEFAULT_RESOURCE_ID, variant=variant),
            "X-Api-App-Key": get_dialog_setting("APP_KEY", "", variant=variant),
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
    variant = get_dialog_variant(character_id)
    model = get_character_model(character_id, character["speaker"])
    dialog_extra = {
        "strict_audit": False,
        "audit_response": "Please follow the platform safety response policy.",
        "recv_timeout": recv_timeout,
        "input_mod": input_mod,
        "model": model,
    }

    if model.startswith("SC"):
        dialog_config = {
            "character_manifest": character["character_manifest"],
            "location": {
                "city": get_dialog_setting("CITY", "Beijing", variant=variant),
            },
            "extra": dialog_extra,
        }
    else:
        dialog_config = {
            "bot_name": character["bot_name"],
            "system_role": character["system_role"],
            "speaking_style": character["speaking_style"],
            "character_manifest": character["character_manifest"],
            "location": {
                "city": get_dialog_setting("CITY", "Beijing", variant=variant),
            },
            "extra": dialog_extra,
        }

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
        "dialog": dialog_config,
    }
