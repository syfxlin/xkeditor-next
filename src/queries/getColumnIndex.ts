export default function getColumnIndex(selection: any) {
  const isColSelection = selection.isColSelection && selection.isColSelection();
  if (!isColSelection) return undefined;

  const path = selection.$from.path;
  return path[path.length - 5];
}
