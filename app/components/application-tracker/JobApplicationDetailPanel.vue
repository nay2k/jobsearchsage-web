<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core';
import {
  PIPELINE_STAGES,
  type JobApplication,
  type PipelineStage,
  type Note,
  type Communication,
} from '#shared/types/job-tracker';

const { selectedJobApplicationId, closeJobApplicationSlideover } =
  useJobApplicationTracker();
const jobApplicationStore = useJobApplicationStore();
const toast = useToast();

// Form state
const formData = ref<Partial<JobApplication>>({});
const isEditing = ref(false);
const isSaving = ref(false);

// Notes and Communications state
const isAddingNote = ref(false);
const isAddingCommunication = ref(false);
const newNote = ref({
  content: '',
  type: 'general' as Note['type'],
});
const newCommunication = ref({
  type: 'email' as Communication['type'],
  direction: 'outbound' as Communication['direction'],
  subject: '',
  content: '',
  contactPerson: '',
});

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
      formData.value = {
        ...newApp,
        stageHistory: [...newApp.stageHistory],
        notes: [...newApp.notes],
        communications: [...newApp.communications],
        tags: [...newApp.tags],
      };
      isEditing.value = false;
    }
  },
  { immediate: true }
);

// Form validation
const isFormValid = computed(() => {
  return formData.value.title?.trim() && formData.value.company?.trim();
});

