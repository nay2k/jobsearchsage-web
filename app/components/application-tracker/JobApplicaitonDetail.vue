<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core';
import {
  PIPELINE_STAGES,
  type JobApplication,
  type PipelineStage,
  type Note,
  type Communication,
} from '#shared/types/job-tracker';

const {
  selectedJobApplicationId,
  closeJobApplicationSlideover,
  isCreatingNew,
} = useJobApplicationTracker();

// Props and emits
const props = defineProps<{
  selectedJobApplication: JobApplication | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'job-created': [
    jobData: Omit<JobApplication, 'id' | 'dateAdded' | 'stageHistory'>
  ];
  'job-updated': [jobId: string, updates: Partial<JobApplication>];
  'job-deleted': [jobId: string];
  'note-added': [
    jobId: string,
    noteData: { content: string; type: Note['type'] }
  ];
  'communication-added': [
    jobId: string,
    commData: {
      type: Communication['type'];
      direction: Communication['direction'];
      subject?: string;
      content: string;
      contactPerson?: string;
    }
  ];
  close: [];
}>();

// Form state
const formData = ref<Partial<JobApplication>>({});
const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const showDeleteConfirm = ref(false);

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

// Get selected job application or create a draft for new applications
const selectedJobApplication = computed(() => {
  if (isCreatingNew.value) {
    // Return a draft job application for new creation
    return {
      id: 'draft',
      title: '',
      company: '',
      location: '',
      url: '',
      description: '',
      salaryRange: '',
      applicationDeadline: undefined,
      stage: 'researched' as PipelineStage,
      dateAdded: new Date(),
      stageHistory: [],
      notes: [],
      communications: [],
      tags: [],
      priority: 'medium' as const,
      source: 'Manual Entry',
    } as JobApplication;
  }

  return props.selectedJobApplication;
});

