from character_profiles import CHARACTER_PROFILES

DEFAULT_CHARACTER = "wizard_boy"


def wrap_user_input(user_text: str, character_id: str = DEFAULT_CHARACTER) -> str:
    character = CHARACTER_PROFILES.get(character_id) or CHARACTER_PROFILES[DEFAULT_CHARACTER]
    scene_hint = character["scene_hint"]
    user_label = character["user_label"]
    return f"{scene_hint}\n\n{user_label} says: {user_text}"
