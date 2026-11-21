import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScrollScreen } from "@/components/layout/scroll-screen";
import { ReviewList } from "@/components/reviews/review-list";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useReviewHistory } from "@/features/reviews/use-review-history";

const LIST_DELAY = 260;
const LIST_DURATION = 600;

export default function Reviews() {
  const { hasLoadError, isLoading, isRefreshing, items, refresh } =
    useReviewHistory();

  return (
    <ScrollScreen isRefreshing={isRefreshing} onRefresh={refresh}>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="As notas que você deu aos atendimentos."
          title={"Minhas\navaliações"}
        />

        <Animated.View
          className="mt-8"
          entering={FadeInDown.delay(LIST_DELAY).duration(LIST_DURATION)}
        >
          <ReviewList
            hasLoadError={hasLoadError}
            isLoading={isLoading}
            items={items}
          />
        </Animated.View>
      </View>
    </ScrollScreen>
  );
}
