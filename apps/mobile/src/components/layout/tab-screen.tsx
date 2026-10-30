import { metrics } from "@/theme/metrics";
import { ScrollScreen, type ScrollScreenProps } from "./scroll-screen";

const TAB_BAR_INSET = metrics.tabBar.bottomOffset + metrics.tabBar.height;

export function TabScreen(props: Omit<ScrollScreenProps, "bottomInset">) {
  return <ScrollScreen {...props} bottomInset={TAB_BAR_INSET} />;
}
