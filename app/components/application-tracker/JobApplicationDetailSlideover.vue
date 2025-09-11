<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core';
import {
  PIPELINE_STAGES,
  type JobApplication,
  type PipelineStage,
} from '#shared/types/job-tracker';

const {
  isJobApplicationSlideoverOpen,
  selectedJobApplicationId,
  closeJobApplicationSlideover,
} = useJobApplicationTracker();
const jobApplicationStore = useJobApplicationStore();

// Form state
const formData = ref<Partial<JobApplication>>({});
const isEditing = ref(false);
const isSaving = ref(false);

// Get selected job application
const selectedJobApplication = computed(() => {
  if (!selectedJobApplicationId.value) return null;
  return jobApplicationStore.jobApplications.find(
    (app) => app.id === selectedJobApplicationId.value
  );
});

// Watch for changes in selected job application
watch(
  selectedJobApplication,
  (newApp) => {
    if (newApp) {
      formData.value = { ...newApp };
      isEditing.value = false;
    }
  },
  { immediate: true }
);

// Form validation
const isFormValid = computed(() => {
  return formData.value.title?.trim() && formData.value.company?.trim();
});

async function handleSave() {
  if (!selectedJobApplicationId.value || !isFormValid.value) return;

  isSaving.value = true;
  try {
    await jobApplicationStore.updateJobApplication(
      selectedJobApplicationId.value,
      formData.value
    );
    isEditing.value = false;
    // Show success toast
    // TODO: Add toast notification
  } catch (error) {
    console.error('Failed to save job application:', error);
    // TODO: Add error toast
  } finally {
    isSaving.value = false;
  }
}

function handleCancel() {
  if (selectedJobApplication.value) {
    formData.value = { ...selectedJobApplication.value };
  }
  isEditing.value = false;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString();
}

