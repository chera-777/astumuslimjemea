import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.e08c780f994c4a1d96f19738b1adf3e9",
  appName: "astumuslimjemea",
  webDir: "dist",
  server: {
    url: "https://e08c780f-994c-4a1d-96f1-9738b1adf3e9.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#10b981",
      sound: "azan.wav",
    },
  },
};

export default config;
