import Ionicons from "@expo/vector-icons/Ionicons";

export const appFonts = {
  // Pré-carrega a fonte dos ícones junto com a Roboto, atrás da splash,
  // para os ícones (inclusive os da tab bar) não piscarem vazios.
  ...Ionicons.font,
  "Roboto-Bold": require("../../assets/fonts/roboto/Roboto-Bold.ttf"),
  "Roboto-Medium": require("../../assets/fonts/roboto/Roboto-Medium.ttf"),
  "Roboto-Regular": require("../../assets/fonts/roboto/Roboto-Regular.ttf"),
  "Roboto-SemiBold": require("../../assets/fonts/roboto/Roboto-SemiBold.ttf"),
};
