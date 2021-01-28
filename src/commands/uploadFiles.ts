import { EditorView } from "prosemirror-view";
import { Attrs } from "../lib/Extension";
import uploadPlaceholder, { findPlaceholder } from "../lib/uploadPlaceholder";
import toast from "react-hot-toast";
import i18n from "../i18n";

export type UploadResponse = {
  error: boolean;
  message: string;
  code: number;
  data: {
    extname: string;
    filename: string;
    key: string;
    md5: string;
    size: number;
    url: string;
  }[];
};

export type UploadFilesOptions = {
  onStart?: () => void;
  onStop?: () => void;
  upload?: (files: File[]) => Promise<UploadResponse>;
  files: File[];
  view: EditorView;
  pos: number;
  name: string;
  getAttrs: (res: UploadResponse) => Attrs;
  placeholder?: (root: HTMLElement, meta: any) => void;
  event?: Event;
};

const uploadFiles = ({
  onStart,
  onStop,
  upload,
  files,
  view,
  pos,
  name,
  getAttrs,
  placeholder,
  event
}: UploadFilesOptions) => {
  if (!upload) {
    console.warn("需要设置 Upload 属性");
    return;
  }
  if (event) {
    event.preventDefault();
  }
  if (onStart) {
    onStart();
  }
  const { schema } = view.state;
  const id = {};
  if (placeholder) {
    view.dispatch(
      view.state.tr.setMeta(uploadPlaceholder, {
        add: { id, files, pos, placeholder }
      })
    );
  }
  upload(files)
    .then(res => {
      let pPos = pos;
      if (placeholder) {
        pPos = findPlaceholder(view.state, id);
        if (pPos === null) return;
      }
      const tr = view.state.tr.replaceWith(
        pPos,
        pPos,
        schema.nodes[name].create(getAttrs(res))
      );
      if (placeholder) {
        tr.setMeta(uploadPlaceholder, { remove: { id } });
      }
      view.dispatch(tr);
    })
    .catch(err => {
      console.error(err);
      if (placeholder) {
        const tr = view.state.tr.setMeta(uploadPlaceholder, {
          remove: { id }
        });
        view.dispatch(tr);
      }
      toast.error(i18n.t("抱歉，上传时发生错误") as string);
    })
    .finally(() => {
      if (onStop) {
        onStop();
      }
    });
};

export default uploadFiles;
