/**
 * AdMobManager.swift → no-op stub for browser / YouTube Playables.
 * Named without "Ad" in the filename so browser extensions do not block the module URL.
 */
export class MonetizationStub {
  constructor() {
    this.isEnabled = false;
  }

  initialize() {
    /* no-op offline / embed-safe */
  }

  showInterstitialAd(_probability = 0.25) {
    /* no-op */
  }

  showBanner() {
    /* no-op */
  }

  hideBanner() {
    /* no-op */
  }
}

export const adManager = new MonetizationStub();
