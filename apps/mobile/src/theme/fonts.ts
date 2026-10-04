import Feather from "@expo/vector-icons/Feather";

export const appFonts = {
  // Pré-carrega a fonte dos ícones junto com a Roboto, atrás da splash,
  // para os ícones não piscarem vazios no primeiro render.
  ...Feather.font,
  "Roboto-Bold": require("../../assets/fonts/roboto/Roboto-Bold.ttf"),
  "Roboto-Medium": require("../../assets/fonts/roboto/Roboto-Medium.ttf"),
  "Roboto-Regular": require("../../assets/fonts/roboto/Roboto-Regular.ttf"),
  "Roboto-SemiBold": require("../../assets/fonts/roboto/Roboto-SemiBold.ttf"),
};
