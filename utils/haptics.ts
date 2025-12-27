import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const impact = async (style: ImpactStyle = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch {
    // Ignore when running in environments without native haptics.
  }
};
