import { createSharedComposable } from '@vueuse/core';

const _useJobApplicationTracker = () => {
  const route = useRoute();
  const isJobApplicationSlideoverOpen = ref(false);
  const selectedJobApplicationId = ref<string | null>(null);

  function openJobApplicationSlideover(jobApplicationId: string) {
    selectedJobApplicationId.value = jobApplicationId;
    isJobApplicationSlideoverOpen.value = true;
  }

  function closeJobApplicationSlideover() {
    isJobApplicationSlideoverOpen.value = false;
    selectedJobApplicationId.value = null;
  }

  // Close slideover when navigating away
  watch(
    () => route.fullPath,
    () => {
      closeJobApplicationSlideover();
    }
  );

  return {
    isJobApplicationSlideoverOpen,
    selectedJobApplicationId,
    openJobApplicationSlideover,
    closeJobApplicationSlideover,
  };
};

export const useJobApplicationTracker = createSharedComposable(
  _useJobApplicationTracker
);
