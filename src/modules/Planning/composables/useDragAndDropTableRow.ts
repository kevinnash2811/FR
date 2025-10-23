import { ref } from "vue";

export const useDragAndDropTableRow = (
  swap: (from: number, to: number) => void
) => {
  const draggedIndex = ref<number>();
  const overIndex = ref<number>();
  const startX = ref(0);
  const startY = ref(0);
  const isDragging = ref(false);

  const onDragStart = (index: number, e: Event) => {
    document.body.style.cursor = "grabbing";
    draggedIndex.value = index;

    if (e.type === "dragstart") {
      const event = e as DragEvent;
      
      if (event.dataTransfer) {
        event.dataTransfer.setData("text", index.toString());
        event.dataTransfer.dropEffect = "move";
      } else {
        alert("dataTransfer not supported");
      }
    }

    if (e.type === "touchstart") {
      const touch = (e as TouchEvent).touches[0];
      startX.value = touch.clientX;
      startY.value = touch.clientY;
    }
  };

  const onDragEnd = () => {
    draggedIndex.value = undefined;
    overIndex.value = undefined;
    isDragging.value = false;
    document.body.style.cursor = "auto";
  };

  const onDragOver = (index: number, e: Event) => {
    e.preventDefault();
    overIndex.value = index;
  };

  const onDrop = (index: number, e: Event) => {
    e.preventDefault();
    if (draggedIndex.value === void 0) return;
    swap(draggedIndex.value, index);
    onDragEnd();
  };

  return {
    draggedIndex,
    overIndex,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
  };
};