function getStageLabel(stage: PipelineStage) {
  const labels: Record<PipelineStage, string> = {
    researched: 'Researched',
    applied: 'Applied',
    phone_screen: 'Phone Screen',
    interview: 'Interview',
    final: 'Final Round',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return labels[stage];
}

function getPriorityColor(priority: 'low' | 'medium' | 'high') {
  const colors = {
    low: 'gray',
    medium: 'yellow',
    high: 'red',
  };
  return colors[priority];
}
</script>

<template>
  <!-- Non-modal sidebar panel -->
  <div
    v-if="isJobApplicationSlideoverOpen"
    class="fixed top-0 right-0 h-full w-1/3 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto"
    :class="{
      'translate-x-0': isJobApplicationSlideoverOpen,
      'translate-x-full': !isJobApplicationSlideoverOpen,
    }"
  >
    <!-- Header -->
    <div
      class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 z-10"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-lg font-semibold text-gray-900 dark:text-white truncate"
          >
            {{ selectedJobApplication?.title || 'Job Application' }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ selectedJobApplication?.company }}
          </p>
        </div>
        <UButton
          icon="i-lucide-x"
          size="sm"
          variant="ghost"
          @click="closeJobApplicationSlideover"
        />
      </div>
    </div>

    <!-- Body -->
    <div class="p-4">
      <div v-if="selectedJobApplication" class="space-y-6">
        <!-- Header Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UBadge
              :color="getPriorityColor(selectedJobApplication.priority)"
              variant="subtle"
              size="sm"
            >
              {{ selectedJobApplication.priority }} priority
            </UBadge>
            <UBadge color="primary" variant="subtle" size="sm">
              {{ getStageLabel(selectedJobApplication.stage) }}
            </UBadge>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              v-if="!isEditing"
              icon="i-lucide-edit"
              size="sm"
              variant="ghost"
              @click="isEditing = true"
            >
              Edit
            </UButton>
            <template v-else>
              <UButton size="sm" variant="ghost" @click="handleCancel">
                Cancel
              </UButton>
              <UButton
                size="sm"
                :loading="isSaving"
                :disabled="!isFormValid"
                @click="handleSave"
              >
                Save
              </UButton>
            </template>
          </div>
        </div>

        <!-- Job Details Form/Display -->
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <!-- Job Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <UInput
                v-if="isEditing"
                v-model="formData.title"
                placeholder="Enter job title"
              />
              <p v-else class="text-sm">
                {{ selectedJobApplication.title }}
              </p>
            </div>

            <!-- Company -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <UInput
                v-if="isEditing"
                v-model="formData.company"
                placeholder="Enter company name"
              />
              <p v-else class="text-sm">
                {{ selectedJobApplication.company }}
              </p>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <UInput
                v-if="isEditing"
                v-model="formData.location"
                placeholder="Enter location"
              />
              <p v-else class="text-sm">
                {{ selectedJobApplication.location || 'Not specified' }}
              </p>
            </div>

            <!-- Salary Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Salary Range
              </label>
              <UInput
                v-if="isEditing"
                v-model="formData.salaryRange"
                placeholder="e.g., $80,000 - $100,000"
              />
              <p v-else class="text-sm">
                {{ selectedJobApplication.salaryRange || 'Not specified' }}
              </p>
            </div>

            <!-- Job URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Job Posting URL
              </label>
              <UInput
                v-if="isEditing"
                v-model="formData.url"
                placeholder="https://..."
              />
              <div v-else class="text-sm">
                <ULink
                  v-if="selectedJobApplication.url"
                  :to="selectedJobApplication.url"
                  target="_blank"
                  class="text-primary-500 hover:text-primary-600"
                >
                  View Original Posting
                  <UIcon name="i-lucide-external-link" class="w-3 h-3 ml-1" />
                </ULink>
                <span v-else class="text-gray-500">No URL provided</span>
              </div>
            </div>

            <!-- Source -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <UInput
                v-if="isEditing"
                v-model="formData.source"
                placeholder="e.g., LinkedIn, Company Website"
              />
              <p v-else class="text-sm">
                {{ selectedJobApplication.source || 'Not specified' }}
              </p>
            </div>

            <!-- Priority -->
            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <USelect
                v-model="formData.priority"
                :options="[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                ]"
                option-attribute="label"
                value-attribute="value"
              />
            </div>

            <!-- Stage -->
            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <USelect
                v-model="formData.stage"
                :options="
                  PIPELINE_STAGES.map((stage) => ({
                    label: getStageLabel(stage),
                    value: stage,
                  }))
                "
                option-attribute="label"
                value-attribute="value"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <UTextarea
              v-if="isEditing"
              v-model="formData.description"
              placeholder="Enter job description or requirements"
              :rows="4"
            />
            <div v-else class="text-sm">
              <p
                v-if="selectedJobApplication.description"
                class="whitespace-pre-wrap"
              >
                {{ selectedJobApplication.description }}
              </p>
              <span v-else class="text-gray-500">No description provided</span>
            </div>
          </div>
        </div>

        <!-- Stage History -->
        <div>
          <h3 class="text-lg font-medium mb-3">Stage History</h3>
          <div class="space-y-2">
            <div
              v-for="transition in selectedJobApplication.stageHistory"
              :key="transition.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="text-sm font-medium">
                  {{
                    transition.fromStage
                      ? getStageLabel(transition.fromStage)
                      : 'Initial'
                  }}
                  →
                  {{ getStageLabel(transition.toStage) }}
                </p>
                <p v-if="transition.notes" class="text-xs text-gray-600 mt-1">
                  {{ transition.notes }}
                </p>
              </div>
              <time
                :datetime="transition.timestamp"
                class="text-xs text-gray-500"
              >
                {{ formatTimeAgo(new Date(transition.timestamp)) }}
              </time>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div>
          <h3 class="text-lg font-medium mb-3">Notes</h3>
          <div v-if="selectedJobApplication.notes.length > 0" class="space-y-2">
            <div
              v-for="note in selectedJobApplication.notes"
              :key="note.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <UBadge
                  :color="note.type === 'interview' ? 'blue' : 'gray'"
                  variant="subtle"
                  size="sm"
                >
                  {{ note.type }}
                </UBadge>
                <time :datetime="note.timestamp" class="text-xs text-gray-500">
                  {{ formatTimeAgo(new Date(note.timestamp)) }}
                </time>
              </div>
              <p class="text-sm whitespace-pre-wrap">{{ note.content }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">No notes yet</p>
        </div>

        <!-- Communications Section -->
        <div>
          <h3 class="text-lg font-medium mb-3">Communications</h3>
          <div
            v-if="selectedJobApplication.communications.length > 0"
            class="space-y-2"
          >
            <div
              v-for="comm in selectedJobApplication.communications"
              :key="comm.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="comm.direction === 'outbound' ? 'green' : 'blue'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ comm.direction }} {{ comm.type }}
                  </UBadge>
                  <span v-if="comm.contactPerson" class="text-xs text-gray-600">
                    {{ comm.contactPerson }}
                  </span>
                </div>
                <time :datetime="comm.timestamp" class="text-xs text-gray-500">
                  {{ formatTimeAgo(new Date(comm.timestamp)) }}
                </time>
              </div>
              <p v-if="comm.subject" class="text-sm font-medium mb-1">
                {{ comm.subject }}
              </p>
              <p class="text-sm whitespace-pre-wrap">{{ comm.content }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">No communications yet</p>
        </div>

        <!-- Tags -->
        <div v-if="selectedJobApplication.tags.length > 0">
          <h3 class="text-lg font-medium mb-3">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="tag in selectedJobApplication.tags"
              :key="tag"
              variant="subtle"
              size="sm"
            >
              {{ tag }}
            </UBadge>
          </div>
        </div>

        <!-- Metadata -->
        <div class="pt-4 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">Added:</span>
              {{ formatDate(selectedJobApplication.dateAdded) }}
            </div>
            <div v-if="selectedJobApplication.applicationDeadline">
              <span class="font-medium">Deadline:</span>
              {{ formatDate(selectedJobApplication.applicationDeadline) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else class="flex items-center justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
      </div>
    </div>
  </div>
</template>
