// Upload family — three composites that share a single state model
// (see `./shared/`). Mirrors Ant Design's <Upload> API so callers
// switching from antd have a one-to-one mental model.
//
//   <Upload>          — generic single / multiple file upload.
//   <ImageUpload>     — image gallery with picture-card listType
//                       and an optional crop step.
//   <AvatarUploader>  — single image + required crop, pre-configured
//                       round crop, idle → cropping → uploading flow.

export { Upload } from "./Upload";
export { ImageUpload } from "./ImageUpload";
export { AvatarUploader } from "./AvatarUploader";
export {
  MediaUpload,
  MediaUploadSingle,
  MediaUploadMultiple,
  MediaUploadAvatar,
} from "./MediaUpload";

export type {
  UploadFile,
  UploadStatus,
  UploadListType,
  UploadRequestParams,
  UploadCustomRequest,
  UploadLabels,
  UploadProps,
} from "./shared/types";

export type { ImageUploadProps } from "./ImageUpload";
export type {
  AvatarUploaderProps,
  AvatarUploaderLabels,
  AvatarUploadCallbackParams,
} from "./AvatarUploader";
export type {
  MediaUploadSingleProps,
  MediaUploadMultipleProps,
  MediaUploadAvatarProps,
  MediaUploadSize,
  MediaUploadShape,
} from "./MediaUpload";
