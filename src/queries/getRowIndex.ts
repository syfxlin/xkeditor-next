export default function getRowIndex(selection: any) {
  const isRowSelection = selection.isRowSelection && selection.isRowSelection();
  if (!isRowSelection) return undefined;

  const path = selection.$from.path;
  return path[path.length - 8];
}
