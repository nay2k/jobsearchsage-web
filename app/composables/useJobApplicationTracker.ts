import { createSharedComposable } from '@vueuse/core';

const _useJobApplicationTracker = () => {
  const route = useRoute();
  const isJobApplicationSlideoverOpen = ref(false);
  const selectedJobApplicationId = ref<string | null>(null);
  const isCreatingNew = ref(false);

  function openJobApplicationSlideover(jobApplicationId: string) {
    console.log('Opening slideover for job application ID:', jobApplicationId);
    selectedJobApplicationId.value = jobApplicationId;
    isJobApplicationSlideoverOpen.value = true;
    isCreatingNew.value = false;
    console.log('Slideover state updated:', {
      selectedJobApplicationId: selectedJobApplicationId.value,
      isOpen: isJobApplicationSlideoverOpen.value,
    });
  }

  function openNewJobApplicationSlideover() {
    console.log('Opening slideover for new job application');
    selectedJobApplicationId.value = null;
    isJobApplicationSlideoverOpen.value = true;
    isCreatingNew.value = true;
    console.log('Slideover state updated for new application:', {
      selectedJobApplicationId: selectedJobApplicationId.value,
      isOpen: isJobApplicationSlideoverOpen.value,
      isCreatingNew: isCreatingNew.value,
    });
  }

  function closeJobApplicationSlideover() {
    isJobApplicationSlideoverOpen.value = false;
    selectedJobApplicationId.value = null;
    isCreatingNew.value = false;
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
    isCreatingNew,
    openJobApplicationSlideover,
    openNewJobApplicationSlideover,
    closeJobApplicationSlideover,
  };
};

export const useJobApplicationTracker = createSharedComposable(
  _useJobApplicationTracker
);