// Watch for changes in selected job application
watch(
  selectedJobApplication,
  (newApp) => {
    console.log('selectedJobApplication changed:', newApp);
    if (newApp) {
      console.log('Notes:', newApp.notes);
      console.log('Communications:', newApp.communications);
      console.log('StageHistory:', newApp.stageHistory);

      formData.value = {
        ...newApp,
        stageHistory: [...newApp.stageHistory],
        notes: [...newApp.notes],
        communications: [...newApp.communications],
        tags: [...newApp.tags],
      };

      // Auto-enter edit mode for new job applications
      isEditing.value =
        isCreatingNew.value ||
        (newApp.title === 'New Job Application' &&
          newApp.company === 'Company Name');
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
  if (!isFormValid.value) return;

  isSaving.value = true;
  try {
    if (isCreatingNew.value) {
      // Emit job creation event
      emit('job-created', {
        title: formData.value.title!,
        company: formData.value.company!,
        location: formData.value.location,
        url: formData.value.url,
        description: formData.value.description,
        salaryRange: formData.value.salaryRange,
        applicationDeadline: formData.value.applicationDeadline,
        tags: formData.value.tags || [],
        priority: formData.value.priority || 'medium',
        source: formData.value.source || 'Manual Entry',
        stage: formData.value.stage || 'researched',
        notes: formData.value.notes || [],
        communications: formData.value.communications || [],
      });

      // Close the slideover after emitting creation event
      closeJobApplicationSlideover();
    } else if (props.selectedJobApplication?.id) {
      // Clean the form data before emitting
      const cleanFormData = {
        title: formData.value.title,
        company: formData.value.company,
        location: formData.value.location,
        url: formData.value.url,
        description: formData.value.description,
        salaryRange: formData.value.salaryRange,
        applicationDeadline: formData.value.applicationDeadline,
        priority: formData.value.priority,
        source: formData.value.source,
        stage: formData.value.stage,
        tags: formData.value.tags,
      };

      // Emit job update event
      emit('job-updated', props.selectedJobApplication.id, cleanFormData);
      isEditing.value = false;
    }
  } catch (error) {
    console.error('Failed to save job application:', error);
  } finally {
    isSaving.value = false;
  }
}

function handleDeleteClick() {
  if (!showDeleteConfirm.value) {
    // First click - show confirmation
    showDeleteConfirm.value = true;
    // Auto-hide confirmation after 3 seconds
    setTimeout(() => {
      showDeleteConfirm.value = false;
    }, 3000);
  } else {
    // Second click - actually delete
    handleDelete();
  }
}

async function handleDelete() {
  if (!props.selectedJobApplication?.id || isCreatingNew.value) return;

  isDeleting.value = true;
  try {
    // Emit job deletion event
    emit('job-deleted', props.selectedJobApplication.id);

    // Close the panel after emitting deletion event
    closeJobApplicationSlideover();
  } catch (error) {
    console.error('Failed to delete job application:', error);
  } finally {
    isDeleting.value = false;
    showDeleteConfirm.value = false;
  }
}

function handleCancel() {
  if (isCreatingNew.value) {
    // Close the slideover when canceling new job application creation
    closeJobApplicationSlideover();
  } else if (selectedJobApplication.value) {
    // Reset form data for existing job applications
    formData.value = {
      ...selectedJobApplication.value,
      stageHistory: [...selectedJobApplication.value.stageHistory],
      notes: [...selectedJobApplication.value.notes],
      communications: [...selectedJobApplication.value.communications],
      tags: [...selectedJobApplication.value.tags],
    };
    isEditing.value = false;
  }
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
  if (isCreatingNew.value) {
    // For new job applications, just add to the form data
    const noteData = {
      content: newNote.value.content.trim(),
      type: newNote.value.type,
      timestamp: new Date(),
      id: crypto.randomUUID(),
    };

    formData.value.notes = [...(formData.value.notes || []), noteData];

    // Reset form
    newNote.value = {
      content: '',
      type: 'general',
    };
    isAddingNote.value = false;
    return;
  }

  if (!props.selectedJobApplication?.id || !newNote.value.content.trim())
    return;

  try {
    // Emit note addition event
    emit('note-added', props.selectedJobApplication.id, {
      content: newNote.value.content.trim(),
      type: newNote.value.type,
    });

    // Reset form
    newNote.value = {
      content: '',
      type: 'general',
    };
    isAddingNote.value = false;
  } catch (error) {
    console.error('Failed to add note:', error);
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
  if (isCreatingNew.value) {
    // For new job applications, just add to the form data
    const communicationData = {
      id: crypto.randomUUID(),
      type: newCommunication.value.type,
      direction: newCommunication.value.direction,
      subject: newCommunication.value.subject.trim() || undefined,
      content: newCommunication.value.content.trim(),
      contactPerson: newCommunication.value.contactPerson.trim() || undefined,
      timestamp: new Date(),
    };

    formData.value.communications = [
      ...(formData.value.communications || []),
      communicationData,
    ];

    // Reset form
    newCommunication.value = {
      type: 'email',
      direction: 'outbound',
      subject: '',
      content: '',
      contactPerson: '',
    };
    isAddingCommunication.value = false;
    return;
  }

  if (
    !props.selectedJobApplication?.id ||
    !newCommunication.value.content.trim()
  )
    return;

  try {
    // Emit communication addition event
    emit('communication-added', props.selectedJobApplication.id, {
      type: newCommunication.value.type,
      direction: newCommunication.value.direction,
      subject: newCommunication.value.subject.trim() || undefined,
      content: newCommunication.value.content.trim(),
      contactPerson: newCommunication.value.contactPerson.trim() || undefined,
    });

    // Reset form
    newCommunication.value = {
      type: 'email',
      direction: 'outbound',
      subject: '',
      content: '',
      contactPerson: '',
    };
    isAddingCommunication.value = false;
  } catch (error) {
    console.error('Failed to add communication:', error);
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

function handleClose() {
  emit('close');
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="p-2 border-b border-gray-200">
      <div class="flex justify-end">
        <div class="flex gap-2">
          <!-- Edit/Delete buttons in header -->
          <template v-if="!isEditing">
            <UButton
              icon="i-lucide-edit"
              size="sm"
              variant="ghost"
              color="gray"
              @click="isEditing = true"
            >
              Edit
            </UButton>
            <UButton
              v-if="!isCreatingNew"
              :icon="
                showDeleteConfirm ? 'i-lucide-alert-triangle' : 'i-lucide-trash'
              "
              size="sm"
              variant="ghost"
              color="gray"
              :loading="isDeleting"
              @click="handleDeleteClick"
            >
              {{ showDeleteConfirm ? 'Delete?' : 'Delete' }}
            </UButton>
          </template>
          <template v-else>
            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              :loading="isSaving"
              :disabled="!isFormValid"
              @click="handleSave"
            >
              {{ isCreatingNew ? 'Create' : 'Save' }}
            </UButton>
            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              @click="handleCancel"
            >
              Cancel
            </UButton>
          </template>
          <UButton
            icon="i-lucide-star"
            size="sm"
            variant="ghost"
            color="gray"
          />
          <UButton
            icon="i-lucide-x"
            size="sm"
            variant="ghost"
            color="gray"
            @click="handleClose"
          />
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-auto">
      <div v-if="selectedJobApplication" class="px-6 py-6">
        <!-- Job Title -->
        <div class="mb-6">
          <h1 class="text-2xl font-semibold text-gray-900 mb-2">
            {{
              isCreatingNew
                ? 'New Job Application'
                : selectedJobApplication?.title || 'Job Application'
            }}
          </h1>
          <p class="text-gray-600">
            {{
              isCreatingNew
                ? 'Enter company details below'
                : selectedJobApplication?.company
            }}
          </p>
        </div>

        <!-- Job Details Grid -->
        <div class="grid grid-cols-1 gap-6 mb-8">
          <!-- Job Title -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">Title</div>
            <div class="flex-1">
              <UInput
                v-if="isEditing"
                v-model="formData.title"
                placeholder="Enter job title"
                class="max-w-md"
              />
              <div v-else class="text-gray-900">
                {{ selectedJobApplication.title }}
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">Status</div>
            <div class="flex-1">
              <div v-if="isEditing">
                <USelect
                  v-model="formData.stage"
                  :items="
                    PIPELINE_STAGES.map((stage) => ({
                      label: getStageLabel(stage),
                      value: stage,
                    }))
                  "
                  class="w-48"
                />
              </div>
              <div v-else class="flex items-center gap-2">
                <div
                  class="flex items-center gap-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm"
                >
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  {{ getStageLabel(selectedJobApplication.stage) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Company -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">Company</div>
            <div class="flex-1">
              <UInput
                v-if="isEditing"
                v-model="formData.company"
                placeholder="Enter company name"
                class="max-w-md"
              />
              <div v-else class="text-gray-900">
                {{ selectedJobApplication.company }}
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">Location</div>
            <div class="flex-1">
              <UInput
                v-if="isEditing"
                v-model="formData.location"
                placeholder="Enter location"
                class="max-w-md"
              />
              <div v-else class="text-gray-900">
                {{ selectedJobApplication.location || 'Not specified' }}
              </div>
            </div>
          </div>

          <!-- Salary -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">Salary</div>
            <div class="flex-1">
              <UInput
                v-if="isEditing"
                v-model="formData.salaryRange"
                placeholder="e.g., $80,000 - $100,000"
                class="max-w-md"
              />
              <div v-else class="text-gray-900">
                {{ selectedJobApplication.salaryRange || 'Not specified' }}
              </div>
            </div>
          </div>

          <!-- Due Date -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">Due date</div>
            <div class="flex-1">
              <UInput
                v-if="isEditing"
                v-model="formData.applicationDeadline"
                type="date"
                class="max-w-md"
              />
              <div v-else class="text-gray-900">
                {{
                  selectedJobApplication.applicationDeadline
                    ? formatDate(selectedJobApplication.applicationDeadline)
                    : 'Not specified'
                }}
              </div>
            </div>
          </div>

          <!-- Priority -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">Priority</div>
            <div class="flex-1">
              <div v-if="isEditing">
                <USelect
                  v-model="formData.priority"
                  :items="[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                  ]"
                  class="w-48"
                />
              </div>
              <div v-else>
                <UBadge
                  :color="getPriorityColor(selectedJobApplication.priority)"
                  variant="subtle"
                  size="sm"
                >
                  {{ selectedJobApplication.priority }} priority
                </UBadge>
              </div>
            </div>
          </div>

          <!-- Source -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">Source</div>
            <div class="flex-1">
              <UInput
                v-if="isEditing"
                v-model="formData.source"
                placeholder="e.g., LinkedIn, Company Website"
                class="max-w-md"
              />
              <div v-else class="text-gray-900">
                {{ selectedJobApplication.source || 'Not specified' }}
              </div>
            </div>
          </div>

          <!-- URL -->
          <div class="flex items-center">
            <div class="w-20 text-sm font-medium text-gray-500">URL</div>
            <div class="flex-1">
              <UInput
                v-if="isEditing"
                v-model="formData.url"
                placeholder="https://..."
                class="max-w-md"
              />
              <div v-else>
                <ULink
                  v-if="selectedJobApplication.url"
                  :to="selectedJobApplication.url"
                  target="_blank"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Original Posting
                  <UIcon
                    name="i-lucide-external-link"
                    class="w-3 h-3 ml-1 inline"
                  />
                </ULink>
                <span v-else class="text-gray-500 text-sm"
                  >No URL provided</span
                >
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="flex">
            <div class="w-20 text-sm font-medium text-gray-500 pt-2">
              Description
            </div>
            <div class="flex-1">
              <UTextarea
                v-if="isEditing"
                v-model="formData.description"
                placeholder="Enter job description or requirements"
                :rows="4"
                class="max-w-2xl"
              />
              <div v-else class="text-gray-900 text-sm">
                <p
                  v-if="selectedJobApplication.description"
                  class="whitespace-pre-wrap"
                >
                  {{ selectedJobApplication.description }}
                </p>
                <span v-else class="text-gray-500"
                  >No description provided</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->

      <!-- Tabs Section -->
      <div class="">
        <div v-if="!isCreatingNew">
          <UTabs
            :items="[
              {
                slot: 'notes',
                label: `Notes`,
                icon: 'i-lucide-sticky-note',
                badge:
                  sortedNotes.length > 0
                    ? sortedNotes.length.toString()
                    : undefined,
              },
              {
                slot: 'activity',
                label: `Activity`,
                icon: 'i-lucide-activity',
                badge:
                  sortedStageHistory.length > 0
                    ? sortedStageHistory.length.toString()
                    : undefined,
              },
              {
                slot: 'communications',
                label: `Communications`,
                icon: 'i-lucide-message-circle',
                badge:
                  sortedCommunications.length > 0
                    ? sortedCommunications.length.toString()
                    : undefined,
              },
            ]"
            variant="link"
            class="w-full"
          >
            <!-- Notes Tab -->
            <template #notes>
              <div class="p-4">
                <!-- Add Note Form -->
                <div v-if="isAddingNote" class="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div class="space-y-3">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Note Type
                      </label>
                      <USelect
                        v-model="newNote.type"
                        :items="[
                          { label: 'General', value: 'general' },
                          { label: 'Interview', value: 'interview' },
                          { label: 'Research', value: 'research' },
                          { label: 'Follow Up', value: 'follow_up' },
                        ]"
                        class="w-48"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
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

                <!-- Add Note Button -->
                <div v-if="!isAddingNote" class="mb-4">
                  <UButton
                    icon="i-lucide-plus"
                    size="sm"
                    variant="outline"
                    @click="isAddingNote = true"
                  >
                    Add Note
                  </UButton>
                </div>

                <!-- Notes List -->
                <div v-if="sortedNotes.length > 0" class="space-y-4">
                  <div
                    v-for="note in sortedNotes"
                    :key="note.id"
                    class="flex gap-3"
                  >
                    <div
                      class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <div class="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-medium text-gray-900"
                          >Note</span
                        >
                        <UBadge
                          :color="note.type === 'interview' ? 'blue' : 'gray'"
                          variant="subtle"
                          size="sm"
                        >
                          {{ note.type }}
                        </UBadge>
                        <span class="text-xs text-gray-500">
                          {{ formatTimeAgo(new Date(note.timestamp)) }}
                        </span>
                      </div>
                      <div class="bg-gray-50 rounded-lg p-3">
                        <p class="text-sm text-gray-900 whitespace-pre-wrap">
                          {{ note.content }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="!isAddingNote" class="text-center py-8">
                  <UIcon
                    name="i-lucide-sticky-note"
                    class="w-8 h-8 text-gray-400 mx-auto mb-2"
                  />
                  <p class="text-sm text-gray-500">No notes yet</p>
                </div>
              </div>
            </template>

            <!-- Activity Tab -->
            <template #activity>
              <div class="p-4">
                <div v-if="sortedStageHistory.length > 0" class="space-y-4">
                  <div
                    v-for="transition in sortedStageHistory"
                    :key="transition.id"
                    class="flex gap-3"
                  >
                    <div
                      class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <UIcon
                        name="i-lucide-arrow-right"
                        class="w-3 h-3 text-blue-600"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-medium text-gray-900"
                          >Status Changed</span
                        >
                        <span class="text-xs text-gray-500">
                          {{ formatTimeAgo(new Date(transition.timestamp)) }}
                        </span>
                      </div>
                      <div class="bg-gray-50 rounded-lg p-3">
                        <p class="text-sm text-gray-900">
                          {{
                            transition.fromStage
                              ? getStageLabel(transition.fromStage)
                              : 'Initial'
                          }}
                          →
                          {{ getStageLabel(transition.toStage) }}
                        </p>
                        <p
                          v-if="transition.notes"
                          class="text-sm text-gray-600 mt-1"
                        >
                          {{ transition.notes }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <UIcon
                    name="i-lucide-activity"
                    class="w-8 h-8 text-gray-400 mx-auto mb-2"
                  />
                  <p class="text-sm text-gray-500">No activity yet</p>
                </div>
              </div>
            </template>

            <!-- Communications Tab -->
            <template #communications>
              <div class="p-4">
                <!-- Add Communication Form -->
                <div
                  v-if="isAddingCommunication"
                  class="mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Type
                        </label>
                        <USelect
                          v-model="newCommunication.type"
                          :items="[
                            { label: 'Email', value: 'email' },
                            { label: 'Phone', value: 'phone' },
                            { label: 'Meeting', value: 'meeting' },
                            { label: 'Message', value: 'message' },
                          ]"
                        />
                      </div>
                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Direction
                        </label>
                        <USelect
                          v-model="newCommunication.direction"
                          :items="[
                            { label: 'Outbound', value: 'outbound' },
                            { label: 'Inbound', value: 'inbound' },
                          ]"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contact Person (Optional)
                      </label>
                      <UInput
                        v-model="newCommunication.contactPerson"
                        placeholder="e.g., John Smith, HR Manager"
                      />
                    </div>
                    <div v-if="newCommunication.type === 'email'">
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subject (Optional)
                      </label>
                      <UInput
                        v-model="newCommunication.subject"
                        placeholder="Email subject"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
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

                <!-- Add Communication Button -->
                <div v-if="!isAddingCommunication" class="mb-4">
                  <UButton
                    icon="i-lucide-plus"
                    size="sm"
                    variant="outline"
                    @click="isAddingCommunication = true"
                  >
                    Add Communication
                  </UButton>
                </div>

                <!-- Communications List -->
                <div v-if="sortedCommunications.length > 0" class="space-y-4">
                  <div
                    v-for="comm in sortedCommunications"
                    :key="comm.id"
                    class="flex gap-3"
                  >
                    <div
                      class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <UIcon
                        :name="
                          comm.type === 'email'
                            ? 'i-lucide-mail'
                            : comm.type === 'phone'
                            ? 'i-lucide-phone'
                            : 'i-lucide-message-circle'
                        "
                        class="w-3 h-3 text-purple-600"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-medium text-gray-900">
                          {{ comm.contactPerson || 'Communication' }}
                        </span>
                        <UBadge
                          :color="
                            comm.direction === 'outbound' ? 'green' : 'blue'
                          "
                          variant="subtle"
                          size="sm"
                        >
                          {{ comm.direction }} {{ comm.type }}
                        </UBadge>
                        <span class="text-xs text-gray-500">
                          {{ formatTimeAgo(new Date(comm.timestamp)) }}
                        </span>
                      </div>
                      <div class="bg-gray-50 rounded-lg p-3">
                        <p
                          v-if="comm.subject"
                          class="text-sm font-medium text-gray-900 mb-1"
                        >
                          {{ comm.subject }}
                        </p>
                        <p class="text-sm text-gray-900 whitespace-pre-wrap">
                          {{ comm.content }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="!isAddingCommunication"
                  class="text-center py-8"
                >
                  <UIcon
                    name="i-lucide-message-circle"
                    class="w-8 h-8 text-gray-400 mx-auto mb-2"
                  />
                  <p class="text-sm text-gray-500">No communications yet</p>
                </div>
              </div>
            </template>
          </UTabs>
        </div>
      </div>

      <!-- Loading/Debug state -->
      <div
        v-if="props.loading"
        class="flex flex-col items-center justify-center py-8 space-y-4"
      >
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
        <p class="text-sm text-gray-500">
          {{ loading ? 'Loading...' : 'No job application selected' }}
        </p>
      </div>
    </div>
  </div>
</template>
