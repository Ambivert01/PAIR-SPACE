// Sound effects system with user preferences

class SoundManager {
  constructor() {
    this.enabled = this.loadPreference();
    this.sounds = {};
    this.volume = 0.3; // Soft volume by default
  }

  loadPreference() {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("soundEnabled");
    return saved === null ? true : saved === "true";
  }

  savePreference(enabled) {
    if (typeof window === "undefined") return;
    localStorage.setItem("soundEnabled", enabled.toString());
    this.enabled = enabled;
  }

  toggle() {
    this.savePreference(!this.enabled);
    return this.enabled;
  }

  preload(name, url) {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(url);
      audio.volume = this.volume;
      audio.preload = "auto";
      this.sounds[name] = audio;
    } catch (error) {
      console.warn(`Failed to preload sound: ${name}`, error);
    }
  }

  play(name) {
    if (!this.enabled || typeof window === "undefined") return;

    try {
      const sound = this.sounds[name];
      if (sound) {
        // Clone the audio to allow overlapping plays
        const clone = sound.cloneNode();
        clone.volume = this.volume;
        clone.play().catch(() => {
          // Silently fail if autoplay is blocked
        });
      }
    } catch (error) {
      // Silently fail
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = this.volume;
    });
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// Sound effect names
export const SOUNDS = {
  MESSAGE_SEND: "message_send",
  MESSAGE_RECEIVE: "message_receive",
  NOTIFICATION: "notification",
  GIFT_OPEN: "gift_open",
  CALL_CONNECT: "call_connect",
  CALL_DISCONNECT: "call_disconnect",
  BUTTON_CLICK: "button_click",
  SUCCESS: "success",
  ERROR: "error",
};

// Preload sounds (call this on app init)
export function initSounds() {
  // Note: In production, you would have actual sound files
  // For now, we'll use data URIs or skip preloading
  // soundManager.preload(SOUNDS.MESSAGE_SEND, '/sounds/message-send.mp3');
  // soundManager.preload(SOUNDS.NOTIFICATION, '/sounds/notification.mp3');
  // etc.
}

// Helper hooks and functions
export function playSound(soundName) {
  soundManager.play(soundName);
}

export function toggleSound() {
  return soundManager.toggle();
}

export function isSoundEnabled() {
  return soundManager.enabled;
}

export function setSoundVolume(volume) {
  soundManager.setVolume(volume);
}