// Sorted arrays for display (most recent first)
const sortedStageHistory = computed(() => {
  if (!selectedJobApplication.value?.stageHistory) return [];
  return [...selectedJobApplication.value.stageHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
});

const sortedNotes = computed(() => {
  if (!selectedJobApplication.value?.notes) return [];
  return [...selectedJobApplication.value.notes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
});

const sortedCommunications = computed(() => {
  if (!selectedJobApplication.value?.communications) return [];
  return [...selectedJobApplication.value.communications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
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
    toast.add({
      title: 'Success',
      description: 'Job application updated successfully',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to save job application:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to save job application',
      color: 'error',
    });
  } finally {
    isSaving.value = false;
  }
}

function handleCancel() {
  if (selectedJobApplication.value) {
    formData.value = {
      ...selectedJobApplication.value,
      stageHistory: [...selectedJobApplication.value.stageHistory],
      notes: [...selectedJobApplication.value.notes],
      communications: [...selectedJobApplication.value.communications],
      tags: [...selectedJobApplication.value.tags],
    };
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
    low: 'neutral' as const,
    medium: 'warning' as const,
    high: 'error' as const,
  };
  return colors[priority];
}

// Notes functionality
async function handleAddNote() {
  if (!selectedJobApplicationId.value || !newNote.value.content.trim()) return;

  try {
    const noteData = {
      content: newNote.value.content.trim(),
      type: newNote.value.type,
      timestamp: new Date(),
      id: crypto.randomUUID(),
    };

    // Update the job application with the new note
    const currentApp = selectedJobApplication.value;
    if (currentApp) {
      const updatedNotes = [...currentApp.notes, noteData];
      await jobApplicationStore.updateJobApplication(
        selectedJobApplicationId.value,
        {
          notes: updatedNotes,
        }
      );
    }

    // Reset form
    newNote.value = {
      content: '',
      type: 'general',
    };
    isAddingNote.value = false;

    toast.add({
      title: 'Success',
      description: 'Note added successfully',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to add note:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to add note',
      color: 'error',
    });
  }
}

function cancelAddNote() {
  newNote.value = {
    content: '',
    type: 'general',
  };
  isAddingNote.value = false;
}

// Communications functionality
async function handleAddCommunication() {
  if (!selectedJobApplicationId.value || !newCommunication.value.content.trim())
    return;

  try {
    const communicationData = {
      id: crypto.randomUUID(),
      type: newCommunication.value.type,
      direction: newCommunication.value.direction,
      subject: newCommunication.value.subject.trim() || undefined,
      content: newCommunication.value.content.trim(),
      contactPerson: newCommunication.value.contactPerson.trim() || undefined,
      timestamp: new Date(),
    };

    // Update the job application with the new communication
    const currentApp = selectedJobApplication.value;
    if (currentApp) {
      const updatedCommunications = [
        ...currentApp.communications,
        communicationData,
      ];
      await jobApplicationStore.updateJobApplication(
        selectedJobApplicationId.value,
        {
          communications: updatedCommunications,
        }
      );
    }

    // Reset form
    newCommunication.value = {
      type: 'email',
      direction: 'outbound',
      subject: '',
      content: '',
      contactPerson: '',
    };
    isAddingCommunication.value = false;

    toast.add({
      title: 'Success',
      description: 'Communication added successfully',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to add communication:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to add communication',
      color: 'error',
    });
  }
}

function cancelAddCommunication() {
  newCommunication.value = {
    type: 'email',
    direction: 'outbound',
    subject: '',
    content: '',
    contactPerson: '',
  };
  isAddingCommunication.value = false;
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      class="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-700"
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
    <div class="flex-1 overflow-y-auto px-4 py-4 min-h-0">
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
              v-for="transition in sortedStageHistory"
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
                :datetime="new Date(transition.timestamp).toISOString()"
                class="text-xs text-gray-500"
              >
                {{ formatTimeAgo(new Date(transition.timestamp)) }}
              </time>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-medium">Notes</h3>
            <UButton
              v-if="!isAddingNote"
              icon="i-lucide-plus"
              size="sm"
              variant="ghost"
              @click="isAddingNote = true"
            >
              Add Note
            </UButton>
          </div>

          <!-- Add Note Form -->
          <div v-if="isAddingNote" class="mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Note Type
                </label>
                <USelect
                  v-model="newNote.type"
                  :options="[
                    { label: 'General', value: 'general' },
                    { label: 'Interview', value: 'interview' },
                    { label: 'Research', value: 'research' },
                    { label: 'Follow Up', value: 'follow_up' },
                  ]"
                  option-attribute="label"
                  value-attribute="value"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <UTextarea
                  v-model="newNote.content"
                  placeholder="Enter your note..."
                  :rows="3"
                />
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  size="sm"
                  :disabled="!newNote.content.trim()"
                  @click="handleAddNote"
                >
                  Add Note
                </UButton>
                <UButton size="sm" variant="ghost" @click="cancelAddNote">
                  Cancel
                </UButton>
              </div>
            </div>
          </div>

          <!-- Notes List -->
          <div v-if="sortedNotes.length > 0" class="space-y-2">
            <div
              v-for="note in sortedNotes"
              :key="note.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <UBadge
                  :color="note.type === 'interview' ? 'info' : 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ note.type }}
                </UBadge>
                <time
                  :datetime="new Date(note.timestamp).toISOString()"
                  class="text-xs text-gray-500"
                >
                  {{ formatTimeAgo(new Date(note.timestamp)) }}
                </time>
              </div>
              <p class="text-sm whitespace-pre-wrap">
                {{ note.content }}
              </p>
            </div>
          </div>
          <p v-else-if="!isAddingNote" class="text-sm text-gray-500">
            No notes yet
          </p>
        </div>

        <!-- Communications Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-medium">Communications</h3>
            <UButton
              v-if="!isAddingCommunication"
              icon="i-lucide-plus"
              size="sm"
              variant="ghost"
              @click="isAddingCommunication = true"
            >
              Add Communication
            </UButton>
          </div>

          <!-- Add Communication Form -->
          <div
            v-if="isAddingCommunication"
            class="mb-4 p-4 bg-gray-50 rounded-lg"
          >
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <USelect
                    v-model="newCommunication.type"
                    :options="[
                      { label: 'Email', value: 'email' },
                      { label: 'Phone', value: 'phone' },
                      { label: 'Meeting', value: 'meeting' },
                      { label: 'Message', value: 'message' },
                    ]"
                    option-attribute="label"
                    value-attribute="value"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Direction
                  </label>
                  <USelect
                    v-model="newCommunication.direction"
                    :options="[
                      { label: 'Outbound', value: 'outbound' },
                      { label: 'Inbound', value: 'inbound' },
                    ]"
                    option-attribute="label"
                    value-attribute="value"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person (Optional)
                </label>
                <UInput
                  v-model="newCommunication.contactPerson"
                  placeholder="e.g., John Smith, HR Manager"
                />
              </div>
              <div v-if="newCommunication.type === 'email'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Subject (Optional)
                </label>
                <UInput
                  v-model="newCommunication.subject"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <UTextarea
                  v-model="newCommunication.content"
                  placeholder="Enter communication details..."
                  :rows="4"
                />
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  size="sm"
                  :disabled="!newCommunication.content.trim()"
                  @click="handleAddCommunication"
                >
                  Add Communication
                </UButton>
                <UButton
                  size="sm"
                  variant="ghost"
                  @click="cancelAddCommunication"
                >
                  Cancel
                </UButton>
              </div>
            </div>
          </div>

          <!-- Communications List -->
          <div v-if="sortedCommunications.length > 0" class="space-y-2">
            <div
              v-for="comm in sortedCommunications"
              :key="comm.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="comm.direction === 'outbound' ? 'success' : 'info'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ comm.direction }} {{ comm.type }}
                  </UBadge>
                  <span v-if="comm.contactPerson" class="text-xs text-gray-600">
                    {{ comm.contactPerson }}
                  </span>
                </div>
                <time
                  :datetime="new Date(comm.timestamp).toISOString()"
                  class="text-xs text-gray-500"
                >
                  {{ formatTimeAgo(new Date(comm.timestamp)) }}
                </time>
              </div>
              <p v-if="comm.subject" class="text-sm font-medium mb-1">
                {{ comm.subject }}
              </p>
              <p class="text-sm whitespace-pre-wrap">
                {{ comm.content }}
              </p>
            </div>
          </div>
          <p v-else-if="!isAddingCommunication" class="text-sm text-gray-500">
            No communications yet
          </p>
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

      <!-- Loading/Debug state -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-8 space-y-4"
      >
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
        <div class="text-center text-sm text-gray-500 space-y-1">
          <p>
            <strong>Selected ID:</strong>
            {{ selectedJobApplicationId || 'None' }}
          </p>
          <p>
            <strong>Total Applications:</strong>
            {{ jobApplicationStore.jobApplications.length }}
          </p>
          <p><strong>Loading:</strong> {{ jobApplicationStore.loading }}</p>
          <p>
            <strong>Error:</strong> {{ jobApplicationStore.error || 'None' }}
          </p>
          <div v-if="jobApplicationStore.jobApplications.length > 0">
            <p><strong>Available IDs:</strong></p>
            <div class="text-xs">
              {{
                jobApplicationStore.jobApplications
                  .map((app) => app.id)
                  .join(', ')
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
