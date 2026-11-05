if (typeof window !== 'undefined') {
  if (!window.DragEvent) {
    window.DragEvent = class DragEvent extends window.MouseEvent {};
  }
}
